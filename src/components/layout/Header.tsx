
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Menu, Bell, LogOut, Settings, ShieldCheck, Building, Globe } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { useToast } from "@/hooks/use-toast";
import { signOut, isAuthenticated, checkUserRole, getDefaultSuperAdminEmail } from "@/services/auth/authService";
import { UserRole } from "@/services/devices/deviceTypes";
import { supabase } from "@/integrations/supabase/client";

interface HeaderProps {
  toggleSidebar: () => void;
}

const Header = ({ toggleSidebar }: HeaderProps) => {
  const isMobile = useIsMobile();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [authenticated, setAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  
  useEffect(() => {
    const checkAuth = async () => {
      const auth = await isAuthenticated();
      setAuthenticated(auth);
      
      if (auth) {
        // Check for super admin in localStorage
        if (localStorage.getItem('isSuperAdmin') === 'true') {
          setUserRole({
            id: 'system',
            user_id: 'system',
            role: 'super_admin'
          });
          
          // Try to get user email
          const { data: { user } } = await supabase.auth.getUser();
          setUserEmail(user?.email || getDefaultSuperAdminEmail());
        } else {
          const role = await checkUserRole();
          setUserRole(role);
          
          // Get user email
          const { data: { user } } = await supabase.auth.getUser();
          setUserEmail(user?.email || null);
        }
      }
    };
    
    checkAuth();
  }, []);
  
  const handleSignOut = async () => {
    try {
      const success = await signOut();
      if (success) {
        toast({
          title: "Signed out",
          description: "You have been signed out successfully",
        });
        // Redirect to login page after signing out
        navigate('/login');
      } else {
        console.error('Sign out failed');
        toast({
          title: "Error",
          description: "Failed to sign out",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Sign out error:', error);
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="border-b bg-background">
      <div className="flex h-16 items-center px-4 justify-between">
        <div className="flex items-center">
          <Button variant="ghost" size="icon" onClick={toggleSidebar} className="mr-2">
            <Menu className="h-5 w-5" />
          </Button>
          <Link to="/" className="flex items-center gap-2">
            <span className="font-bold text-xl hidden sm:inline-block">WhatsApp CRM</span>
          </Link>
        </div>

        <div className="flex items-center gap-4">
          {authenticated ? (
            <>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-primary"></span>
              </Button>

              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src="/avatars/01.png" alt="User" />
                      <AvatarFallback>U</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {userRole?.role === 'super_admin' ? 'Super Admin' : 'User'}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {userEmail || 'user@example.com'}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  
                  {(userRole?.role === 'super_admin' || localStorage.getItem('isSuperAdmin') === 'true') && (
                    <DropdownMenuItem onClick={() => navigate('/super-admin')}>
                      <ShieldCheck className="mr-2 h-4 w-4" />
                      <span>Super Admin</span>
                    </DropdownMenuItem>
                  )}
                  
                  {(userRole?.role === 'admin' || userRole?.role === 'super_admin') && (
                    <DropdownMenuItem onClick={() => navigate('/admin')}>
                      <Building className="mr-2 h-4 w-4" />
                      <span>Admin Portal</span>
                    </DropdownMenuItem>
                  )}
                  
                  {(userRole?.role === 'white_label' || userRole?.role === 'super_admin') && (
                    <DropdownMenuItem onClick={() => navigate('/white-label')}>
                      <Globe className="mr-2 h-4 w-4" />
                      <span>White Label</span>
                    </DropdownMenuItem>
                  )}
                  
                  <DropdownMenuItem onClick={() => navigate('/settings')}>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button size="sm" onClick={() => navigate('/login?tab=signup')}>
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
