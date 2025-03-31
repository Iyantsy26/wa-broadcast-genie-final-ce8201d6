
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import DashboardLayout from "./components/layout/DashboardLayout";
import Dashboard from "./pages/Dashboard";
import NotFound from "./pages/NotFound";
import BroadcastCampaigns from "./pages/BroadcastCampaigns";
import ChatbotBuilder from "./pages/ChatbotBuilder";
import Templates from "./pages/Templates";
import TeamManagement from "./pages/TeamManagement";
import Analytics from "./pages/Analytics";
import Tickets from "./pages/Tickets";
import Settings from "./pages/Settings";
import Leads from "./pages/Leads";
import Clients from "./pages/Clients";
import Devices from "./pages/Devices";
import SuperAdmin from "./pages/SuperAdmin";
import Admin from "./pages/Admin";
import WhiteLabel from "./pages/WhiteLabel";
import Login from "./pages/Login";
import Index from "./pages/Index";
import ProtectedRoute from "./components/auth/ProtectedRoute";
import RoleProtectedRoute from "./components/auth/RoleProtectedRoute";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          {/* Auth Routes */}
          <Route path="/login" element={<Login />} />
          
          {/* Role-protected Routes */}
          <Route path="/super-admin" element={
            <RoleProtectedRoute requiredRole="super_admin">
              <DashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route index element={<SuperAdmin />} />
          </Route>
          
          <Route path="/admin" element={
            <RoleProtectedRoute requiredRole="admin">
              <DashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route index element={<Admin />} />
          </Route>
          
          <Route path="/white-label" element={
            <RoleProtectedRoute requiredRole="white_label">
              <DashboardLayout />
            </RoleProtectedRoute>
          }>
            <Route index element={<WhiteLabel />} />
          </Route>
          
          {/* Protected Routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <DashboardLayout />
            </ProtectedRoute>
          }>
            <Route index element={<Dashboard />} />
            <Route path="/broadcasts" element={<BroadcastCampaigns />} />
            <Route path="/chatbots" element={<ChatbotBuilder />} />
            <Route path="/templates" element={<Templates />} />
            <Route path="/devices" element={<Devices />} />
            <Route path="/leads" element={<Leads />} />
            <Route path="/clients" element={<Clients />} />
            <Route path="/team" element={<TeamManagement />} />
            <Route path="/analytics" element={<Analytics />} />
            <Route path="/tickets" element={<Tickets />} />
            <Route path="/settings" element={<Settings />} />
          </Route>
          
          {/* Redirect Route */}
          <Route path="/index" element={<Index />} />
          
          {/* 404 Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
