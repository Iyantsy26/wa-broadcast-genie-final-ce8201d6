
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";
import { Json } from "@/integrations/supabase/types";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'agent';
  status: 'active' | 'inactive' | 'pending';
  whatsappAccounts: string[];
  whatsappPermissions?: any[];
  department?: string;
  lastActive?: string;
  position?: string;
  address?: string;
  company?: string;
}

export interface Department {
  id: string;
  name: string;
  description?: string;
  memberCount: number;
  leadName?: string;
}

export interface Role {
  id: string;
  name: string;
  permissions: string[];
  description: string;
}

// Team Member functions
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, department_id');
      
    if (error) {
      console.error('Error fetching team members:', error);
      throw error;
    }
    
    // Get WhatsApp account assignments for team members
    // Use a raw query to overcome typing issues with the RPC function
    const { data: accountAssignments, error: accountsError } = await supabase
      .from('team_member_whatsapp_accounts')
      .select('team_member_id, whatsapp_account_id');
      
    if (accountsError) {
      console.error('Error fetching WhatsApp account assignments:', accountsError);
    }
    
    // Get WhatsApp accounts data
    const { data: whatsappAccounts, error: whatsappError } = await supabase
      .from('whatsapp_accounts')
      .select('id, account_name');
      
    if (whatsappError) {
      console.error('Error fetching WhatsApp accounts:', whatsappError);
    }
    
    // Get departments data for mapping
    const { data: departments } = await supabase
      .from('departments')
      .select('id, name');
    
    const departmentMap = (departments || []).reduce((acc, dept) => {
      acc[dept.id] = dept.name;
      return acc;
    }, {} as Record<string, string>);
    
    // Create a map of team member IDs to their WhatsApp accounts
    const memberAccountsMap: Record<string, string[]> = {};
    
    if (accountAssignments) {
      accountAssignments.forEach((assignment: any) => {
        if (!memberAccountsMap[assignment.team_member_id]) {
          memberAccountsMap[assignment.team_member_id] = [];
        }
        
        const account = whatsappAccounts?.find(acc => acc.id === assignment.whatsapp_account_id);
        if (account) {
          memberAccountsMap[assignment.team_member_id].push(account.account_name);
        }
      });
    }
    
    // Convert database data to TeamMember interface
    return (data || []).map(member => ({
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      role: member.role as 'admin' | 'manager' | 'agent',
      status: member.status as 'active' | 'inactive' | 'pending',
      company: member.company,
      position: member.position,
      address: member.address,
      whatsappAccounts: memberAccountsMap[member.id] || [],
      whatsappPermissions: member.whatsapp_permissions ? 
        (Array.isArray(member.whatsapp_permissions) ? 
          member.whatsapp_permissions : 
          []) : 
        [],
      department: member.department_id ? departmentMap[member.department_id] : undefined,
      lastActive: member.last_active
    }));
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    return [];
  }
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | undefined> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select('*, department_id')
      .eq('id', id)
      .single();
      
    if (error) {
      console.error('Error fetching team member:', error);
      return undefined;
    }
    
    // Get the member's WhatsApp accounts using direct table query
    const { data: accountAssignments, error: assignError } = await supabase
      .from('team_member_whatsapp_accounts')
      .select('whatsapp_account_id')
      .eq('team_member_id', id);
      
    if (assignError) {
      console.error('Error fetching WhatsApp assignments:', assignError);
    }
    
    const accountIds = accountAssignments ? 
      accountAssignments.map(a => a.whatsapp_account_id) : [];
    
    // Get WhatsApp accounts data
    const { data: whatsappAccounts } = await supabase
      .from('whatsapp_accounts')
      .select('account_name')
      .in('id', accountIds.length > 0 ? accountIds : ['00000000-0000-0000-0000-000000000000']);
      
    // Get department name
    let departmentName;
    if (data.department_id) {
      const { data: department } = await supabase
        .from('departments')
        .select('name')
        .eq('id', data.department_id)
        .single();
        
      departmentName = department?.name;
    }
    
    // Parse whatsapp permissions safely
    let whatsappPermissions: any[] = [];
    if (data.whatsapp_permissions) {
      if (Array.isArray(data.whatsapp_permissions)) {
        whatsappPermissions = data.whatsapp_permissions;
      } else if (typeof data.whatsapp_permissions === 'object') {
        whatsappPermissions = [data.whatsapp_permissions];
      }
    }
    
    // Convert to TeamMember interface
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role as 'admin' | 'manager' | 'agent',
      status: data.status as 'active' | 'inactive' | 'pending',
      company: data.company,
      position: data.position,
      address: data.address,
      whatsappAccounts: whatsappAccounts?.map(acc => acc.account_name) || [],
      whatsappPermissions,
      department: departmentName,
      lastActive: data.last_active
    };
  } catch (error) {
    console.error('Error in getTeamMemberById:', error);
    return undefined;
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    // First, get the department ID if a department was provided
    let departmentId = null;
    if (member.department) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', member.department)
        .single();
        
      departmentId = deptData?.id;
    }
    
    // Insert the new member
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        email: member.email,
        phone: member.phone,
        avatar: member.avatar,
        role: member.role,
        status: member.status,
        position: member.position,
        address: member.address,
        company: member.company,
        department_id: departmentId,
        whatsapp_permissions: member.whatsappPermissions || [],
        last_active: member.lastActive || new Date().toISOString()
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error adding team member:', error);
      throw error;
    }
    
    // Now handle WhatsApp account assignments
    if (member.whatsappAccounts && member.whatsappAccounts.length > 0) {
      // First, get the IDs of the WhatsApp accounts
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('whatsapp_accounts')
        .select('id, account_name')
        .in('account_name', member.whatsappAccounts);
        
      if (whatsappError) {
        console.error('Error fetching WhatsApp accounts:', whatsappError);
      } else if (whatsappData && whatsappData.length > 0) {
        // Insert account assignments directly to the join table
        const assignments = whatsappData.map(account => ({
          team_member_id: data.id,
          whatsapp_account_id: account.id
        }));
        
        const { error: insertError } = await supabase
          .from('team_member_whatsapp_accounts')
          .insert(assignments);
          
        if (insertError) {
          console.error('Error assigning WhatsApp accounts:', insertError);
        }
      }
    }
    
    // Return the newly created team member
    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role as 'admin' | 'manager' | 'agent',
      status: data.status as 'active' | 'inactive' | 'pending',
      position: data.position,
      address: data.address,
      company: data.company,
      whatsappAccounts: member.whatsappAccounts || [],
      whatsappPermissions: member.whatsappPermissions || [],
      department: member.department,
      lastActive: data.last_active
    };
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    // If department name is provided, get the department ID
    let departmentId = undefined;
    if (updates.department) {
      const { data: deptData } = await supabase
        .from('departments')
        .select('id')
        .eq('name', updates.department)
        .single();
        
      departmentId = deptData?.id;
    }
    
    // Prepare the update data
    const updateData: any = {
      name: updates.name,
      email: updates.email,
      phone: updates.phone,
      avatar: updates.avatar,
      role: updates.role,
      status: updates.status,
      position: updates.position,
      address: updates.address,
      company: updates.company,
      whatsapp_permissions: updates.whatsappPermissions,
    };
    
    // Only add defined fields
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key];
      }
    });
    
    // Add department_id if it was resolved
    if (departmentId !== undefined) {
      updateData.department_id = departmentId;
    }
    
    // Update the team member in the database
    const { data, error } = await supabase
      .from('team_members')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
      
    if (error) {
      console.error('Error updating team member:', error);
      throw error;
    }
    
    // If WhatsApp accounts were updated, handle the assignments
    if (updates.whatsappAccounts) {
      // First, get the IDs of the WhatsApp accounts
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('whatsapp_accounts')
        .select('id, account_name');
        
      if (whatsappError) {
        console.error('Error fetching WhatsApp accounts:', whatsappError);
      } else if (whatsappData) {
        // Delete existing assignments directly
        const { error: deleteError } = await supabase
          .from('team_member_whatsapp_accounts')
          .delete()
          .eq('team_member_id', id);
          
        if (deleteError) {
          console.error('Error deleting existing assignments:', deleteError);
        }
        
        // Find the accounts that match the names in updates.whatsappAccounts
        const accountsToAssign = whatsappData.filter(account => 
          updates.whatsappAccounts?.includes(account.account_name)
        );
        
        if (accountsToAssign.length > 0) {
          // Insert new assignments directly
          const assignments = accountsToAssign.map(account => ({
            team_member_id: id,
            whatsapp_account_id: account.id
          }));
          
          const { error: assignError } = await supabase
            .from('team_member_whatsapp_accounts')
            .insert(assignments);
            
          if (assignError) {
            console.error('Error reassigning WhatsApp accounts:', assignError);
          }
        }
      }
    }
    
    // Get the updated team member with all related data
    const updatedMember = await getTeamMemberById(id);
    if (updatedMember) {
      return updatedMember;
    }
    
    // Parse whatsapp permissions safely
    let whatsappPermissions: any[] = [];
    if (data.whatsapp_permissions) {
      if (Array.isArray(data.whatsapp_permissions)) {
        whatsappPermissions = data.whatsapp_permissions;
      } else if (typeof data.whatsapp_permissions === 'object') {
        whatsappPermissions = [data.whatsapp_permissions];
      }
    }
    
    return {
      id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      avatar: data.avatar,
      role: data.role as 'admin' | 'manager' | 'agent',
      status: data.status as 'active' | 'inactive' | 'pending',
      position: data.position,
      address: data.address,
      company: data.company,
      whatsappAccounts: updates.whatsappAccounts || [],
      whatsappPermissions,
      department: updates.department,
      lastActive: data.last_active
    };
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    // First delete the WhatsApp account assignments directly
    const { error: assignError } = await supabase
      .from('team_member_whatsapp_accounts')
      .delete()
      .eq('team_member_id', id);
      
    if (assignError) {
      console.error('Error deleting team member WhatsApp assignments:', assignError);
    }
    
    // Then delete the team member
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteTeamMember:', error);
    throw error;
  }
};

export const activateTeamMember = async (id: string): Promise<TeamMember> => {
  return updateTeamMember(id, { status: 'active' });
};

export const deactivateTeamMember = async (id: string): Promise<TeamMember> => {
  return updateTeamMember(id, { status: 'inactive' });
};

// Get WhatsApp accounts that can be assigned to team members
export const getWhatsAppAccounts = async () => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_accounts')
      .select('id, account_name, phone_number, status');
      
    if (error) {
      throw error;
    }
    
    return data || [];
  } catch (error) {
    console.error('Error getting WhatsApp accounts:', error);
    return [];
  }
};

// Update team member's WhatsApp permissions
export const updateWhatsAppPermissions = async (
  teamMemberId: string, 
  accountIds: string[]
): Promise<void> => {
  try {
    // First, delete existing assignments directly
    const { error: deleteError } = await supabase
      .from('team_member_whatsapp_accounts')
      .delete()
      .eq('team_member_id', teamMemberId);
      
    if (deleteError) {
      console.error('Error deleting existing assignments:', deleteError);
      throw deleteError;
    }
    
    // Then insert new assignments directly
    if (accountIds.length > 0) {
      const assignments = accountIds.map(accountId => ({
        team_member_id: teamMemberId,
        whatsapp_account_id: accountId
      }));
      
      const { error: insertError } = await supabase
        .from('team_member_whatsapp_accounts')
        .insert(assignments);
        
      if (insertError) {
        console.error('Error inserting WhatsApp account assignments:', insertError);
        throw insertError;
      }
    }
  } catch (error) {
    console.error('Error updating WhatsApp permissions:', error);
    throw error;
  }
};

// In-memory department store
let mockDepartments: Department[] = [
  {
    id: '1',
    name: 'Customer Support',
    description: 'Handles customer inquiries and support tickets',
    memberCount: 5,
    leadName: 'John Doe',
  },
  {
    id: '2',
    name: 'Sales',
    description: 'Manages sales activities and client relationships',
    memberCount: 3,
    leadName: 'Jane Smith',
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Handles marketing campaigns and brand management',
    memberCount: 2,
    leadName: undefined,
  }
];

export const getDepartments = async (): Promise<Department[]> => {
  return [...mockDepartments];
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  return mockDepartments.find(dept => dept.id === id);
};

export const addDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  const newDepartment: Department = {
    id: uuidv4(),
    ...department
  };
  
  mockDepartments.push(newDepartment);
  return newDepartment;
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  const deptIndex = mockDepartments.findIndex(d => d.id === id);
  
  if (deptIndex === -1) {
    throw new Error("Department not found");
  }
  
  const updatedDepartment = {
    ...mockDepartments[deptIndex],
    ...updates,
    id: mockDepartments[deptIndex].id
  };
  
  mockDepartments[deptIndex] = updatedDepartment;
  return updatedDepartment;
};

export const deleteDepartment = async (id: string): Promise<void> => {
  mockDepartments = mockDepartments.filter(d => d.id !== id);
};

// Roles - these are still hardcoded as they're not stored in DB
export const roles: Role[] = [
  {
    id: '1',
    name: 'Administrator',
    permissions: [
      'Manage team members',
      'Manage WhatsApp accounts',
      'Create and edit templates',
      'Create and manage chatbots',
      'Access all conversations',
      'View analytics',
      'Configure system settings',
    ],
    description: 'Full access to all system features and settings',
  },
  {
    id: '2',
    name: 'Manager',
    permissions: [
      'Manage team members (limited)',
      'Create and edit templates',
      'Create and manage chatbots',
      'Access department conversations',
      'View analytics',
    ],
    description: 'Department-level management and oversight',
  },
  {
    id: '3',
    name: 'Agent',
    permissions: [
      'Handle assigned conversations',
      'Use templates',
      'View basic analytics',
    ],
    description: 'Handle customer conversations and basic tasks',
  },
];

export const getRoles = async (): Promise<Role[]> => {
  return Promise.resolve(roles);
};

export const getRoleById = async (id: string): Promise<Role | undefined> => {
  const role = roles.find(r => r.id === id);
  return Promise.resolve(role);
};

export const updateRolePermissions = async (id: string, permissions: string[]): Promise<Role> => {
  const roleIndex = roles.findIndex(r => r.id === id);
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  const updatedRole = { ...roles[roleIndex], permissions };
  roles[roleIndex] = updatedRole;
  return Promise.resolve(updatedRole);
};
