
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  Users, 
  Send, 
  Bot, 
  Settings, 
  FileText, 
  Ticket, 
  Home,
  UserRound,
  Building2,
  Smartphone,
  ShieldCheck,
  Building,
  Globe,
  LogIn,
  MessageSquare
} from 'lucide-react';
import { signOut } from '@/services/auth/authService';
import { useToast } from '@/hooks/use-toast';

interface SidebarProps {
  isOpen: boolean;
}

interface NavItem {
  title: string;
  href: string;
  icon: React.ReactNode;
}

const navItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <Home className="h-5 w-5" />,
  },
  {
    title: 'Broadcasts',
    href: '/broadcasts',
    icon: <Send className="h-5 w-5" />,
  },
  {
    title: 'Templates',
    href: '/templates',
    icon: <FileText className="h-5 w-5" />,
  },
  {
    title: 'Chatbots',
    href: '/chatbots',
    icon: <Bot className="h-5 w-5" />,
  },
  {
    title: 'Conversations',
    href: '/conversations',
    icon: <MessageSquare className="h-5 w-5" />,
  },
  {
    title: 'Devices',
    href: '/devices',
    icon: <Smartphone className="h-5 w-5" />,
  },
  {
    title: 'Leads',
    href: '/leads',
    icon: <UserRound className="h-5 w-5" />,
  },
  {
    title: 'Clients',
    href: '/clients',
    icon: <Building2 className="h-5 w-5" />,
  },
  {
    title: 'Team Management',
    href: '/team',
    icon: <Users className="h-5 w-5" />,
  },
  {
    title: 'Analytics',
    href: '/analytics',
    icon: <BarChart3 className="h-5 w-5" />,
  },
  {
    title: 'Tickets',
    href: '/tickets',
    icon: <Ticket className="h-5 w-5" />,
  },
  {
    title: 'Settings',
    href: '/settings',
    icon: <Settings className="h-5 w-5" />,
  },
];

// Admin navItems
const adminItems: NavItem[] = [
  {
    title: 'Super Admin',
    href: '/super-admin',
    icon: <ShieldCheck className="h-5 w-5" />,
  },
  {
    title: 'Admin Portal',
    href: '/admin',
    icon: <Building className="h-5 w-5" />,
  },
  {
    title: 'White Label',
    href: '/white-label',
    icon: <Globe className="h-5 w-5" />,
  },
];

const Sidebar = ({ isOpen }: SidebarProps) => {
  const { toast } = useToast();
  
  const handleSignOut = async () => {
    try {
      await signOut();
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
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
    <aside 
      className={cn(
        "bg-sidebar text-sidebar-foreground border-r border-sidebar-border transition-all duration-300 h-full overflow-y-auto overflow-x-hidden",
        isOpen ? "w-64" : "w-0 md:w-16"
      )}
    >
      <div className="py-4 h-full flex flex-col">
        <div className="px-3 py-2">
          {isOpen && <h2 className="text-xs font-semibold text-sidebar-foreground/60 px-2">MAIN MENU</h2>}
        </div>
        <nav className="space-y-1 px-3 flex-1">
          {navItems.map((item) => (
            <NavLink 
              key={item.href} 
              to={item.href}
              className={({ isActive }) => cn(
                "nav-item transition-all duration-150",
                isActive ? "active" : "",
                !isOpen && "justify-center px-0"
              )}
            >
              {item.icon}
              {isOpen && <span>{item.title}</span>}
            </NavLink>
          ))}
          
          {/* Admin section */}
          {isOpen && <h2 className="text-xs font-semibold text-sidebar-foreground/60 px-2 pt-6 pb-2">ADMIN PORTALS</h2>}
          {!isOpen && <div className="border-t my-4 border-sidebar-border"></div>}
          
          {adminItems.map((item) => (
            <NavLink 
              key={item.href} 
              to={item.href}
              className={({ isActive }) => cn(
                "nav-item transition-all duration-150",
                isActive ? "active" : "",
                !isOpen && "justify-center px-0"
              )}
            >
              {item.icon}
              {isOpen && <span>{item.title}</span>}
            </NavLink>
          ))}
        </nav>
        <div className="p-3 mt-auto">
          {isOpen ? (
            <div className="space-y-3">
              <div className="rounded-md bg-sidebar-accent p-3 text-xs">
                <p className="font-medium text-sidebar-accent-foreground">Free Trial</p>
                <p className="text-sidebar-accent-foreground/70 mt-1">12 days remaining</p>
                <div className="mt-2 h-1.5 w-full bg-sidebar-accent-foreground/20 rounded-full overflow-hidden">
                  <div className="bg-primary h-full w-[60%]" />
                </div>
              </div>
              
              <button 
                onClick={handleSignOut}
                className="w-full flex items-center p-2 rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogIn className="mr-2 h-4 w-4" />
                <span className="text-sm">Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col items-center">
              <div className="h-1.5 w-full bg-sidebar-accent-foreground/20 rounded-full overflow-hidden mb-3">
                <div className="bg-primary h-full w-[60%]" />
              </div>
              <button
                onClick={handleSignOut}
                className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-sidebar-accent/50 text-sidebar-foreground/70 hover:text-sidebar-foreground"
              >
                <LogIn className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
