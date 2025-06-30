import { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useUser } from '@/contexts/UserContext';

interface AuthGuardProps {
  children: React.ReactNode;
  requireAuth?: boolean;
  redirectTo?: string;
}

export function AuthGuard({ 
  children, 
  requireAuth = true, 
  redirectTo = '/dashboard' 
}: AuthGuardProps) {
  const { user, loading } = useUser();
  const [isChecking, setIsChecking] = useState(true);
  const location = useLocation();

  useEffect(() => {
    // Wait for the user context to finish loading
    if (!loading) {
      setIsChecking(false);
    }
  }, [loading]);

  // Show loading while checking authentication
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // If authentication is required but user is not authenticated
  if (requireAuth && !user) {
    return <Navigate to="/" replace />;
  }

  // If authentication is not required but user is authenticated
  if (!requireAuth && user) {
    // Special case: Allow authenticated admin users without farms to access farm registration
    if (location.pathname === '/register') {
      // Check if admin user already has a farm
      if (user.role === 'admin' && user.farm_id) {
        // Admin already has a farm, redirect to dashboard
        return <Navigate to="/dashboard" replace />;
      }
      // Admin doesn't have a farm yet, allow access to registration
      return <>{children}</>;
    }
    
    // For other public routes, redirect authenticated users to dashboard
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
} 