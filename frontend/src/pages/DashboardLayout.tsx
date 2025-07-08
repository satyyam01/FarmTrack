import { Outlet, Navigate } from "react-router-dom"
import { Navbar } from "@/components/Navbar"
import { useUser } from "@/contexts/UserContext"
import { ChatbotWidget } from "@/components/ChatbotWidget";
import { useLocation } from "react-router-dom";
import { useEffect, useState } from "react";
import api from "@/services/api";

export function DashboardLayout() {
  const { user } = useUser();
  const [isPro, setIsPro] = useState(false);
  const location = useLocation();

  useEffect(() => {
    async function fetchFarmInfo() {
      if (user?.farm_id) {
        try {
          const res = await api.get("/dashboard/overview");
          setIsPro(!!res.data.farmInfo?.isPremium);
        } catch {
          setIsPro(false);
        }
      } else {
        setIsPro(false);
      }
    }
    fetchFarmInfo();
  }, [user?.farm_id, location.pathname]);

  // Safety check - this shouldn't happen with AuthGuard, but just in case
  if (!user) {
    return null
  }

  // Redirect admin users without a farm to the farm registration page
  if (user.role === 'admin' && !user.farm_id && location.pathname !== '/register') {
    return <Navigate to="/register" replace />;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto p-6">
        <Outlet />
      </main>
      {isPro && <ChatbotWidget />}
    </div>
  )
}