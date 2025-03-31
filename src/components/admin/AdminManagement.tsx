
import React, { useState } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";
import {
  Edit,
  Trash,
  MoreVertical,
  Shield,
  UserPlus,
  UserX,
  Search,
  ShieldAlert,
  CheckCircle,
  Calendar,
  Upload,
} from "lucide-react";
import { format } from "date-fns";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { UserRole } from "@/services/devices/deviceTypes";

interface AdminUser {
  id: string;
  name: string;
  email: string;
  phone: string;
  company: string;
  avatar?: string;
  role: UserRole['role'];
  tags: string[];
  joinDate: Date;
  renewalDate?: Date;
  planDetails?: string;
  notes?: string;
  address?: string;
}

// Sample data for testing
const sampleAdmins: AdminUser[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 (555) 123-4567',
    company: 'Tech Corp',
    role: 'admin',
    tags: ['VIP', 'Enterprise'],
    joinDate: new Date('2023-01-15'),
    renewalDate: new Date('2024-01-15'),
    planDetails: 'Enterprise Plan',
    notes: 'Key decision maker',
    address: '123 Tech Street, Silicon Valley, CA'
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane@example.com',
    phone: '+1 (555) 987-6543',
    company: 'Marketing Inc',
    role: 'super_admin',
    tags: ['Premium'],
    joinDate: new Date('2023-03-22'),
    address: '456 Marketing Ave, New York, NY'
  },
  {
    id: '3',
    name: 'Mike Johnson',
    email: 'mike@example.com',
    phone: '+1 (555) 456-7890',
    company: 'Design Studio',
    role: 'user',
    tags: ['VIP'],
    joinDate: new Date('2023-06-10'),
    renewalDate: new Date('2024-06-10'),
    planDetails: 'Standard Plan',
    address: '789 Design Blvd, Austin, TX'
  }
];

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const AdminManagement = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>(sampleAdmins);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Form states
  const [formData, setFormData] = useState<Partial<AdminUser>>({
    name: '',
    email: '',
    phone: '',
    company: '',
    role: 'user',
    tags: [],
    joinDate: new Date(),
    address: '',
    planDetails: '',
    notes: '',
  });
  
  const filteredAdmins = admins.filter(admin => 
    admin.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
    admin.company?.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };
  
  const handleRoleChange = (role: UserRole['role']) => {
    setFormData(prev => ({ ...prev, role }));
  };
  
  const handleTagSelect = (tag: string) => {
    setFormData(prev => {
      const currentTags = prev.tags || [];
      if (currentTags.includes(tag)) {
        return { ...prev, tags: currentTags.filter(t => t !== tag) };
      } else {
        return { ...prev, tags: [...currentTags, tag] };
      }
    });
  };
  
  const handleJoinDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, joinDate: date }));
    }
  };
  
  const handleRenewalDateChange = (date: Date | undefined) => {
    if (date) {
      setFormData(prev => ({ ...prev, renewalDate: date }));
    }
  };
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) {
      return;
    }
    
    const file = e.target.files[0];
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Avatar image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setAvatarPreview(objectUrl);
  };
  
  const handleAddAdmin = () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    // Create a new admin with the form data
    const newAdmin: AdminUser = {
      id: Math.random().toString(36).substring(2, 11),
      name: formData.name || '',
      email: formData.email || '',
      phone: formData.phone || '',
      company: formData.company || '',
      role: formData.role || 'user',
      tags: formData.tags || [],
      joinDate: formData.joinDate || new Date(),
      renewalDate: formData.renewalDate,
      planDetails: formData.planDetails,
      notes: formData.notes,
      address: formData.address,
      avatar: avatarPreview || undefined
    };
    
    setAdmins([...admins, newAdmin]);
    resetForm();
    setIsAddDialogOpen(false);
    
    toast({
      title: "Admin added",
      description: `${newAdmin.name} has been added successfully.`,
    });
  };
  
  const handleEditAdmin = () => {
    if (!selectedAdmin || !formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    const updatedAdmins = admins.map(admin => {
      if (admin.id === selectedAdmin.id) {
        return {
          ...admin,
          name: formData.name || admin.name,
          email: formData.email || admin.email,
          phone: formData.phone || admin.phone,
          company: formData.company || admin.company,
          role: formData.role || admin.role,
          tags: formData.tags || admin.tags,
          joinDate: formData.joinDate || admin.joinDate,
          renewalDate: formData.renewalDate,
          planDetails: formData.planDetails,
          notes: formData.notes,
          address: formData.address,
          avatar: avatarPreview || admin.avatar
        };
      }
      return admin;
    });
    
    setAdmins(updatedAdmins);
    resetForm();
    setIsEditDialogOpen(false);
    
    toast({
      title: "Admin updated",
      description: `${formData.name} has been updated successfully.`,
    });
  };
  
  const handleDeleteAdmin = () => {
    if (!selectedAdmin) return;
    
    const updatedAdmins = admins.filter(admin => admin.id !== selectedAdmin.id);
    setAdmins(updatedAdmins);
    setIsDeleteDialogOpen(false);
    
    toast({
      title: "Admin deleted",
      description: `${selectedAdmin.name} has been deleted successfully.`,
    });
  };
  
  const handleSuspendAdmin = (adminId: string) => {
    // This would typically be a status change in the database
    toast({
      title: "Admin suspended",
      description: "The administrator has been suspended.",
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      role: 'user',
      tags: [],
      joinDate: new Date(),
      address: '',
      planDetails: '',
      notes: '',
    });
    setAvatarPreview(null);
    setSelectedFile(null);
    setSelectedAdmin(null);
  };
  
  const editAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setFormData({
      name: admin.name,
      email: admin.email,
      phone: admin.phone,
      company: admin.company,
      role: admin.role,
      tags: admin.tags,
      joinDate: admin.joinDate,
      renewalDate: admin.renewalDate,
      planDetails: admin.planDetails,
      notes: admin.notes,
      address: admin.address,
    });
    setAvatarPreview(admin.avatar || null);
    setIsEditDialogOpen(true);
  };
  
  const confirmDeleteAdmin = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsDeleteDialogOpen(true);
  };
  
  const manageRoles = (admin: AdminUser) => {
    setSelectedAdmin(admin);
    setIsRolesDialogOpen(true);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search administrators..."
            className="pl-8"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        <Button onClick={() => {
          resetForm();
          setIsAddDialogOpen(true);
        }}>
          <UserPlus className="h-4 w-4 mr-2" />
          Add Administrator
        </Button>
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]">Avatar</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Company</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Tags</TableHead>
              <TableHead>Join Date</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAdmins.length === 0 ? (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  No administrators found
                </TableCell>
              </TableRow>
            ) : (
              filteredAdmins.map((admin) => (
                <TableRow key={admin.id}>
                  <TableCell>
                    <Avatar className="h-8 w-8">
                      {admin.avatar ? (
                        <AvatarImage src={admin.avatar} alt={admin.name} />
                      ) : (
                        <AvatarFallback>
                          {admin.name.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      )}
                    </Avatar>
                  </TableCell>
                  <TableCell className="font-medium">{admin.name}</TableCell>
                  <TableCell>{admin.email}</TableCell>
                  <TableCell>{admin.company}</TableCell>
                  <TableCell>
                    {admin.role === 'super_admin' && (
                      <Badge variant="destructive" className="flex items-center w-fit">
                        <ShieldAlert className="h-3 w-3 mr-1" />
                        Super Admin
                      </Badge>
                    )}
                    {admin.role === 'admin' && (
                      <Badge variant="default" className="flex items-center w-fit">
                        <Shield className="h-3 w-3 mr-1" />
                        Admin
                      </Badge>
                    )}
                    {admin.role === 'user' && (
                      <Badge variant="secondary" className="flex items-center w-fit">
                        <CheckCircle className="h-3 w-3 mr-1" />
                        User
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {admin.tags.map((tag) => (
                        <Badge key={tag} variant="outline" className="text-xs">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell>{format(admin.joinDate, 'PP')}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => editAdmin(admin)}>
                          <Edit className="h-4 w-4 mr-2" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => manageRoles(admin)}>
                          <Shield className="h-4 w-4 mr-2" />
                          Manage Roles
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSuspendAdmin(admin.id)}>
                          <UserX className="h-4 w-4 mr-2" />
                          Suspend
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem 
                          onClick={() => confirmDeleteAdmin(admin)}
                          className="text-destructive focus:text-destructive"
                        >
                          <Trash className="h-4 w-4 mr-2" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
      
      {/* Add Administrator Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Add Administrator</DialogTitle>
            <DialogDescription>
              Add a new administrator to the system.
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
                      <Upload className="h-8 w-8 text-muted-foreground" />
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('avatar-input')?.click()}
                  >
                    Upload Avatar
                  </Button>
                  <input 
                    id="avatar-input" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
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
                  value={formData.name}
                  onChange={handleInputChange}
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
                  value={formData.email}
                  onChange={handleInputChange}
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
                  value={formData.phone}
                  onChange={handleInputChange}
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
                  value={formData.company}
                  onChange={handleInputChange}
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
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.joinDate ? (
                        format(formData.joinDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.joinDate}
                      onSelect={handleJoinDateChange}
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
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.renewalDate ? (
                        format(formData.renewalDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.renewalDate}
                      onSelect={handleRenewalDateChange}
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
                value={formData.address}
                onChange={handleInputChange}
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
                    onClick={() => handleTagSelect(tag)}
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
                onValueChange={(value) => handleRoleChange(value as UserRole['role'])}
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
                value={formData.planDetails}
                onChange={handleInputChange}
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
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this administrator"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddAdmin}>
              Add Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Administrator Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Edit Administrator</DialogTitle>
            <DialogDescription>
              Update administrator information.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-6 py-4">
            {/* Same form fields as Add Administrator dialog */}
            <div className="flex items-center justify-center">
              <div className="flex flex-col items-center gap-2">
                <Avatar className="h-20 w-20">
                  {avatarPreview ? (
                    <AvatarImage src={avatarPreview} alt="Preview" />
                  ) : (
                    <AvatarFallback>
                      {formData.name?.substring(0, 2).toUpperCase() || ""}
                    </AvatarFallback>
                  )}
                </Avatar>
                <div>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => document.getElementById('edit-avatar-input')?.click()}
                  >
                    Change Avatar
                  </Button>
                  <input 
                    id="edit-avatar-input" 
                    type="file" 
                    className="hidden" 
                    accept="image/*"
                    onChange={handleAvatarChange}
                  />
                  <p className="text-xs text-muted-foreground mt-1">Max size: 2MB</p>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="edit-name" className="text-sm font-medium">
                  Name
                </label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Full name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-email" className="text-sm font-medium">
                  Email
                </label>
                <Input
                  id="edit-email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="Email address"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-phone" className="text-sm font-medium">
                  Phone Number
                </label>
                <Input
                  id="edit-phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="Phone with country code"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-company" className="text-sm font-medium">
                  Company
                </label>
                <Input
                  id="edit-company"
                  name="company"
                  value={formData.company}
                  onChange={handleInputChange}
                  placeholder="Company name"
                />
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-join-date" className="text-sm font-medium">
                  Join Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.joinDate ? (
                        format(formData.joinDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.joinDate}
                      onSelect={handleJoinDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
              
              <div className="space-y-2">
                <label htmlFor="edit-renewal-date" className="text-sm font-medium">
                  Renewal Date
                </label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className="w-full justify-start text-left font-normal"
                    >
                      <Calendar className="mr-2 h-4 w-4" />
                      {formData.renewalDate ? (
                        format(formData.renewalDate, 'PPP')
                      ) : (
                        <span>Pick a date</span>
                      )}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <CalendarComponent
                      mode="single"
                      selected={formData.renewalDate}
                      onSelect={handleRenewalDateChange}
                      initialFocus
                      className="p-3 pointer-events-auto"
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-address" className="text-sm font-medium">
                Address
              </label>
              <Input
                id="edit-address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
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
                    onClick={() => handleTagSelect(tag)}
                  >
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-role" className="text-sm font-medium">
                Role
              </label>
              <Select
                value={formData.role}
                onValueChange={(value) => handleRoleChange(value as UserRole['role'])}
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
              <label htmlFor="edit-plan-details" className="text-sm font-medium">
                Plan Details
              </label>
              <Input
                id="edit-plan-details"
                name="planDetails"
                value={formData.planDetails}
                onChange={handleInputChange}
                placeholder="Plan or subscription details"
              />
            </div>
            
            <div className="space-y-2">
              <label htmlFor="edit-notes" className="text-sm font-medium">
                Notes
              </label>
              <Textarea
                id="edit-notes"
                name="notes"
                value={formData.notes}
                onChange={handleInputChange}
                placeholder="Additional notes about this administrator"
              />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditAdmin}>
              Update Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete {selectedAdmin?.name}? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeleteAdmin}>
              Delete Administrator
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Roles & Permissions Dialog */}
      <Dialog open={isRolesDialogOpen} onOpenChange={setIsRolesDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Roles & Permissions</DialogTitle>
            <DialogDescription>
              Manage roles and permissions for {selectedAdmin?.name}
            </DialogDescription>
          </DialogHeader>
          <div className="py-4">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">User Role</label>
                <Select
                  value={formData.role}
                  onValueChange={(value) => handleRoleChange(value as UserRole['role'])}
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
                  {formData.role === 'super_admin' ? (
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
                            defaultChecked={formData.role === 'admin'}
                            disabled={formData.role === 'user'}
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
            <Button variant="outline" onClick={() => setIsRolesDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={() => {
              toast({
                title: "Roles updated",
                description: "The user's roles and permissions have been updated.",
              });
              setIsRolesDialogOpen(false);
            }}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminManagement;
