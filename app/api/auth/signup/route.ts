import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { neon } from "@neondatabase/serverless"
import { z } from "zod"

const sql = neon(process.env.DATABASE_URL!)

const signUpSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, email, password } = signUpSchema.parse(body)

    // Check if user already exists
    const existingUser = await sql`
      SELECT id FROM users WHERE email = ${email.toLowerCase()}
    `

    if (existingUser.length > 0) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 12)

    // Create user
    const newUser = await sql`
      INSERT INTO users (
        first_name, last_name, email, password_hash, 
        role, created_at, updated_at
      )
      VALUES (
        ${firstName}, ${lastName}, ${email.toLowerCase()}, ${passwordHash},
        'customer', NOW(), NOW()
      )
      RETURNING id, email, first_name, last_name, role
    `

    // TODO: Send verification email
    // await sendVerificationEmail(email, verificationToken)

    return NextResponse.json({
      message: "Account created successfully",
      user: {
        id: newUser[0].id,
        email: newUser[0].email,
        name: `${newUser[0].first_name} ${newUser[0].last_name}`,
        role: newUser[0].role,
      },
    })
  } catch (error) {
    console.error("Signup error:", error)

    if (error instanceof z.ZodError) {
      return NextResponse.json({ error: error.errors[0].message }, { status: 400 })
    }

    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
