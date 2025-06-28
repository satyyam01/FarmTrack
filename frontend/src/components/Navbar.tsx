import { Link, useLocation, useNavigate } from "react-router-dom"
import { cn } from "@/lib/utils"
import { Button } from "./ui/button"
import { LogOut, Cpu, User, Settings, Building2 } from "lucide-react"
import { useEffect, useState } from "react"
import { Badge } from "./ui/badge"
import { Popover, PopoverContent, PopoverTrigger } from "./ui/popover"
import { useUser } from "@/contexts/UserContext"
import { toast } from "sonner"

const navItems = [
  { name: "Dashboard", path: "/dashboard" },
  { name: "Animals", path: "/animals" },
  { name: "Health Records", path: "/health" },
  { name: "Yields", path: "/yields" },
  { name: "Night Returns", path: "/night-returns" },
]

export function Navbar() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, setUser } = useUser()
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('user')
    setUser(null)
    toast.success("Logged out successfully")
    navigate('/login')
  }

  // Filter navigation items based on user role
  const getFilteredNavItems = () => {
    if (!user) return navItems;
    
    // For veterinarians, only show relevant pages
    if (user.role === 'veterinarian') {
      return navItems.filter(item => 
        ['Dashboard', 'Animals', 'Health Records'].includes(item.name)
      );
    }
    
    // For farm workers, show relevant pages including yields
    if (user.role === 'farm_worker') {
      return navItems.filter(item => 
        ['Dashboard', 'Animals', 'Health Records', 'Yields', 'Night Returns'].includes(item.name)
      );
    }
    
    // For regular users, show all pages except simulation (read-only access)
    if (user.role === 'user') {
      return navItems.filter(item => 
        ['Dashboard', 'Animals', 'Health Records', 'Yields', 'Night Returns', 'Returns'].includes(item.name)
      );
    }
    
    // For all other roles, show all items
    return navItems;
  };

  const filteredNavItems = getFilteredNavItems();

  return (
    <nav className={
      `sticky top-0 z-50 w-full border-b transition-all duration-300 ${
        scrolled
          ? "bg-background/70 backdrop-blur shadow-md"
          : "bg-background"
      }`
    }>
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Left: Logo/Brand */}
        <Link to="/dashboard" className="flex items-center gap-2 text-xl font-bold tracking-tight text-primary mr-8">
          <span>FarmTrack</span>
        </Link>
        {/* Center: Navigation Links */}
        <div className="flex-1 flex items-center justify-center gap-2">
          {filteredNavItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium transition-colors",
                location.pathname === item.path
                  ? "bg-accent text-primary border border-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              )}
            >
              {item.name}
            </Link>
          ))}
          {/* Simulation link only for admins */}
          {user?.role === 'admin' && (
            <Link
              to="/simulation"
              className={cn(
                "px-3 py-2 rounded-md text-sm font-medium flex items-center gap-1 transition-colors",
                location.pathname === "/simulation"
                  ? "bg-accent text-primary border border-primary"
                  : "text-muted-foreground hover:text-primary hover:bg-accent"
              )}
            >
              <Cpu className="h-4 w-4" /> Simulation
            </Link>
          )}
        </div>
        {/* Right: User info and actions */}
        <div className="flex items-center gap-2 ml-auto">
          {/* User info - clickable dropdown */}
          {user?.name && (
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  className="flex items-center gap-2 px-2 py-1 h-auto rounded-md bg-muted/30 border border-muted/50 hover:bg-muted/50 transition-colors"
                >
                  <User className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground truncate max-w-20">
                    {user.name}
                  </span>
                  <Badge variant="secondary" className="text-xs px-1.5 py-0.5 h-5 capitalize">
                    {user.role}
                  </Badge>
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-56 p-2" align="end">
                <div className="space-y-1">
                  {/* Menu options */}
                  <div className="space-y-0.5">
                    {user?.role === 'admin' && user?.farm_id && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="w-full justify-start gap-2 h-8"
                        onClick={() => {
                          navigate('/farm-settings');
                        }}
                      >
                        <Building2 className="h-3.5 w-3.5" />
                        <span className="text-xs">Farm Settings</span>
                      </Button>
                    )}
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8"
                      onClick={() => {
                        navigate('/profile-settings');
                      }}
                    >
                      <Settings className="h-3.5 w-3.5" />
                      <span className="text-xs">Profile Settings</span>
                    </Button>
                    
                    <div className="border-t my-1" />
                    
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start gap-2 h-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={handleLogout}
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      <span className="text-xs">Logout</span>
                    </Button>
                  </div>
                </div>
              </PopoverContent>
            </Popover>
          )}
        </div>
      </div>
    </nav>
  )
}