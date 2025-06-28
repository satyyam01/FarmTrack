import { BrowserRouter, Routes, Route } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
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
import { LandingPage } from "./pages/LandingPage"
import NotFoundPage from "./pages/NotFoundPage"
import { UserProvider } from "./contexts/UserContext"
import { ProtectedRoute } from "./components/ProtectedRoute"
import { AuthGuard } from "./components/AuthGuard"
import { Toaster } from "sonner"

function App() {
  return (
    <UserProvider>
      <BrowserRouter>
        <Routes>
          {/* Landing page - redirects authenticated users to dashboard */}
          <Route path="/" element={
            <AuthGuard requireAuth={false}>
              <LandingPage />
            </AuthGuard>
          } />
          
          {/* Public routes - no authentication required */}
          <Route path="/login" element={
            <AuthGuard requireAuth={false}>
              <LoginPage />
            </AuthGuard>
          } />
          <Route path="/register" element={
            <AuthGuard requireAuth={false}>
              <FarmRegistrationPage />
            </AuthGuard>
          } />
          
          {/* Protected dashboard routes */}
          <Route path="/dashboard" element={
            <AuthGuard requireAuth={true}>
              <DashboardLayout />
            </AuthGuard>
          }>
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

export default App
