
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole } from '@/services/auth/authService';
import { UserRole } from '@/services/devices/deviceTypes';

interface RoleProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: UserRole['role'];
}

const RoleProtectedRoute: React.FC<RoleProtectedRouteProps> = ({ 
  children, 
  requiredRole 
}) => {
  const [loading, setLoading] = useState(true);
  const [authenticated, setAuthenticated] = useState(false);
  const [hasRequiredRole, setHasRequiredRole] = useState(true);
  const location = useLocation();

  useEffect(() => {
    const checkAuthAndRole = async () => {
      // First check if user is authenticated
      const auth = await isAuthenticated();
      setAuthenticated(auth);
      
      // If authentication required a specific role, check for that too
      if (auth && requiredRole) {
        const roleCheck = await hasRole(requiredRole);
        setHasRequiredRole(roleCheck);
      }
      
      setLoading(false);
    };

    // Check for Super Admin in URL state (passed from login)
    const isSuperAdminFromLogin = location.state?.isSuperAdmin;
    if (isSuperAdminFromLogin && requiredRole === 'super_admin') {
      setAuthenticated(true);
      setHasRequiredRole(true);
      setLoading(false);
    } else {
      checkAuthAndRole();
    }
  }, [requiredRole, location.state]);

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!authenticated) {
    // Redirect to login with return path
    return <Navigate to={`/login?redirect=${encodeURIComponent(location.pathname)}`} replace />;
  }
  
  if (!hasRequiredRole) {
    // Redirect to unauthorized or dashboard
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

export default RoleProtectedRoute;
