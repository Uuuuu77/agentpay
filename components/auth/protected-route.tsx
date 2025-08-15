"use client"

import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: ReactNode
  requiredRole?: string
  redirectTo?: string
}

export function ProtectedRoute({ children, requiredRole, redirectTo = "/auth/signin" }: ProtectedRouteProps) {
  const { data: session, status } = useSession()
  const router = useRouter()

  useEffect(() => {
    if (status === "loading") return // Still loading

    if (!session) {
      router.push(redirectTo)
      return
    }

    if (requiredRole && session.user.role !== requiredRole) {
      router.push("/unauthorized")
      return
    }
  }, [session, status, router, requiredRole, redirectTo])

  if (status === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!session) {
    return null
  }

  if (requiredRole && session.user.role !== requiredRole) {
    return null
  }

  return <>{children}</>
}
