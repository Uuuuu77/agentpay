"use client"

import { cn } from "@/lib/utils"

interface ResponsiveContainerProps {
  children: React.ReactNode
  className?: string
}

export function ResponsiveContainer({ children, className }: ResponsiveContainerProps) {
  return (
    <div className={cn(
      "w-full",
      "px-4 sm:px-6 lg:px-8",
      "max-w-7xl mx-auto",
      className
    )}>
      {children}
    </div>
  )
}