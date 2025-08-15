"use client"

import { ReactNode, useEffect, useState } from "react"

interface ClientOnlyWrapperProps {
  children: ReactNode
}

export function ClientOnlyWrapper({ children }: ClientOnlyWrapperProps) {
  const [hasMounted, setHasMounted] = useState(false)

  useEffect(() => {
    setHasMounted(true)
  }, [])

  if (!hasMounted) {
    return null
  }

  return <>{children}</>
}