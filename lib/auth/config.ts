import type { NextAuthOptions } from "next-auth"
import CredentialsProvider from "next-auth/providers/credentials"
import { SiweMessage } from "siwe"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"

const sql = neon(process.env.DATABASE_URL!)

export const authOptions: NextAuthOptions = {
  providers: [
    // Web3 wallet authentication with SIWE
    CredentialsProvider({
      id: "web3",
      name: "Web3 Wallet",
      credentials: {
        message: { label: "Message", type: "text" },
        signature: { label: "Signature", type: "text" },
        address: { label: "Address", type: "text" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.message || !credentials?.signature) {
            return null
          }

          const siwe = new SiweMessage(JSON.parse(credentials.message))
          const result = await siwe.verify({ signature: credentials.signature })

          if (!result.success) {
            return null
          }

          // Check if user exists or create new user
          const user = await sql`
            SELECT u.*, array_agg(
              json_build_object(
                'address', uw.wallet_address,
                'chain', uw.chain,
                'is_primary', uw.is_primary
              )
            ) as wallets
            FROM users u
            LEFT JOIN user_wallets uw ON u.id = uw.user_id
            WHERE uw.wallet_address = ${siwe.address.toLowerCase()}
            GROUP BY u.id
          `

          if (user.length === 0) {
            // Create new user with wallet
            const newUser = await sql`
              INSERT INTO users (role, created_at, updated_at)
              VALUES ('customer', NOW(), NOW())
              RETURNING *
            `

            await sql`
              INSERT INTO user_wallets (user_id, wallet_address, chain, is_primary, verified_at)
              VALUES (${newUser[0].id}, ${siwe.address.toLowerCase()}, 'ethereum', true, NOW())
            `

            return {
              id: newUser[0].id.toString(),
              address: siwe.address,
              role: newUser[0].role,
              wallets: [{ address: siwe.address, chain: "ethereum", is_primary: true }],
            }
          }

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].first_name ? `${user[0].first_name} ${user[0].last_name}` : null,
            role: user[0].role,
            address: siwe.address,
            wallets: user[0].wallets,
          }
        } catch (error) {
          console.error("Web3 auth error:", error)
          return null
        }
      },
    }),

    // Email/password authentication
    CredentialsProvider({
      id: "credentials",
      name: "Email & Password",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        try {
          if (!credentials?.email || !credentials?.password) {
            return null
          }

          const user = await sql`
            SELECT * FROM users 
            WHERE email = ${credentials.email.toLowerCase()} 
            AND password_hash IS NOT NULL
            AND is_active = true
          `

          if (user.length === 0) {
            return null
          }

          const isValidPassword = await bcrypt.compare(credentials.password, user[0].password_hash)

          if (!isValidPassword) {
            return null
          }

          // Update last login
          await sql`
            UPDATE users 
            SET last_login = NOW(), updated_at = NOW()
            WHERE id = ${user[0].id}
          `

          return {
            id: user[0].id.toString(),
            email: user[0].email,
            name: user[0].first_name ? `${user[0].first_name} ${user[0].last_name}` : null,
            role: user[0].role,
            emailVerified: user[0].email_verified,
          }
        } catch (error) {
          console.error("Credentials auth error:", error)
          return null
        }
      },
    }),
  ],

  session: {
    strategy: "jwt",
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },

  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.role = user.role
        token.address = user.address
        token.wallets = user.wallets
      }
      return token
    },

    async session({ session, token }) {
      if (token) {
        session.user.id = token.sub!
        session.user.role = token.role as string
        session.user.address = token.address as string
        session.user.wallets = token.wallets as any[]
      }
      return session
    },
  },

  pages: {
    signIn: "/auth/signin",
    signUp: "/auth/signup",
    error: "/auth/error",
  },

  secret: process.env.NEXTAUTH_SECRET,
}
