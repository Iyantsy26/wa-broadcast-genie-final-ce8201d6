
import React from 'react';
import { ShieldCheck, Building2, Users, User } from 'lucide-react';
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
    <div className="flex justify-end mb-6">
      <div className="flex items-center">
        <span className="text-sm font-medium text-muted-foreground mr-3">View as role (Demo):</span>
        
        <div className="flex space-x-2">
          <button
            onClick={() => onRoleChange('super_admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentRole === 'super_admin' 
                ? 'bg-amber-500 text-white' 
                : 'border border-input bg-background hover:bg-muted'
            }`}
          >
            <ShieldCheck className="h-4 w-4" />
            <span>Super Admin</span>
          </button>
          
          <button
            onClick={() => onRoleChange('white_label')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentRole === 'white_label' 
                ? 'bg-blue-500 text-white' 
                : 'border border-input bg-background hover:bg-muted'
            }`}
          >
            <Building2 className="h-4 w-4" />
            <span>White Label</span>
          </button>
          
          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentRole === 'admin' 
                ? 'bg-orange-500 text-white' 
                : 'border border-input bg-background hover:bg-muted'
            }`}
          >
            <Users className="h-4 w-4" />
            <span>Admin</span>
          </button>
          
          <button
            onClick={() => onRoleChange('user')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-colors ${
              currentRole === 'user' 
                ? 'bg-green-500 text-white' 
                : 'border border-input bg-background hover:bg-muted'
            }`}
          >
            <User className="h-4 w-4" />
            <span>User</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleSelector;
