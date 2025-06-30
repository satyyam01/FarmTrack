import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { LandingPage } from "./pages/LandingPage"
import { FarmRegistrationPage } from "./pages/FarmRegistrationPage"
import { DashboardLayout } from "./pages/DashboardLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { AnimalsPage } from "./pages/AnimalsPage"
import { HealthRecordPage } from "./pages/HealthRecordPage"
import { YieldsPage } from "./pages/YieldsPage"
import { ReturnLogsPage } from "./pages/ReturnLogsPage"
import { NightReturnTrackerPage } from "./pages/NightReturnTrackerPage"
import { SimulationPage } from "./pages/SimulationPage"
import { FarmSettingsPage } from "./pages/FarmSettingsPage"
import { ProfileSettingsPage } from "./pages/ProfileSettingsPage"
import NotFoundPage from "./pages/NotFoundPage"
import { UserProvider } from "./contexts/UserContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { Toaster } from "sonner"

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<FarmRegistrationPage />} />
          <Route path="/dashboard" element={<DashboardLayout />}>
            <Route index element={<DashboardPage />} />
            <Route path="animals" element={<AnimalsPage />} />
            <Route path="health" element={
              <ProtectedRoute requiredRole="admin,farm_worker,veterinarian,user">
                <HealthRecordPage />
              </ProtectedRoute>
            } />
            <Route path="yields" element={
              <ProtectedRoute requiredRole="admin,farm_worker,user">
                <YieldsPage />
              </ProtectedRoute>
            } />
            <Route path="returns" element={
              <ProtectedRoute requiredRole="admin,user">
                <ReturnLogsPage />
              </ProtectedRoute>
            } />
            <Route path="night-returns" element={
              <ProtectedRoute requiredRole="admin,farm_worker,user">
                <NightReturnTrackerPage />
              </ProtectedRoute>
            } />
            <Route path="simulation" element={
              <ProtectedRoute requireAdmin={true}>
                <SimulationPage />
              </ProtectedRoute>
            } />
            <Route path="farm-settings" element={
              <ProtectedRoute requireFarmOwner={true}>
                <FarmSettingsPage />
              </ProtectedRoute>
            } />
            <Route path="profile-settings" element={<ProfileSettingsPage />} />
          </Route>
          {/* 404 catch-all route - must be last */}
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </BrowserRouter>
      <Toaster />
    </UserProvider>
  )
}