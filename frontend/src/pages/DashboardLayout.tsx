import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"

export function DashboardLayout() {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
    </div>
  )
}