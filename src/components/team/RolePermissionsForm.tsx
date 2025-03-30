
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Role, updateRolePermissions } from '@/services/teamService';
import { useToast } from "@/hooks/use-toast";

// All possible permissions in the system
const allPermissions = [
  { id: "manage_team", label: "Manage team members" },
  { id: "manage_whatsapp", label: "Manage WhatsApp accounts" },
  { id: "manage_templates", label: "Create and edit templates" },
  { id: "manage_chatbots", label: "Create and manage chatbots" },
  { id: "access_all_conversations", label: "Access all conversations" },
  { id: "access_department_conversations", label: "Access department conversations" },
  { id: "view_analytics", label: "View analytics" },
  { id: "configure_settings", label: "Configure system settings" },
  { id: "handle_conversations", label: "Handle assigned conversations" },
  { id: "use_templates", label: "Use templates" },
  { id: "view_basic_analytics", label: "View basic analytics" },
  { id: "manage_broadcasts", label: "Manage broadcast campaigns" },
  { id: "manage_departments", label: "Manage departments" },
];

interface RolePermissionsFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
  onSuccess: () => void;
}

const RolePermissionsForm = ({
  open,
  onOpenChange,
  role,
  onSuccess
}: RolePermissionsFormProps) => {
  const { toast } = useToast();
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>(role.permissions);

  const handlePermissionChange = (permission: string, checked: boolean) => {
    if (checked) {
      setSelectedPermissions(prev => [...prev, permission]);
    } else {
      setSelectedPermissions(prev => prev.filter(p => p !== permission));
    }
  };

  const handleSave = async () => {
    try {
      await updateRolePermissions(role.id, selectedPermissions);
      
      toast({
        title: "Permissions updated",
        description: `Permissions for ${role.name} have been updated successfully`,
      });
      
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update permissions",
        variant: "destructive",
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Edit Permissions: {role.name}</DialogTitle>
          <DialogDescription>
            Configure which actions users with this role can perform
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4 max-h-[400px] overflow-y-auto">
          <div className="grid grid-cols-1 gap-4">
            {allPermissions.map((permission) => (
              <div 
                key={permission.id} 
                className="flex items-center space-x-2 p-2 rounded-md hover:bg-muted/50"
              >
                <Checkbox 
                  id={permission.id}
                  checked={selectedPermissions.includes(permission.label)}
                  onCheckedChange={(checked) => 
                    handlePermissionChange(permission.label, checked as boolean)
                  }
                />
                <Label 
                  htmlFor={permission.id}
                  className="cursor-pointer flex-1"
                >
                  {permission.label}
                </Label>
              </div>
            ))}
          </div>
        </div>
        
        <Separator />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>
            Save Permissions
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default RolePermissionsForm;
