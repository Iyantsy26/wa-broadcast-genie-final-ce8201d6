
import React from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { 
  BarChart3, 
  MessageCircle, 
  Users, 
  Send, 
  Smartphone, 
  Bot, 
  Settings, 
  FileText, 
  Ticket, 
  Home,
  UserRound,
  Building2
} from 'lucide-react';

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
    title: 'WhatsApp Accounts',
    href: '/accounts',
    icon: <Smartphone className="h-5 w-5" />,
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
    icon: <MessageCircle className="h-5 w-5" />,
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

const Sidebar = ({ isOpen }: SidebarProps) => {
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
        </nav>
        <div className="p-3 mt-auto">
          {isOpen ? (
            <div className="rounded-md bg-sidebar-accent p-3 text-xs">
              <p className="font-medium text-sidebar-accent-foreground">Free Trial</p>
              <p className="text-sidebar-accent-foreground/70 mt-1">12 days remaining</p>
              <div className="mt-2 h-1.5 w-full bg-sidebar-accent-foreground/20 rounded-full overflow-hidden">
                <div className="bg-primary h-full w-[60%]" />
              </div>
            </div>
          ) : (
            <div className="h-1.5 w-full bg-sidebar-accent-foreground/20 rounded-full overflow-hidden">
              <div className="bg-primary h-full w-[60%]" />
            </div>
          )}
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
