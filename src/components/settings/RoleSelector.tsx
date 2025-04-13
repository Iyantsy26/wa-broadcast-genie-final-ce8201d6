
import React from 'react';
import { Badge } from '@/components/ui/badge';
import { UserCheck, Users, Building2, ShieldCheck } from 'lucide-react';
import { UserRole } from '@/services/devices/deviceTypes';

interface RoleSelectorProps {
  currentRole: UserRole['role'] | null;
  onRoleChange: (role: UserRole['role'] | null) => void;
}

const RoleSelector: React.FC<RoleSelectorProps> = ({ currentRole, onRoleChange }) => {
  // Check if user is super admin from localStorage
  const isSuperAdmin = localStorage.getItem('isSuperAdmin') === 'true';
  
  // Only show role selector if user is a super admin
  if (!isSuperAdmin) {
    return null;
  }

  return (
    <div className="flex flex-wrap items-center gap-2 p-2 rounded-lg bg-muted/40 mb-6">
      <span className="text-sm text-muted-foreground mr-2">View as role:</span>
      
      <Badge 
        variant={currentRole === 'super_admin' ? "default" : "outline"} 
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${currentRole === 'super_admin' ? 'bg-amber-500 hover:bg-amber-600' : 'hover:bg-muted'}`}
        onClick={() => onRoleChange('super_admin')}
      >
        <ShieldCheck className="h-3.5 w-3.5" />
        Super Admin
      </Badge>
      
      <Badge 
        variant={currentRole === 'white_label' ? "default" : "outline"} 
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${currentRole === 'white_label' ? 'bg-blue-500 hover:bg-blue-600' : 'hover:bg-muted'}`}
        onClick={() => onRoleChange('white_label')}
      >
        <Building2 className="h-3.5 w-3.5" />
        White Label
      </Badge>
      
      <Badge 
        variant={currentRole === 'admin' ? "default" : "outline"} 
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${currentRole === 'admin' ? 'bg-purple-500 hover:bg-purple-600' : 'hover:bg-muted'}`}
        onClick={() => onRoleChange('admin')}
      >
        <Users className="h-3.5 w-3.5" />
        Admin
      </Badge>
      
      <Badge 
        variant={currentRole === 'user' ? "default" : "outline"} 
        className={`cursor-pointer flex items-center gap-1 px-3 py-1 ${currentRole === 'user' ? 'bg-green-500 hover:bg-green-600' : 'hover:bg-muted'}`}
        onClick={() => onRoleChange('user')}
      >
        <UserCheck className="h-3.5 w-3.5" />
        User
      </Badge>
    </div>
  );
};

export default RoleSelector;
