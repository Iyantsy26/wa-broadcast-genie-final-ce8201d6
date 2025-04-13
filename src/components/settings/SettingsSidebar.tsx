
import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  User, 
  Users, 
  CreditCard, 
  Palette, 
  BarChart3, 
  Globe, 
  Lock, 
  MessageSquare,
  KeyRound,
  Bot,
  Link,
  Bell,
  Headphones,
  Settings,
  Building,
  ShieldCheck
} from 'lucide-react';
import { checkUserRole } from '@/services/auth/authService';
import { UserRole } from '@/services/devices/deviceTypes';
import { useState, useEffect } from 'react';

interface SettingsMenuItemProps {
  icon: React.ReactNode;
  label: string;
  path: string;
  active: boolean;
  onClick: () => void;
}

const SettingsMenuItem: React.FC<SettingsMenuItemProps> = ({ 
  icon, 
  label, 
  active, 
  onClick 
}) => {
  return (
    <div
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 px-4 py-3 rounded-md cursor-pointer transition-colors",
        active 
          ? "bg-primary/10 text-primary font-medium" 
          : "hover:bg-muted/60 text-muted-foreground"
      )}
    >
      {icon}
      <span>{label}</span>
    </div>
  );
};

interface SettingsSidebarProps {
  currentRole: UserRole['role'] | null;
}

const SettingsSidebar: React.FC<SettingsSidebarProps> = ({ currentRole }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isSuperAdmin, setIsSuperAdmin] = useState(false);
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  
  useEffect(() => {
    const checkRoles = async () => {
      if (currentRole === 'super_admin' || localStorage.getItem('isSuperAdmin') === 'true') {
        setIsSuperAdmin(true);
        setIsWhiteLabel(true);
        setIsAdmin(true);
      } else if (currentRole === 'white_label') {
        setIsWhiteLabel(true);
        setIsAdmin(true);
      } else if (currentRole === 'admin') {
        setIsAdmin(true);
      }
    };
    
    checkRoles();
  }, [currentRole]);

  const menuItems = [
    // Base settings for all users
    {
      icon: <User className="h-5 w-5" />,
      label: "Profile",
      path: "/settings/profile",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // User management - for Admin and above
    {
      icon: <Users className="h-5 w-5" />,
      label: "Users",
      path: "/settings/users",
      showFor: ['admin', 'white_label', 'super_admin']
    },
    // White Label - for White Label and Super Admin
    {
      icon: <Building className="h-5 w-5" />,
      label: "White Label",
      path: "/settings/white-label",
      showFor: ['white_label', 'super_admin']
    },
    // Billing settings - for all users
    {
      icon: <CreditCard className="h-5 w-5" />,
      label: "Billing",
      path: "/settings/billing",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // Appearance customization - for all users
    {
      icon: <Palette className="h-5 w-5" />,
      label: "Appearance",
      path: "/settings/appearance",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // Analytics dashboard - for Admin and above
    {
      icon: <BarChart3 className="h-5 w-5" />,
      label: "Analytics",
      path: "/settings/analytics",
      showFor: ['admin', 'white_label', 'super_admin']
    },
    // Global Settings - for Super Admin only
    {
      icon: <Globe className="h-5 w-5" />,
      label: "Global Settings",
      path: "/settings/global",
      showFor: ['super_admin']
    },
    // Security settings - for all users
    {
      icon: <Lock className="h-5 w-5" />,
      label: "Security",
      path: "/settings/security",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // Social account connections - for all users
    {
      icon: <MessageSquare className="h-5 w-5" />,
      label: "Social Accounts",
      path: "/settings/social-accounts",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // Notifications - for all users
    {
      icon: <Bell className="h-5 w-5" />,
      label: "Notifications",
      path: "/settings/notifications",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // Support - for all users
    {
      icon: <Headphones className="h-5 w-5" />,
      label: "Support",
      path: "/settings/support",
      showFor: ['user', 'admin', 'white_label', 'super_admin']
    },
    // API Keys - for Admin and above
    {
      icon: <KeyRound className="h-5 w-5" />,
      label: "API Keys",
      path: "/settings/api-keys",
      showFor: ['admin', 'white_label', 'super_admin']
    },
    // Chatbot configuration - for Admin and above
    {
      icon: <Bot className="h-5 w-5" />,
      label: "Chatbot",
      path: "/settings/chatbot",
      showFor: ['admin', 'white_label', 'super_admin']
    },
    // Integrations - for Admin and above
    {
      icon: <Link className="h-5 w-5" />,
      label: "Integrations",
      path: "/settings/integrations",
      showFor: ['admin', 'white_label', 'super_admin']
    },
    // System Settings - for Super Admin only
    {
      icon: <Settings className="h-5 w-5" />,
      label: "System",
      path: "/settings/system",
      showFor: ['super_admin']
    }
  ];

  const handleNavigate = (path: string) => {
    navigate(path);
  };

  const filteredMenuItems = menuItems.filter(item => {
    if (isSuperAdmin) return item.showFor.includes('super_admin');
    if (isWhiteLabel) return item.showFor.includes('white_label');
    if (isAdmin) return item.showFor.includes('admin');
    return item.showFor.includes('user');
  });

  return (
    <aside className="w-64 border-r h-full overflow-y-auto bg-background">
      <div className="p-4">
        <h2 className="text-lg font-semibold mb-4">Settings</h2>
        <div className="space-y-1">
          {filteredMenuItems.map((item) => (
            <SettingsMenuItem
              key={item.path}
              icon={item.icon}
              label={item.label}
              path={item.path}
              active={location.pathname === item.path}
              onClick={() => handleNavigate(item.path)}
            />
          ))}
        </div>
      </div>
    </aside>
  );
};

export default SettingsSidebar;
