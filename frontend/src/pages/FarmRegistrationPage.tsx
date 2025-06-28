import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/services/api"
import { Cpu } from "lucide-react"
import { toast } from "sonner"

export function FarmRegistrationPage() {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    location: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      console.log("Starting farm creation process...")
      await authApi.createFarm(formData.name, formData.location)
      
      console.log("Farm created successfully, redirecting to login")
      
      // Clear any existing auth data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Show success message and redirect to login
      toast.success("Farm created successfully! Please login to continue.")
      
      // Show a more prominent alert
      setTimeout(() => {
        toast.info("Please login with your email and password to access your farm.")
      }, 1000)
      
      // Redirect to login page
      console.log("Navigating to login page...")
      navigate("/login")
    } catch (err: any) {
      console.error("Farm creation error:", err)
      const errorMessage = err?.response?.data?.error || "Failed to create farm"
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-background pt-2 pb-4 px-2">
      <Card className="w-full max-w-lg shadow-xl rounded-2xl border bg-white/90">
        <CardHeader className="space-y-2 text-center border-b pb-4">
          <div className="flex justify-center mb-2">
            <Cpu className="h-10 w-10 text-green-600" />
          </div>
          <CardTitle className="text-3xl font-bold tracking-tight">Register Your Farm</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            Complete your farm setup to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="farm-name">Farm Name</Label>
              <Input
                id="farm-name"
                type="text"
                placeholder="Enter your farm name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="farm-location">Farm Location</Label>
              <Input
                id="farm-location"
                type="text"
                placeholder="Enter your farm location"
                value={formData.location}
                onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                required
              />
            </div>
            {error && (
              <div className="text-red-500 text-sm text-center font-medium">{error}</div>
            )}
            <Button 
              type="submit" 
              className="w-full text-base font-semibold"
              disabled={loading}
            >
              {loading ? "Creating Farm..." : "Create Farm"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
} 