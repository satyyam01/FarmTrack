import { useState, useEffect } from "react"
import { useNavigate, useSearchParams } from "react-router-dom"
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
import verificationApi from "@/services/verificationApi"
import { Eye, EyeOff } from "lucide-react";

export function LoginPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const { setUser, setToken } = useUser()
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
  const [registrationStep, setRegistrationStep] = useState<'form' | 'otp' | 'success'>('form')
  const [otp, setOtp] = useState("")
  const [resendTimer, setResendTimer] = useState(60)
  const [otpLoading, setOtpLoading] = useState(false)
  const [otpError, setOtpError] = useState("")
  const [showPassword, setShowPassword] = useState(false);

  // Password validation regex
  const passwordRegex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]).{8,}$/;

  // Helper to check password requirements
  const passwordValid = passwordRegex.test(formData.password);

  // Handle tab query parameter
  useEffect(() => {
    const tabParam = searchParams.get('tab')
    if (tabParam === 'signup') {
      setTab("signup")
    }
  }, [searchParams])

  useEffect(() => {
    let timer: NodeJS.Timeout
    if (registrationStep === 'otp' && resendTimer > 0) {
      timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000)
    }
    return () => clearTimeout(timer)
  }, [registrationStep, resendTimer])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      const { token, user } = await authApi.login(formData.email, formData.password)
      
      // Store token and user data
      setToken(token)
      setUser(user)
      // Wait for context/localStorage to update before navigating
      setTimeout(() => {
        if (user.role === 'admin' && !user.farm_id) {
          toast.success("Welcome! Please register your farm.")
          navigate("/register")
        } else {
          toast.success("Login successful!")
          navigate("/dashboard")
        }
      }, 0)
    } catch (err: any) {
      setError(err?.response?.data?.error || "Login failed")
    } finally {
      setLoading(false)
    }
  }

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    // Password validation
    if (!passwordRegex.test(formData.password)) {
      return;
    }
    setLoading(true);
    try {
      await verificationApi.sendOTP(formData);
      setRegistrationStep('otp');
      setResendTimer(60);
      toast.success("OTP sent to your email. Please verify to complete registration.");
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Failed to send OTP";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault()
    setOtpError("")
    setOtpLoading(true)
    try {
      await verificationApi.verifyOTP({ email: formData.email, otp })
      setRegistrationStep('success')
      toast.success("Registration successful! Please login.")
      setTimeout(() => {
        setTab("login")
        setRegistrationStep('form')
        setFormData({ email: "", password: "", name: "", role: "user", farm_id: "" })
        setOtp("")
      }, 2000)
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "OTP verification failed"
      setOtpError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setOtpLoading(false)
    }
  }

  const handleResendOtp = async () => {
    setOtpError("")
    setOtpLoading(true)
    try {
      await verificationApi.sendOTP(formData)
      setResendTimer(60)
      toast.success("OTP resent to your email.")
    } catch (err: any) {
      const errorMessage = err?.response?.data?.error || "Failed to resend OTP"
      setOtpError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setOtpLoading(false)
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
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); if (error) setError(""); }}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <div className="relative">
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={formData.password}
                      onChange={(e) => { setFormData({ ...formData, password: e.target.value }); if (error) setError(""); }}
                      required
                    />
                    <button
                      type="button"
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                      onClick={() => setShowPassword((prev) => !prev)}
                      tabIndex={-1}
                    >
                      {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                    </button>
                  </div>
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
              {registrationStep === 'form' && (
                <form onSubmit={handleSendOtp} className="space-y-5">
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
                    <div className="relative">
                      <Input
                        id="signup-password"
                        type={showPassword ? "text" : "password"}
                        placeholder="Create a password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        required
                      />
                      <button
                        type="button"
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 focus:outline-none"
                        onClick={() => setShowPassword((prev) => !prev)}
                        tabIndex={-1}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </button>
                    </div>
                    <ul className={`text-xs mt-1 ml-1 list-disc pl-5 ${formData.password && !passwordValid ? 'text-red-500' : 'text-muted-foreground'}`}>
                      <ul>Password should be atleast :</ul>
                      <ul>8 characters long</ul>
                      <ul>Have 1 uppercase letter</ul>
                      <ul>Have 1 digit</ul>
                      <ul>Have 1 special character</ul>
                    </ul>
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
                  {error && (
                    <div className="text-red-500 text-sm text-center font-medium">{error}</div>
                  )}
                  <Button type="submit" className="w-full text-base font-semibold" disabled={loading}>
                    {loading ? "Sending OTP..." : "Send OTP"}
                  </Button>
                </form>
              )}
              {registrationStep === 'otp' && (
                <form onSubmit={handleVerifyOtp} className="space-y-5">
                  <div className="space-y-2">
                    <Label htmlFor="otp">Enter OTP</Label>
                    <Input
                      id="otp"
                      type="text"
                      placeholder="Enter the OTP sent to your email"
                      value={otp}
                      onChange={(e) => setOtp(e.target.value)}
                      required
                    />
                  </div>
                  {otpError && (
                    <div className="text-red-500 text-sm text-center font-medium">{otpError}</div>
                  )}
                  <Button type="submit" className="w-full text-base font-semibold" disabled={otpLoading}>
                    {otpLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    className="w-full text-base font-semibold"
                    onClick={handleResendOtp}
                    disabled={resendTimer > 0 || otpLoading}
                  >
                    {resendTimer > 0 ? `Resend OTP (${resendTimer}s)` : "Resend OTP"}
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="w-full text-base font-semibold"
                    onClick={() => { setRegistrationStep('form'); setOtp(""); setOtpError(""); }}
                    disabled={otpLoading}
                  >
                    Edit Registration Info
                  </Button>
                </form>
              )}
              {registrationStep === 'success' && (
                <div className="text-center space-y-4">
                  <div className="text-green-600 text-lg font-semibold">Registration successful! Please login.</div>
                </div>
              )}
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