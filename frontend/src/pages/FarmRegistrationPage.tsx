import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { authApi } from "@/services/api"
import { Cpu } from "lucide-react"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

export function FarmRegistrationPage() {
  const navigate = useNavigate()
  const { setUser, setToken } = useUser()
  const [formData, setFormData] = useState({
    name: "",
    location: ""
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  // Check authentication and permissions on component mount
  useEffect(() => {
    const token = localStorage.getItem("token")
    const user = localStorage.getItem("user")
    
    if (!token || !user) {
      toast.error("Please login to create a farm")
      navigate("/login")
      return
    }
    
    try {
      const userData = JSON.parse(user)
      
      if (userData.role !== 'admin') {
        toast.error("Only farm owners can create farms")
        navigate("/dashboard")
        return
      }
      
      // Check if admin already has a farm
      if (userData.farm_id) {
        toast.info("You already have a farm registered")
        navigate("/dashboard")
        return
      }
    } catch (error) {
      toast.error("Invalid user data, please login again")
      navigate("/login")
    }
  }, [navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)

    try {
      // Clear any existing error state
      setError("")
      
      const response = await authApi.createFarm(formData.name, formData.location)
      
      // Update user data and token if provided
      if (response.user) {
        setUser(response.user)
      }
      
      // Update token if provided
      if (response.token) {
        setToken(response.token)
      }
      
      toast.success("Farm created successfully!")
      navigate("/dashboard")
    } catch (err: any) {
      // Handle specific error cases
      if (err?.response?.status === 401) {
        const errorMessage = "Your session has expired. Please login again."
        setError(errorMessage)
        toast.error(errorMessage)
        
        // Clear invalid token and redirect to login
        localStorage.removeItem("token")
        localStorage.removeItem("user")
        setUser(null)
        
        setTimeout(() => {
          navigate("/login")
        }, 2000)
      } else {
        const errorMessage = err?.response?.data?.error || "Failed to create farm"
        setError(errorMessage)
        toast.error(errorMessage)
      }
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