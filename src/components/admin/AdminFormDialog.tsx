
import React from 'react';
import { format } from "date-fns";
import { Calendar as CalendarIcon, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { AdminUser } from "@/hooks/useAdminManagement";
import { UserRole } from "@/services/devices/deviceTypes";

interface AdminFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  formData: Partial<AdminUser>;
  avatarPreview: string | null;
  isEdit: boolean;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onRoleChange: (role: UserRole['role']) => void;
  onTagSelect: (tag: string) => void;
  onJoinDateChange: (date: Date | undefined) => void;
  onRenewalDateChange: (date: Date | undefined) => void;
  onAvatarChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: () => void;
}

const AdminFormDialog: React.FC<AdminFormDialogProps> = ({
  open,
  onOpenChange,
  formData,
  avatarPreview,
  isEdit,
  onInputChange,
  onRoleChange,
  onTagSelect,
  onJoinDateChange,
  onRenewalDateChange,
  onAvatarChange,
  onSubmit
}) => {
  const title = isEdit ? "Edit Administrator" : "Add Administrator";
  const description = isEdit ? "Update administrator information." : "Add a new administrator to the system.";
  const submitButtonText = isEdit ? "Update Administrator" : "Add Administrator";
  const avatarInputId = isEdit ? "edit-avatar-input" : "avatar-input";
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {description}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-6 py-4">
          <div className="flex items-center justify-center">
            <div className="flex flex-col items-center gap-2">
              <Avatar className="h-20 w-20">
                {avatarPreview ? (
                  <AvatarImage src={avatarPreview} alt="Preview" />
                ) : (
                  <AvatarFallback>
                    {formData.name ? formData.name.substring(0, 2).toUpperCase() : 
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    }
                  </AvatarFallback>
                )}
              </Avatar>
              <div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => document.getElementById(avatarInputId)?.click()}
                >
                  {isEdit ? "Change Avatar" : "Upload Avatar"}
                </Button>
                <input 
                  id={avatarInputId} 
                  type="file" 
                  className="hidden" 
                  accept="image/*"
                  onChange={onAvatarChange}
                />
                <p className="text-xs text-muted-foreground mt-1">Max size: 2MB</p>
              </div>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="name" className="text-sm font-medium">
                Name
              </label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={onInputChange}
                placeholder="Full name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={onInputChange}
                placeholder="Email address"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">
                Phone Number
              </label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={onInputChange}
                placeholder="Phone with country code"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="company" className="text-sm font-medium">
                Company
              </label>
              <Input
                id="company"
                name="company"
                value={formData.company || ''}
                onChange={onInputChange}
                placeholder="Company name"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="join-date" className="text-sm font-medium">
                Join Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.joinDate ? (
                      format(formData.joinDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.joinDate}
                    onSelect={onJoinDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="renewal-date" className="text-sm font-medium">
                Renewal Date
              </label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {formData.renewalDate ? (
                      format(formData.renewalDate, 'PPP')
                    ) : (
                      <span>Pick a date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={formData.renewalDate}
                    onSelect={onRenewalDateChange}
                    initialFocus
                    className="p-3 pointer-events-auto"
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="address" className="text-sm font-medium">
              Address
            </label>
            <Input
              id="address"
              name="address"
              value={formData.address || ''}
              onChange={onInputChange}
              placeholder="Full address"
            />
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Tags</label>
            <div className="flex flex-wrap gap-2">
              {['VIP', 'Premium', 'Enterprise'].map((tag) => (
                <Badge
                  key={tag}
                  variant={formData.tags?.includes(tag) ? "default" : "outline"}
                  className="cursor-pointer"
                  onClick={() => onTagSelect(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
          
          <div className="space-y-2">
            <label htmlFor="role" className="text-sm font-medium">
              Role
            </label>
            <Select
              value={formData.role}
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
            <label htmlFor="plan-details" className="text-sm font-medium">
              Plan Details
            </label>
            <Input
              id="plan-details"
              name="planDetails"
              value={formData.planDetails || ''}
              onChange={onInputChange}
              placeholder="Plan or subscription details"
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="notes" className="text-sm font-medium">
              Notes
            </label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={onInputChange}
              placeholder="Additional notes about this administrator"
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {submitButtonText}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDialog;
