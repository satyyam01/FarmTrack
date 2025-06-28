import React from 'react';
import { Navigate } from 'react-router-dom';
import { toast } from 'sonner';

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
  // Get user info from localStorage
  const userStr = localStorage.getItem('user');
  const token = localStorage.getItem('token');
  
  if (!token || !userStr) {
    toast.error('Please login to access this page');
    return <Navigate to="/login" replace />;
  }

  try {
    const user = JSON.parse(userStr);
    
    // Check if user is active
    if (!user) {
      toast.error('Invalid user session');
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
  } catch (error) {
    console.error('Error parsing user data:', error);
    toast.error('Invalid user session');
    return <Navigate to="/login" replace />;
  }
} 