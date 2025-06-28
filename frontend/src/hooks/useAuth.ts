import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';

export function useAuth() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (!token || !userStr) {
        setUser(null);
        setLoading(false);
        return;
      }

      const userData = JSON.parse(userStr);
      setUser(userData);
    } catch (error) {
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, []);

  const requireAuth = () => {
    if (!user) {
      toast.error('Please login to access this page');
      navigate('/login');
      return false;
    }
    return true;
  };

  const requireRole = (role: string) => {
    if (!requireAuth()) return false;
    if (user.role !== role) {
      toast.error(`Access denied. ${role} role required.`);
      navigate('/dashboard');
      return false;
    }
    return true;
  };

  const requireAdmin = () => {
    if (!requireAuth()) return false;
    if (user.role !== 'admin') {
      toast.error('Access denied. Admin privileges required.');
      navigate('/dashboard');
      return false;
    }
    return true;
  };

  const requireFarmOwner = () => {
    if (!requireAdmin()) return false;
    if (!user.farm_id) {
      toast.error('Access denied. Farm owner privileges required.');
      navigate('/dashboard');
      return false;
    }
    return true;
  };

  return {
    user,
    loading,
    requireAuth,
    requireRole,
    requireAdmin,
    requireFarmOwner
  };
} 