
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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { UserCircle, Upload, X } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UserRole } from "@/services/devices/deviceTypes";
import { AdminUser } from '@/hooks/useAdminManagement';
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { format } from "date-fns";

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
  const availableTags = ["VIP", "Enterprise", "Premium", "New", "Partner"];
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-screen overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit Administrator" : "Add New Administrator"}</DialogTitle>
          <DialogDescription>
            {isEdit 
              ? "Update the administrator's information below." 
              : "Fill out the form below to add a new administrator."}
          </DialogDescription>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="flex flex-col items-center justify-center">
            <Avatar className="h-24 w-24 mb-2">
              {avatarPreview ? (
                <AvatarImage src={avatarPreview} alt="Avatar" />
              ) : (
                <AvatarFallback>
                  <UserCircle className="h-12 w-12" />
                </AvatarFallback>
              )}
            </Avatar>
            <div className="flex items-center mb-4">
              <Label htmlFor="avatar-upload" className="cursor-pointer">
                <div className="flex items-center text-sm text-primary">
                  <Upload className="mr-1 h-4 w-4" />
                  Change Avatar
                </div>
              </Label>
              <input
                id="avatar-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={onAvatarChange}
              />
            </div>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Name <span className="text-red-500">*</span></Label>
              <Input
                id="name"
                name="name"
                value={formData.name || ''}
                onChange={onInputChange}
                placeholder="Full name"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="email">Email <span className="text-red-500">*</span></Label>
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email || ''}
                onChange={onInputChange}
                placeholder="email@example.com"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                value={formData.phone || ''}
                onChange={onInputChange}
                placeholder="+1 (555) 123-4567"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="company">Company</Label>
              <Input
                id="company"
                name="company"
                value={formData.company || ''}
                onChange={onInputChange}
                placeholder="Company name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="position">Position</Label>
              <Input
                id="position"
                name="position"
                value={formData.position || ''}
                onChange={onInputChange}
                placeholder="Job position"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="address">Address</Label>
              <Input
                id="address"
                name="address"
                value={formData.address || ''}
                onChange={onInputChange}
                placeholder="Business address"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select 
                value={formData.role} 
                onValueChange={(value) => onRoleChange(value as UserRole['role'])}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="super_admin">Super Admin</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="user">User</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select 
                value={formData.status || 'active'} 
                onValueChange={(value) => onInputChange({
                  target: { name: 'status', value }
                } as React.ChangeEvent<HTMLInputElement>)}
              >
                <SelectTrigger id="status">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="suspended">Suspended</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label>Tags</Label>
            <div className="flex flex-wrap gap-2 mt-1">
              {availableTags.map(tag => (
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
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="joinDate">Join Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {formData.joinDate ? (
                      format(formData.joinDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.joinDate}
                    onSelect={onJoinDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="renewalDate">Renewal Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="w-full justify-start text-left font-normal"
                  >
                    {formData.renewalDate ? (
                      format(formData.renewalDate, "PPP")
                    ) : (
                      <span>Select date</span>
                    )}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0">
                  <Calendar
                    mode="single"
                    selected={formData.renewalDate}
                    onSelect={onRenewalDateChange}
                    initialFocus
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="planDetails">Plan Details</Label>
            <Input
              id="planDetails"
              name="planDetails"
              value={formData.planDetails || ''}
              onChange={onInputChange}
              placeholder="Subscription plan details"
            />
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              name="notes"
              value={formData.notes || ''}
              onChange={onInputChange}
              placeholder="Additional notes about this administrator"
              className="resize-none"
              rows={3}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={onSubmit}>
            {isEdit ? "Save Changes" : "Add Administrator"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AdminFormDialog;
