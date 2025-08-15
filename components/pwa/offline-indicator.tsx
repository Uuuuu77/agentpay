"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { WifiOff, Wifi } from "lucide-react"

export function OfflineIndicator() {
  const [isOnline, setIsOnline] = useState(true)
  const [showIndicator, setShowIndicator] = useState(false)

  useEffect(() => {
    const updateOnlineStatus = () => {
      const online = navigator.onLine
      setIsOnline(online)

      if (!online) {
        setShowIndicator(true)
      } else {
        // Show "back online" message briefly
        if (!isOnline) {
          setShowIndicator(true)
          setTimeout(() => setShowIndicator(false), 3000)
        }
      }
    }

    // Set initial status
    updateOnlineStatus()

    // Listen for online/offline events
    window.addEventListener("online", updateOnlineStatus)
    window.addEventListener("offline", updateOnlineStatus)

    return () => {
      window.removeEventListener("online", updateOnlineStatus)
      window.removeEventListener("offline", updateOnlineStatus)
    }
  }, [isOnline])

  if (!showIndicator) return null

  return (
    <div className="fixed top-20 left-4 right-4 z-50 md:left-auto md:right-4 md:w-80">
      <Card className={`${isOnline ? "border-green-500 bg-green-50" : "border-yellow-500 bg-yellow-50"}`}>
        <CardContent className="p-3">
          <div className="flex items-center gap-2">
            {isOnline ? <Wifi className="h-4 w-4 text-green-600" /> : <WifiOff className="h-4 w-4 text-yellow-600" />}
            <span className={`text-sm font-medium ${isOnline ? "text-green-800" : "text-yellow-800"}`}>
              {isOnline ? "Back online" : "You're offline"}
            </span>
          </div>
          {!isOnline && (
            <p className="text-xs text-yellow-700 mt-1">
              Some features may be limited. Changes will sync when you're back online.
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
