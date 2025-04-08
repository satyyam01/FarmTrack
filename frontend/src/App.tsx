import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom"
import { LoginPage } from "./pages/LoginPage"
import { DashboardLayout } from "./pages/DashboardLayout"
import { DashboardPage } from "./pages/DashboardPage"
import { AnimalsPage } from "./pages/AnimalsPage"
import { HealthRecordPage } from "./pages/HealthRecordPage"
import { YieldsPage } from "./pages/YieldsPage"
import { ReturnLogsPage } from "./pages/ReturnLogsPage"
import { NightReturnTrackerPage } from "./pages/NightReturnTrackerPage"

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Navigate to="/login" replace />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<DashboardLayout />}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="animals" element={<AnimalsPage />} />
          <Route path="health" element={<HealthRecordPage />} />
          <Route path="yields" element={<YieldsPage />} />
          <Route path="returns" element={<ReturnLogsPage />} />
          <Route path="night-returns" element={<NightReturnTrackerPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

export default App
