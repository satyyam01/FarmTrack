import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';
import { useUser } from '@/contexts/UserContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
  requireAdmin?: boolean;
  requireFarmOwner?: boolean;
}

export function ProtectedRoute({ 
  children, 
  requiredRole, 
  requireAdmin = false,
  requireFarmOwner = false 
}: ProtectedRouteProps) {
  const { user, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  // Check for specific role requirement
  if (requiredRole) {
    const allowedRoles = requiredRole.split(',').map(role => role.trim());
    if (!allowedRoles.includes(user.role)) {
      toast.error(`Access denied. ${allowedRoles.join(' or ')} role required.`);
      return <Navigate to="/dashboard" replace />;
    }
  }

  // Check for admin requirement
  if (requireAdmin && user.role !== 'admin') {
    toast.error('Access denied. Admin privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  // Check for farm owner requirement (admin with farm_id)
  if (requireFarmOwner && (user.role !== 'admin' || !user.farm_id)) {
    toast.error('Access denied. Farm owner privileges required.');
    return <Navigate to="/dashboard" replace />;
  }

  return <>{children}</>;
} 