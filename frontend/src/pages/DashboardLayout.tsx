import { Outlet } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { useUser } from "@/contexts/UserContext"
import { ChatbotWidget } from "@/components/ChatbotWidget"

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
      {user.role === 'admin' && <ChatbotWidget />}
    </div>
  )
}