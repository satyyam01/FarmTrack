import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { updateApiToken } from '@/services/api';

interface User {
  id?: string;
  _id?: string;
  name: string;
  email: string;
  role: string;
  farm_id?: string;
}

interface UserContextType {
  user: User | null;
  setUser: (user: User | null) => void;
  updateUser: (updates: Partial<User>) => void;
  setToken: (token: string) => void;
  logout: () => void;
  loading: boolean;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const userStr = localStorage.getItem('user');
      const token = localStorage.getItem('token');
      
      if (userStr && token) {
        const userData = JSON.parse(userStr);
        setUser(userData);
        // Update API token when user is loaded
        updateApiToken(token);
      }
    } catch (error) {
      console.error('Error parsing user data:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const setToken = (token: string) => {
    localStorage.setItem('token', token);
    updateApiToken(token);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    updateApiToken(null);
  };

  // Wrapper function to set user and save to localStorage
  const setUserAndSave = (userData: User | null) => {
    setUser(userData);
    if (userData) {
      localStorage.setItem('user', JSON.stringify(userData));
    } else {
      localStorage.removeItem('user');
    }
  };

  return (
    <UserContext.Provider value={{ user, setUser: setUserAndSave, updateUser, setToken, logout, loading }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 