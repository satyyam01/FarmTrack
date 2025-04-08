import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { LogOut } from "lucide-react"

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Animals", path: "/animals" },
  { name: "Night Returns", path: "/night-returns" },
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
    <nav className="border-b">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/dashboard" className="font-bold">
            FarmTrack
          </Link>
          <div className="flex items-center space-x-4">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-primary",
                  location.pathname === item.path
                    ? "text-primary"
                    : "text-muted-foreground"
                )}
              >
                {item.name}
              </Link>
            ))}
          </div>
        </div>
        <Button 
          variant="ghost" 
          size="icon" 
          onClick={handleLogout}
          className="text-muted-foreground hover:text-primary"
        >
          <LogOut className="h-5 w-5" />
          <span className="sr-only">Logout</span>
        </Button>
      </div>
    </nav>
  )
}