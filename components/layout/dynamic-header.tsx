"use client"

import { useState, useEffect } from "react"
import { Header } from "./header"

export function DynamicHeader() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return <Header />
}