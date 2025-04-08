import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Animals", path: "/animals" },
  { name: "Health Records", path: "/health" },
  { name: "Yields", path: "/yields" },
  { name: "Night Returns", path: "/night-returns" },
  { name: "Simulation", path: "/simulation" },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()

  const handleLogout = () => {
    // Clear the token from localStorage
    localStorage.removeItem('token')
    // Redirect to login page
    navigate('/login')
  }

  return (
    <nav className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center px-4">
        <Link to="/dashboard" className="flex items-center mr-8">
          <span className="text-xl font-bold tracking-tight">FarmTrack</span>
        </Link>
        <div className="flex items-center space-x-6 ml-4">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "text-sm font-medium transition-colors hover:text-primary",
                location.pathname === item.path
                  ? "text-foreground"
                  : "text-muted-foreground"
              )}
            >
              {item.name}
            </Link>
          ))}
        </div>
        <div className="ml-auto">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
          >
            <LogOut className="h-5 w-5" />
            <span className="sr-only">Logout</span>
          </Button>
        </div>
      </div>
    </nav>
  )
}