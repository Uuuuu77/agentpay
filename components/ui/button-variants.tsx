"use client"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { forwardRef } from "react"

export const PrimaryButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, className, ...props }, ref) => {
  return (
    <Button 
      ref={ref}
      className={cn(
        "bg-gradient-orange hover:shadow-orange-lg",
        "transition-all duration-300",
        "font-semibold",
        "touch-button",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
})
PrimaryButton.displayName = "PrimaryButton"

export const SecondaryButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, className, ...props }, ref) => {
  return (
    <Button 
      ref={ref}
      variant="outline"
      className={cn(
        "border-primary text-primary hover:bg-primary/10",
        "transition-all duration-300",
        "touch-button",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
})
SecondaryButton.displayName = "SecondaryButton"

export const GhostButton = forwardRef<
  HTMLButtonElement,
  React.ComponentProps<typeof Button>
>(({ children, className, ...props }, ref) => {
  return (
    <Button 
      ref={ref}
      variant="ghost"
      className={cn(
        "hover:bg-primary/10 hover:text-primary",
        "transition-all duration-300",
        "touch-button",
        className
      )}
      {...props}
    >
      {children}
    </Button>
  )
})
GhostButton.displayName = "GhostButton"