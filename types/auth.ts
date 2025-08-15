import type { DefaultSession, DefaultUser } from "next-auth"

declare module "next-auth" {
  interface Session {
    user: {
      id: string
      role: string
      address?: string
      wallets?: Array<{
        address: string
        chain: string
        is_primary: boolean
      }>
    } & DefaultSession["user"]
  }

  interface User extends DefaultUser {
    role: string
    address?: string
    wallets?: Array<{
      address: string
      chain: string
      is_primary: boolean
    }>
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role: string
    address?: string
    wallets?: Array<{
      address: string
      chain: string
      is_primary: boolean
    }>
  }
}

export interface UserProfile {
  id: string
  email?: string
  firstName?: string
  lastName?: string
  role: "customer" | "admin" | "service_provider"
  avatarUrl?: string
  emailVerified: boolean
  wallets: Array<{
    address: string
    chain: string
    isPrimary: boolean
    verifiedAt?: Date
  }>
  createdAt: Date
  updatedAt: Date
  lastLogin?: Date
}
