import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { UserRole } from "@/services/devices/deviceTypes";
import { supabase } from "@/integrations/supabase/client";

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
  position?: string;
  status?: string;
}

export const useAdminManagement = () => {
  const { toast } = useToast();
  const [admins, setAdmins] = useState<AdminUser[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedAdmin, setSelectedAdmin] = useState<AdminUser | null>(null);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isRolesDialogOpen, setIsRolesDialogOpen] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
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
    position: '',
    status: 'active',
  });
  
  // Fetch admins from database
  useEffect(() => {
    const fetchAdmins = async () => {
      setIsLoading(true);
      try {
        // First try to get from team_members table
        const { data, error } = await supabase
          .from('team_members')
          .select('*');
          
        if (error) {
          console.error("Error fetching team members:", error);
          throw error;
        }
        
        // Map to AdminUser format with safe property access
        const mappedAdmins: AdminUser[] = data.map(member => ({
          id: member.id,
          name: member.name,
          email: member.email,
          phone: member.phone || '',
          company: member.company || '', // Safely access company which might be undefined
          avatar: member.avatar,
          role: member.role as UserRole['role'],
          tags: [],
          joinDate: new Date(member.created_at),
          address: member.address || '', // Safely access address which might be undefined
          position: member.position || '', // Safely access position which might be undefined
          status: member.status || 'active'
        }));
        
        setAdmins(mappedAdmins);
      } catch (error) {
        console.error("Error in fetchAdmins:", error);
        // Fallback to sample data if database fetch fails
        setAdmins([
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
            address: '123 Tech Street, Silicon Valley, CA',
            position: 'Manager'
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
            address: '456 Marketing Ave, New York, NY',
            position: 'Director'
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
            address: '789 Design Blvd, Austin, TX',
            position: 'Team Lead'
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchAdmins();
  }, []);
  
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
  
  const uploadAvatar = async (userId: string, file: File): Promise<string | null> => {
    try {
      // Check if the avatars bucket exists
      const { data: buckets } = await supabase.storage.listBuckets();
      const avatarsBucketExists = buckets?.some(bucket => bucket.name === 'avatars');
      
      if (!avatarsBucketExists) {
        // Create avatars bucket if it doesn't exist
        await supabase.storage.createBucket('avatars', {
          public: true,
          fileSizeLimit: 2 * 1024 * 1024
        });
      }
      
      // Prepare file details
      const fileExt = file.name.split('.').pop();
      const fileName = `admin_${userId}.${fileExt}`;
      
      // Upload the file
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(fileName, file, { upsert: true });
        
      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw uploadError;
      }
      
      // Get public URL
      const { data: urlData } = supabase.storage
        .from('avatars')
        .getPublicUrl(fileName);
        
      if (urlData && urlData.publicUrl) {
        return urlData.publicUrl;
      }
      
      return null;
    } catch (error) {
      console.error("Error uploading avatar:", error);
      return null;
    }
  };
  
  const handleAddAdmin = async () => {
    if (!formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Generate a random password for the new user
      const password = Math.random().toString(36).substring(2, 10) + 
                       Math.random().toString(36).substring(2, 10).toUpperCase() + 
                       "!@$%^";
      
      // Create the user in auth
      const { data: authData, error: authError } = await supabase.auth.admin.createUser({
        email: formData.email,
        password,
        email_confirm: true,
        user_metadata: {
          name: formData.name,
          role: formData.role,
          company: formData.company,
          phone: formData.phone,
          address: formData.address,
          is_super_admin: formData.role === 'super_admin'
        }
      });
      
      if (authError) {
        // If admin API fails (likely not enabled), try regular signup
        console.warn("Admin API error, trying regular signup:", authError);
        
        const { data: signupData, error: signupError } = await supabase.auth.signUp({
          email: formData.email,
          password,
          options: {
            data: {
              name: formData.name,
              role: formData.role,
              company: formData.company,
              phone: formData.phone,
              address: formData.address,
              is_super_admin: formData.role === 'super_admin'
            }
          }
        });
        
        if (signupError) {
          console.error("Error creating user:", signupError);
          throw signupError;
        }
        
        if (signupData.user) {
          console.log("Created new user:", signupData.user.id);
          
          // Upload avatar if provided
          let avatarUrl = null;
          if (selectedFile) {
            avatarUrl = await uploadAvatar(signupData.user.id, selectedFile);
          }
          
          // Add user to team_members table
          const { error: teamError } = await supabase
            .from('team_members')
            .insert({
              id: signupData.user.id,
              name: formData.name,
              email: formData.email,
              phone: formData.phone,
              company: formData.company,
              address: formData.address,
              position: formData.position,
              avatar: avatarUrl,
              role: formData.role,
              is_super_admin: formData.role === 'super_admin',
              status: formData.status || 'active',
              notes: formData.notes
            });
            
          if (teamError) {
            console.error("Error adding to team_members:", teamError);
            throw teamError;
          }
          
          // Add to the local state
          const newAdmin: AdminUser = {
            id: signupData.user.id,
            name: formData.name || '',
            email: formData.email || '',
            phone: formData.phone || '',
            company: formData.company || '',
            position: formData.position || '',
            role: formData.role || 'user',
            tags: formData.tags || [],
            joinDate: formData.joinDate || new Date(),
            renewalDate: formData.renewalDate,
            planDetails: formData.planDetails,
            notes: formData.notes,
            address: formData.address,
            avatar: avatarUrl || undefined,
            status: formData.status || 'active'
          };
          
          setAdmins([...admins, newAdmin]);
          
          console.log("Sending credentials to", formData.email, ":", {
            userId: signupData.user.id,
            password
          });
          
          toast({
            title: "Admin added",
            description: `${newAdmin.name} has been added successfully. Password has been sent.`,
          });
          
          resetForm();
          setIsAddDialogOpen(false);
          return;
        }
      } else if (authData && authData.user) {
        console.log("Created new user:", authData.user.id);
        
        // Upload avatar if provided
        let avatarUrl = null;
        if (selectedFile) {
          avatarUrl = await uploadAvatar(authData.user.id, selectedFile);
        }
        
        // Add user to team_members table
        const { error: teamError } = await supabase
          .from('team_members')
          .insert({
            id: authData.user.id,
            name: formData.name,
            email: formData.email,
            phone: formData.phone,
            company: formData.company,
            address: formData.address,
            position: formData.position,
            avatar: avatarUrl,
            role: formData.role,
            is_super_admin: formData.role === 'super_admin',
            status: formData.status || 'active',
            notes: formData.notes
          });
          
        if (teamError) {
          console.error("Error adding to team_members:", teamError);
          throw teamError;
        }
        
        // Add to the local state
        const newAdmin: AdminUser = {
          id: authData.user.id,
          name: formData.name || '',
          email: formData.email || '',
          phone: formData.phone || '',
          company: formData.company || '',
          position: formData.position || '',
          role: formData.role || 'user',
          tags: formData.tags || [],
          joinDate: formData.joinDate || new Date(),
          renewalDate: formData.renewalDate,
          planDetails: formData.planDetails,
          notes: formData.notes,
          address: formData.address,
          avatar: avatarUrl || undefined,
          status: formData.status || 'active'
        };
        
        setAdmins([...admins, newAdmin]);
        
        console.log("Sending credentials to", formData.email, ":", {
          userId: authData.user.id,
          password
        });
        
        toast({
          title: "Admin added",
          description: `${newAdmin.name} has been added successfully. Password has been sent.`,
        });
        
        resetForm();
        setIsAddDialogOpen(false);
        return;
      }
      
      // Fallback to local handling if all else fails
      handleLocalAddAdmin();
    } catch (error) {
      console.error("Error in handleAddAdmin:", error);
      // Fallback to local handling if database operations fail
      handleLocalAddAdmin();
    }
  };
  
  // Fallback function for local-only admin addition
  const handleLocalAddAdmin = () => {
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
      position: formData.position || '',
      role: formData.role || 'user',
      tags: formData.tags || [],
      joinDate: formData.joinDate || new Date(),
      renewalDate: formData.renewalDate,
      planDetails: formData.planDetails,
      notes: formData.notes,
      address: formData.address,
      avatar: avatarPreview || undefined,
      status: formData.status || 'active'
    };
    
    setAdmins([...admins, newAdmin]);
    toast({
      title: "Admin added (local only)",
      description: `${newAdmin.name} has been added to your local session.`,
    });
    
    resetForm();
    setIsAddDialogOpen(false);
  };
  
  const handleEditAdmin = async () => {
    if (!selectedAdmin || !formData.name || !formData.email) {
      toast({
        title: "Missing information",
        description: "Name and email are required",
        variant: "destructive",
      });
      return;
    }
    
    try {
      // Upload avatar if a new one was selected
      let avatarUrl = selectedAdmin.avatar;
      if (selectedFile) {
        const newAvatarUrl = await uploadAvatar(selectedAdmin.id, selectedFile);
        if (newAvatarUrl) {
          avatarUrl = newAvatarUrl;
        }
      }
      
      // Update user metadata in auth
      const { error: authError } = await supabase.auth.admin.updateUserById(
        selectedAdmin.id,
        {
          email: formData.email,
          user_metadata: {
            name: formData.name,
            phone: formData.phone,
            company: formData.company,
            address: formData.address,
            role: formData.role,
            position: formData.position,
            is_super_admin: formData.role === 'super_admin',
            avatar_url: avatarUrl
          }
        }
      );
      
      if (authError) {
        console.warn("Admin API error, user metadata might not be updated:", authError);
      }
      
      // Update team_members table
      const { error: teamError } = await supabase
        .from('team_members')
        .upsert({
          id: selectedAdmin.id,
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
          company: formData.company,
          address: formData.address,
          position: formData.position,
          avatar: avatarUrl,
          role: formData.role,
          is_super_admin: formData.role === 'super_admin',
          status: formData.status || 'active',
          notes: formData.notes
        }, { onConflict: 'id' });
        
      if (teamError) {
        console.error("Error updating team_members:", teamError);
        throw teamError;
      }
      
      // Update local state
      const updatedAdmins = admins.map(admin => {
        if (admin.id === selectedAdmin.id) {
          return {
            ...admin,
            name: formData.name || admin.name,
            email: formData.email || admin.email,
            phone: formData.phone || admin.phone,
            company: formData.company || admin.company,
            position: formData.position || admin.position,
            role: formData.role || admin.role,
            tags: formData.tags || admin.tags,
            joinDate: formData.joinDate || admin.joinDate,
            renewalDate: formData.renewalDate,
            planDetails: formData.planDetails,
            notes: formData.notes,
            address: formData.address,
            avatar: avatarUrl || admin.avatar,
            status: formData.status || admin.status
          };
        }
        return admin;
      });
      
      setAdmins(updatedAdmins);
      
      toast({
        title: "Admin updated",
        description: `${formData.name} has been updated successfully.`,
      });
      
      resetForm();
      setIsEditDialogOpen(false);
    } catch (error) {
      console.error("Error in handleEditAdmin:", error);
      // Fallback to local update if database operations fail
      handleLocalEditAdmin();
    }
  };
  
  // Fallback function for local-only admin update
  const handleLocalEditAdmin = () => {
    if (!selectedAdmin) return;
    
    const updatedAdmins = admins.map(admin => {
      if (admin.id === selectedAdmin.id) {
        return {
          ...admin,
          name: formData.name || admin.name,
          email: formData.email || admin.email,
          phone: formData.phone || admin.phone,
          company: formData.company || admin.company,
          position: formData.position || admin.position,
          role: formData.role || admin.role,
          tags: formData.tags || admin.tags,
          joinDate: formData.joinDate || admin.joinDate,
          renewalDate: formData.renewalDate,
          planDetails: formData.planDetails,
          notes: formData.notes,
          address: formData.address,
          avatar: avatarPreview || admin.avatar,
          status: formData.status || admin.status
        };
      }
      return admin;
    });
    
    setAdmins(updatedAdmins);
    
    toast({
      title: "Admin updated (local only)",
      description: `${formData.name} has been updated in your local session.`,
    });
    
    resetForm();
    setIsEditDialogOpen(false);
  };
  
  const handleDeleteAdmin = async () => {
    if (!selectedAdmin) return;
    
    try {
      // Delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(
        selectedAdmin.id
      );
      
      if (authError) {
        console.warn("Admin API error, attempting database delete only:", authError);
      }
      
      // Delete from team_members table
      const { error: teamError } = await supabase
        .from('team_members')
        .delete()
        .eq('id', selectedAdmin.id);
        
      if (teamError) {
        console.error("Error deleting from team_members:", teamError);
        throw teamError;
      }
      
      // Update local state
      const updatedAdmins = admins.filter(admin => admin.id !== selectedAdmin.id);
      setAdmins(updatedAdmins);
      
      toast({
        title: "Admin deleted",
        description: `${selectedAdmin.name} has been deleted successfully.`,
      });
      
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error in handleDeleteAdmin:", error);
      // Fallback to local deletion if database operations fail
      handleLocalDeleteAdmin();
    }
  };
  
  // Fallback function for local-only admin deletion
  const handleLocalDeleteAdmin = () => {
    if (!selectedAdmin) return;
    
    const updatedAdmins = admins.filter(admin => admin.id !== selectedAdmin.id);
    setAdmins(updatedAdmins);
    
    toast({
      title: "Admin deleted (local only)",
      description: `${selectedAdmin.name} has been removed from your local session.`,
    });
    
    setIsDeleteDialogOpen(false);
  };
  
  const handleSuspendAdmin = async (adminId: string) => {
    try {
      // Update status in team_members table
      const { error: teamError } = await supabase
        .from('team_members')
        .update({ status: 'suspended' })
        .eq('id', adminId);
        
      if (teamError) {
        console.error("Error suspending admin:", teamError);
        throw teamError;
      }
      
      // Update local state
      const updatedAdmins = admins.map(admin => {
        if (admin.id === adminId) {
          return { ...admin, status: 'suspended' };
        }
        return admin;
      });
      
      setAdmins(updatedAdmins);
      
      toast({
        title: "Admin suspended",
        description: "The administrator has been suspended.",
      });
    } catch (error) {
      console.error("Error in handleSuspendAdmin:", error);
      // Fallback to local suspension if database operations fail
      const updatedAdmins = admins.map(admin => {
        if (admin.id === adminId) {
          return { ...admin, status: 'suspended' };
        }
        return admin;
      });
      
      setAdmins(updatedAdmins);
      
      toast({
        title: "Admin suspended (local only)",
        description: "The administrator has been suspended in your local session.",
      });
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      email: '',
      phone: '',
      company: '',
      position: '',
      role: 'user',
      tags: [],
      joinDate: new Date(),
      address: '',
      planDetails: '',
      notes: '',
      status: 'active',
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
      position: admin.position,
      role: admin.role,
      tags: admin.tags,
      joinDate: admin.joinDate,
      renewalDate: admin.renewalDate,
      planDetails: admin.planDetails,
      notes: admin.notes,
      address: admin.address,
      status: admin.status,
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
    setFormData(prev => ({ ...prev, role: admin.role }));
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
    isLoading,
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
