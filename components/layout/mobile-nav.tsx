"use client"

import { useState } from "react"
import { Menu, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import Link from "next/link"
import { useSession } from "next-auth/react"

export function MobileNav() {
  const [open, setOpen] = useState(false)
  const { data: session } = useSession()

  const closeSheet = () => setOpen(false)

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild className="md:hidden">
        <Button variant="ghost" size="sm" className="touch-button">
          <Menu className="h-5 w-5" />
          <span className="sr-only">Open menu</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-80">
        <nav className="flex flex-col space-y-4 mt-8">
          <Link 
            href="/services" 
            className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
            onClick={closeSheet}
          >
            Services
          </Link>
          <Link 
            href="/services/consultation" 
            className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
            onClick={closeSheet}
          >
            Free AI Research
          </Link>
          <Link 
            href="/about" 
            className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
            onClick={closeSheet}
          >
            About
          </Link>
          {session ? (
            <>
              <Link 
                href="/dashboard" 
                className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
                onClick={closeSheet}
              >
                Dashboard
              </Link>
              <Link 
                href="/invoices" 
                className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
                onClick={closeSheet}
              >
                Invoices
              </Link>
            </>
          ) : (
            <Link 
              href="/auth/signin" 
              className="text-lg font-medium hover:text-primary transition-colors touch-button flex items-center py-2"
              onClick={closeSheet}
            >
              Sign In
            </Link>
          )}
          
          <div className="pt-4 mt-4 border-t">
            <Button 
              asChild 
              className="w-full bg-gradient-orange hover:shadow-orange-lg touch-button"
              onClick={closeSheet}
            >
              <Link href="/services">
                Get Started
              </Link>
            </Button>
          </div>
        </nav>
      </SheetContent>
    </Sheet>
  )
}