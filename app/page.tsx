"use client"

import { useState } from "react"
import { DashboardHeader } from "@/components/dashboard-header"
import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { ClientsSection } from "@/components/sections/clients-section"
import { WorkersSection } from "@/components/sections/workers-section"
import { IncidentsSection } from "@/components/sections/incidents-section"
import { PolesSection } from "@/components/sections/poles-section"
import { OverviewSection } from "@/components/sections/overview-section"

export default function AdminDashboard() {
  const [activeSection, setActiveSection] = useState("overview")

  return (
    <div className="flex min-h-screen bg-background">
      <DashboardSidebar activeSection={activeSection} setActiveSection={setActiveSection} />
      <div className="flex-1 flex flex-col">
        <DashboardHeader />
        <main className="flex-1 p-6 lg:p-8">
          {activeSection === "overview" && <OverviewSection />}
          {activeSection === "clients" && <ClientsSection />}
          {activeSection === "workers" && <WorkersSection />}
          {activeSection === "incidents" && <IncidentsSection />}
          {activeSection === "poles" && <PolesSection />}
        </main>
      </div>
    </div>
  )
}
