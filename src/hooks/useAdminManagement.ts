
import { useState } from 'react';
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/services/devices/deviceTypes";

export interface AdminUser {
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

export const useAdminManagement = () => {
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
    
    if (file.size > 2 * 1024 * 1024) { // 2MB
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

  return {
    admins,
    filteredAdmins,
    searchQuery,
    setSearchQuery,
    selectedAdmin,
    isAddDialogOpen,
    setIsAddDialogOpen,
    isEditDialogOpen,
    setIsEditDialogOpen,
    isDeleteDialogOpen,
    setIsDeleteDialogOpen,
    isRolesDialogOpen,
    setIsRolesDialogOpen,
    avatarPreview,
    formData,
    handleInputChange,
    handleRoleChange,
    handleTagSelect,
    handleJoinDateChange,
    handleRenewalDateChange,
    handleAvatarChange,
    handleAddAdmin,
    handleEditAdmin,
    handleDeleteAdmin,
    handleSuspendAdmin,
    resetForm,
    editAdmin,
    confirmDeleteAdmin,
    manageRoles
  };
};
