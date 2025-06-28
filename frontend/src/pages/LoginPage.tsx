import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { authApi } from "@/services/api"
import { Cpu } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "sonner"
import { useUser } from "@/contexts/UserContext"

export function LoginPage() {
  const navigate = useNavigate()
  const { setUser } = useUser()
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    name: "",
    role: "user",
    farm_id: ""
  })
  const [tab, setTab] = useState("login")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await authApi.login(formData.email, formData.password)
      localStorage.setItem("token", token)
      localStorage.setItem("user", JSON.stringify(user))
      
      // Update global user context
      setUser(user)
      
      // Check if admin user has a farm_id
      if (user.role === 'admin' && !user.farm_id) {
        toast.info("Please complete your farm registration")
        navigate("/register")
      } else {
        navigate("/dashboard")
      }
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      console.log("Starting registration process...")
      console.log("Form data:", formData)
      
      const { user } = await authApi.register(formData.name, formData.email, formData.password, formData.role, formData.farm_id)
      
      console.log("Registration successful, user:", user)
      
      // Clear any existing auth data
      localStorage.removeItem("token")
      localStorage.removeItem("user")
      
      // Handle different flows based on user role
      if (user.role === 'admin') {
        console.log("Admin user detected, redirecting to farm registration")
        // Admin users go to farm registration first
        toast.success("Account created successfully! Please register your farm.")
        navigate("/register")
      } else {
        console.log("Non-admin user detected, redirecting to login")
        // All other users (user, veterinarian, farm_worker) go directly to login
        toast.success("Registration successful! Please login with your credentials to continue.")
        
        // Switch to login tab first
        setTab("login")
        
        // Clear form data except email
        setFormData({ 
          email: formData.email, 
          password: "", 
          name: "", 
          role: "user", 
          farm_id: "" 
        })
        
        // Show a more prominent alert
        setTimeout(() => {
          toast.info("Please login with your email and password to access your account.")
        }, 1000)
        
        // Force a page refresh to ensure clean state
        setTimeout(() => {
          console.log("Redirecting to login page...")
          window.location.href = "/login"
        }, 1500)
      }
      
    } catch (err: any) {
      console.error("Registration error:", err)
      console.error("Error response:", err?.response?.data)
      
      // Don't clear form data on error
      const errorMessage = err?.response?.data?.error || "Registration failed"
      setError(errorMessage)
      toast.error(errorMessage)
      
      // Keep the user on the signup tab
      setTab("signup")
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
          <CardTitle className="text-3xl font-bold tracking-tight">FarmTrack</CardTitle>
          <CardDescription className="text-base text-muted-foreground">
            RFID-based Smart Livestock Tracking System
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <Tabs defaultValue="login" className="w-full" onValueChange={setTab}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="login">Login</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>
            <TabsContent value="login" className="space-y-6">
              <form onSubmit={handleLogin} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                {error && tab === "login" && (
                  <div className="text-red-500 text-sm text-center font-medium">{error}</div>
                )}
                <Button type="submit" className="w-full text-base font-semibold" disabled={loading}>
                  {loading ? "Signing In..." : "Sign In"}
                </Button>
              </form>
            </TabsContent>
            <TabsContent value="signup" className="space-y-6">
              <form onSubmit={handleRegister} className="space-y-5">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Enter your full name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-email">Email</Label>
                  <Input
                    id="signup-email"
                    type="email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-password">Password</Label>
                  <Input
                    id="signup-password"
                    type="password"
                    placeholder="Create a password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="signup-role">Role</Label>
                  <Select
                    value={formData.role}
                    onValueChange={value => setFormData({ ...formData, role: value })}
                  >
                    <SelectTrigger id="signup-role" className="w-full">
                      <SelectValue placeholder="Select a role" />
                    </SelectTrigger>
                    <SelectContent className="bg-background">
                      <SelectItem value="admin">Farm Owner</SelectItem>
                      <SelectItem value="user">User</SelectItem>
                      <SelectItem value="veterinarian">Veterinarian</SelectItem>
                      <SelectItem value="farm_worker">Farm Worker</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {formData.role !== 'admin' && (
                  <div className="space-y-2">
                    <Label htmlFor="farm-id">Farm ID</Label>
                    <Input
                      id="farm-id"
                      type="text"
                      placeholder="Enter farm ID"
                      value={formData.farm_id}
                      onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                      required={formData.role !== 'admin'}
                    />
                    <p className="text-xs text-muted-foreground">
                      Ask your farm admin for the farm ID to join their farm.
                    </p>
                  </div>
                )}
                {error && tab === "signup" && (
                  <div className="text-red-500 text-sm text-center font-medium">{error}</div>
                )}
                <Button type="submit" className="w-full text-base font-semibold" disabled={loading}>
                  {loading ? "Creating Account..." : "Create Account"}
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
        <CardFooter className="flex flex-col space-y-4 pt-4">
          <div className="text-center text-xs text-muted-foreground">
            By continuing, you agree to our Terms of Service and Privacy Policy
          </div>
        </CardFooter>
      </Card>
    </div>
  )
}