import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
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

  // If authentication is not required but user is authenticated, redirect to dashboard
  if (!requireAuth && user) {
    return <Navigate to={redirectTo} replace />;
  }

  // Render children if authentication requirements are met
  return <>{children}</>;
} 