
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { AdminUser } from '@/hooks/useAdminManagement';
import { UserRole } from '@/services/devices/deviceTypes';

interface AdminRolesDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  admin: AdminUser | null;
  role: UserRole['role'] | undefined;
  onRoleChange: (role: UserRole['role']) => void;
}

const AdminRolesDialog: React.FC<AdminRolesDialogProps> = ({
  open,
  onOpenChange,
  admin,
  role,
  onRoleChange
}) => {
  const { toast } = useToast();
  
  const handleSaveChanges = () => {
    toast({
      title: "Roles updated",
      description: "The user's roles and permissions have been updated.",
    });
    onOpenChange(false);
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Roles & Permissions</DialogTitle>
          <DialogDescription>
            Manage roles and permissions for {admin?.name}
          </DialogDescription>
        </DialogHeader>
        <div className="py-4">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">User Role</label>
              <Select
                value={role}
                onValueChange={(value) => onRoleChange(value as UserRole['role'])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium">Permissions</label>
              <div className="border rounded-md p-4 space-y-2">
                {role === 'super_admin' ? (
                  <p className="text-sm text-muted-foreground">Super Admins have all permissions.</p>
                ) : (
                  <>
                    {[
                      "Manage users", 
                      "Manage devices", 
                      "View analytics", 
                      "Manage settings",
                      "Manage plans",
                      "Manage billing",
                      "Access API keys"
                    ].map((permission) => (
                      <div key={permission} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          id={`permission-${permission.toLowerCase().replace(/\s+/g, '-')}`}
                          className="rounded border-gray-300 text-primary focus:ring-primary"
                          defaultChecked={role === 'admin'}
                          disabled={role === 'user'}
                        />
                        <label
                          htmlFor={`permission-${permission.toLowerCase().replace(/\s+/g, '-')}`}
                          className="text-sm"
                        >
                          {permission}
                        </label>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveChanges}>
            Save Changes
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminRolesDialog;
