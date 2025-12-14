"use client"

import { useState } from "react"
import Sidebar from "./sidebar"

export default function PortalLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        open={sidebarOpen}
        onToggle={() => setSidebarOpen(v => !v)}
      />

      <main
        className={`transition-all duration-300 ${
          sidebarOpen ? "pl-64" : "pl-16"
        }`}
      >
        {children}
      </main>
    </div>
  )
}
