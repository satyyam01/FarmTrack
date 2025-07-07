import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { ChatbotWidget } from "@/components/ChatbotWidget"
import { useUser } from "@/contexts/UserContext"

export function DashboardLayout() {
  const { user } = useUser()

  // Safety check - this shouldn't happen with AuthGuard, but just in case
  if (!user) {
    return null
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
      <ChatbotWidget />
    </div>
  )
}