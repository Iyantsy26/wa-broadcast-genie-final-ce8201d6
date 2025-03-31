
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { getRedirectPathForRole } from '@/services/auth/roleUtils';
import { isAuthenticated, isDefaultSuperAdmin, getDefaultSuperAdminEmail } from '@/services/auth/authService';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useToast } from '@/components/ui/use-toast';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';

// Create a schema for form validation
const loginSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
  password: z.string().min(6, { message: "Password must be at least 6 characters" }),
});

type LoginFormValues = z.infer<typeof loginSchema>;

const Login = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  // Setup form with validation
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });
  
  useEffect(() => {
    const checkAuth = async () => {
      const isAuth = await isAuthenticated();
      
      if (isAuth) {
        // If user is already authenticated, redirect to appropriate dashboard
        const redirectPath = await getRedirectPathForRole();
        navigate(redirectPath);
      } else {
        setLoading(false);
      }
    };
    
    checkAuth();
  }, [navigate]);
  
  const handleLogin = async (values: LoginFormValues) => {
    try {
      setSubmitting(true);
      
      // Check if this is the default Super Admin login
      if (isDefaultSuperAdmin(values.email, values.password)) {
        toast({
          title: "Super Admin Login",
          description: "Welcome, Super Admin!",
        });
        
        // Set localStorage to indicate super admin status
        localStorage.setItem('isSuperAdmin', 'true');
        
        // Set state to indicate super admin status for the RoleProtectedRoute
        navigate('/super-admin', { state: { isSuperAdmin: true } });
        return;
      }
      
      // Actual login with Supabase
      const { error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      });
      
      if (error) {
        toast({
          title: "Login failed",
          description: error.message,
          variant: "destructive",
        });
        console.error('Login error:', error);
        return;
      }
      
      // After successful login, redirect to the appropriate dashboard
      toast({
        title: "Login successful",
        description: "Welcome back!",
      });
      
      // Get redirect from URL if available
      const urlParams = new URLSearchParams(location.search);
      const redirect = urlParams.get('redirect');
      
      // Determine where to redirect the user based on their role
      const redirectPath = await getRedirectPathForRole();
      
      if (redirect) {
        navigate(redirect);
      } else {
        navigate(redirectPath);
      }
    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "An error occurred",
        description: "Please try again later",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };
  
  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow">
        <div className="text-center">
          <h1 className="text-3xl font-bold">Login to Dashboard</h1>
          <p className="mt-2 text-gray-600">Enter your credentials to access your account</p>
          <div className="mt-4 p-3 bg-blue-50 rounded-md text-sm">
            <p className="font-medium text-blue-800">Super Admin Login</p>
            <p className="text-blue-600">Email: {getDefaultSuperAdminEmail()}</p>
            <p className="text-blue-600">Password: 123456</p>
          </div>
        </div>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleLogin)} className="mt-8 space-y-6">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email address</FormLabel>
                    <FormControl>
                      <Input 
                        type="email" 
                        placeholder="Enter your email" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Password</FormLabel>
                    <FormControl>
                      <Input 
                        type="password" 
                        placeholder="Enter your password" 
                        {...field} 
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div className="flex items-center">
                <input
                  id="remember-me"
                  name="remember-me"
                  type="checkbox"
                  className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                />
                <label htmlFor="remember-me" className="ml-2 block text-sm text-gray-900">
                  Remember me
                </label>
              </div>
              
              <div className="text-sm">
                <a href="#" className="font-medium text-primary hover:text-primary-dark">
                  Forgot your password?
                </a>
              </div>
            </div>
            
            <div>
              <Button
                type="submit"
                className="w-full"
                disabled={submitting}
              >
                {submitting ? 'Signing in...' : 'Sign in'}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
};

export default Login;
