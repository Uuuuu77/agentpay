"use client"

import dynamic from "next/dynamic"

// Dynamically import the header to prevent SSR issues
const Header = dynamic(() => import("./header").then(mod => ({ default: mod.Header })), {
  ssr: false,
  loading: () => (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-gradient-orange rounded-lg flex items-center justify-center shadow-orange">
              <span className="text-white font-bold text-sm">AP</span>
            </div>
            <span className="font-bold text-xl">AgentPay</span>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="w-20 h-8 rounded bg-gray-200 animate-pulse" />
        </div>
      </div>
    </header>
  )
})

export { Header as DynamicHeader }