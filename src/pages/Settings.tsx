
import React, { useState, useEffect } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import SettingsSidebar from "@/components/settings/SettingsSidebar";
import ProfileSettings from "@/components/settings/ProfileSettings";
import UsersSettings from "@/components/settings/UsersSettings";
import WhiteLabelSettings from "@/components/settings/WhiteLabelSettings";
import SystemSettings from "@/components/settings/SystemSettings";
import NotAvailableView from "@/components/settings/NotAvailableView";
import RoleSelector from "@/components/settings/RoleSelector";
import { UserRole } from '@/services/devices/deviceTypes';
import { checkUserRole } from '@/services/auth/authService';

const Settings = () => {
  const location = useLocation();
  const [currentRole, setCurrentRole] = useState<UserRole['role'] | null>(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    const getCurrentRole = async () => {
      try {
        // Check if super admin from localStorage first (fastest check)
        if (localStorage.getItem('isSuperAdmin') === 'true') {
          setCurrentRole('super_admin');
          setLoading(false);
          return;
        }
        
        const role = await checkUserRole();
        setCurrentRole(role?.role || null);
      } catch (error) {
        console.error('Error getting user role:', error);
      } finally {
        setLoading(false);
      }
    };
    
    getCurrentRole();
  }, []);
  
  const handleRoleChange = (role: UserRole['role'] | null) => {
    setCurrentRole(role);
    
    // Only set super admin flag in localStorage for super admin role
    if (role === 'super_admin') {
      localStorage.setItem('isSuperAdmin', 'true');
    } else {
      localStorage.removeItem('isSuperAdmin');
    }
  };
  
  // If on the root settings path, redirect to profile
  if (location.pathname === '/settings') {
    return <Navigate to="/settings/profile" replace />;
  }
  
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 max-w-screen-2xl">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Settings</h1>
        <p className="text-muted-foreground">Manage your account settings and preferences.</p>
      </div>
      
      <RoleSelector currentRole={currentRole} onRoleChange={handleRoleChange} />
      
      <div className="flex flex-col lg:flex-row gap-6">
        <SettingsSidebar currentRole={currentRole} />
        
        <div className="flex-1">
          <Routes>
            <Route path="/profile" element={<ProfileSettings />} />
            <Route path="/users" element={<UsersSettings currentRole={currentRole} />} />
            <Route path="/white-label" element={<WhiteLabelSettings currentRole={currentRole} />} />
            <Route path="/system" element={<SystemSettings currentRole={currentRole} />} />
            
            {/* Placeholder routes for other settings pages */}
            <Route path="/billing" element={
              <NotAvailableView 
                title="Billing Settings" 
                message="Billing settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/appearance" element={
              <NotAvailableView 
                title="Appearance Settings" 
                message="Appearance settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/analytics" element={
              <NotAvailableView 
                title="Analytics Settings" 
                message="Analytics settings are coming soon." 
                requiredRole="admin" 
              />
            } />
            <Route path="/global" element={
              <NotAvailableView 
                title="Global Settings" 
                message="Global settings are coming soon." 
                requiredRole="super_admin" 
              />
            } />
            <Route path="/security" element={
              <NotAvailableView 
                title="Security Settings" 
                message="Security settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/social-accounts" element={
              <NotAvailableView 
                title="Social Accounts" 
                message="Social account settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/notifications" element={
              <NotAvailableView 
                title="Notification Settings" 
                message="Notification settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/support" element={
              <NotAvailableView 
                title="Support Settings" 
                message="Support settings are coming soon." 
                requiredRole="user" 
              />
            } />
            <Route path="/api-keys" element={
              <NotAvailableView 
                title="API Key Management" 
                message="API key management is coming soon." 
                requiredRole="admin" 
              />
            } />
            <Route path="/chatbot" element={
              <NotAvailableView 
                title="Chatbot Settings" 
                message="Chatbot settings are coming soon." 
                requiredRole="admin" 
              />
            } />
            <Route path="/integrations" element={
              <NotAvailableView 
                title="Integration Settings" 
                message="Integration settings are coming soon." 
                requiredRole="admin" 
              />
            } />
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default Settings;
