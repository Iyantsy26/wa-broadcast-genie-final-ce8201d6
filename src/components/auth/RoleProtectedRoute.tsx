
import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { isAuthenticated, hasRole, getDefaultSuperAdminEmail } from '@/services/auth/authService';
import { UserRole } from '@/services/devices/deviceTypes';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

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
  const [hasRequiredRole, setHasRequiredRole] = useState(false);
  const location = useLocation();
  const { toast } = useToast();

  useEffect(() => {
    // Store the super admin state in localStorage to persist across page refreshes
    const storedSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
    const fromLoginState = location.state?.isSuperAdmin;
    
    // If coming from login with super admin state, store it
    if (fromLoginState) {
      localStorage.setItem('isSuperAdmin', 'true');
      console.log("Super Admin state stored in localStorage");
    }

    const checkAuthAndRole = async () => {
      try {
        // First check if user is authenticated
        const auth = await isAuthenticated();
        setAuthenticated(auth);
        
        // If authentication required a specific role, check for that too
        if (auth && requiredRole) {
          // Check for stored super admin state first
          if (requiredRole === 'super_admin' && storedSuperAdmin) {
            console.log("Super Admin role granted via localStorage");
            setHasRequiredRole(true);
          } else {
            // Check for super admin via email
            const { data: { user } } = await supabase.auth.getUser();
            const isDefaultSuperAdmin = user?.email === getDefaultSuperAdminEmail();
            
            if (requiredRole === 'super_admin' && isDefaultSuperAdmin) {
              console.log("Default Super Admin role granted via email check");
              localStorage.setItem('isSuperAdmin', 'true');
              setHasRequiredRole(true);
            } else {
              const roleCheck = await hasRole(requiredRole);
              setHasRequiredRole(roleCheck);
            }
          }
        } else if (auth) {
          // If no specific role required, grant access to authenticated user
          setHasRequiredRole(true);
        }
      } catch (error) {
        console.error("Error checking auth and role:", error);
        toast({
          title: "Authentication Error",
          description: "There was a problem verifying your credentials",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    // Check for Super Admin in URL state (passed from login)
    if (fromLoginState && requiredRole === 'super_admin') {
      setAuthenticated(true);
      setHasRequiredRole(true);
      setLoading(false);
      console.log("Super Admin access granted from login state");
      toast({
        title: "Super Admin Access",
        description: "You have been granted Super Admin privileges",
      });
    } else {
      checkAuthAndRole();
    }
  }, [requiredRole, location.state, toast]);

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
    // Notify user about insufficient permissions
    toast({
      title: "Access Denied",
      description: `You don't have ${requiredRole} privileges`,
      variant: "destructive",
    });
    
    // Redirect to unauthorized or dashboard
    return <Navigate to="/" replace />;
  }

  // Log successful access
  console.log(`Access granted to ${requiredRole || 'protected'} route`);
  
  return <>{children}</>;
};

export default RoleProtectedRoute;
