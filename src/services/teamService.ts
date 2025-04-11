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
    const result = (data || []).map(member => ({
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
    
    console.log("Fetched team members:", result);
    return result;
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
    
    // Get the member's WhatsApp accounts
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
    
    // Return mock data as fallback
    const mockMember = mockTeamMembers.find(m => m.id === id);
    return mockMember;
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    console.log("Adding team member:", member);
    
    // Generate a UUID for the new member
    const memberId = uuidv4();
    
    // Try to get the department ID if a department was provided
    let departmentId = null;
    if (member.department) {
      try {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id')
          .eq('name', member.department)
          .single();
          
        departmentId = deptData?.id;
      } catch (error) {
        console.error("Error finding department:", error);
      }
    }
    
    // Create the new team member record
    const { data, error } = await supabase
      .from('team_members')
      .insert({
        id: memberId,
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
        last_active: new Date().toISOString(),
      })
      .select();

    if (error) {
      console.error("Database error when inserting team member:", error);
      throw error;
    }
    
    // Handle WhatsApp account assignments if provided
    if (member.whatsappAccounts && member.whatsappAccounts.length > 0) {
      // Lookup the account IDs by name
      for (const accountName of member.whatsappAccounts) {
        try {
          const { data: accountData } = await supabase
            .from('whatsapp_accounts')
            .select('id')
            .eq('account_name', accountName)
            .single();
            
          if (accountData) {
            await supabase
              .from('team_member_whatsapp_accounts')
              .insert({
                team_member_id: memberId,
                whatsapp_account_id: accountData.id
              });
          }
        } catch (error) {
          console.error(`Error assigning WhatsApp account ${accountName}:`, error);
        }
      }
    }
    
    // Create the complete team member object to return
    const newMember: TeamMember = {
      id: memberId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      role: member.role,
      status: member.status,
      position: member.position,
      address: member.address,
      company: member.company,
      whatsappAccounts: member.whatsappAccounts || [],
      whatsappPermissions: member.whatsappPermissions || [],
      department: member.department,
      lastActive: member.lastActive || new Date().toISOString()
    };

    return newMember;
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    throw error;
  }
};

/**
 * Update a team member's details
 */
export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    console.log(`Updating team member ${id} with:`, updates);
    
    // If department name is provided, get the department ID
    let departmentId = undefined;
    if (updates.department) {
      try {
        const { data: deptData } = await supabase
          .from('departments')
          .select('id')
          .eq('name', updates.department)
          .single();
          
        departmentId = deptData?.id;
      } catch (error) {
        console.error("Error finding department:", error);
      }
    }
    
    // Prepare the update data for the database
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map fields from the updates object to database columns
    if (updates.name) updateData.name = updates.name;
    if (updates.email) updateData.email = updates.email;
    if (updates.phone) updateData.phone = updates.phone;
    if (updates.avatar) updateData.avatar = updates.avatar;
    if (updates.role) updateData.role = updates.role;
    if (updates.status) updateData.status = updates.status;
    if (updates.position) updateData.position = updates.position;
    if (updates.address) updateData.address = updates.address;
    if (updates.company) updateData.company = updates.company;
    if (departmentId !== undefined) updateData.department_id = departmentId;
    
    // Try to update in the database first
    try {
      const { data, error } = await supabase
        .from('team_members')
        .update(updateData)
        .eq('id', id)
        .select('*')
        .single();
      
      if (error) {
        console.error("Error updating team member in database:", error);
        throw error;
      }
      
      console.log("Updated team member in database:", data);
      
      // Now update the mock data as a backup
      const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
      if (memberIndex >= 0) {
        mockTeamMembers[memberIndex] = {
          ...mockTeamMembers[memberIndex],
          ...updates,
          lastActive: new Date().toISOString()
        };
      }
      
      // Fetch the updated team member to return
      const updatedMember = await getTeamMemberById(id);
      if (updatedMember) {
        return updatedMember;
      }
    } catch (error) {
      console.error("Database update failed, falling back to mock data:", error);
    }
    
    // Fallback to mock data if database update fails
    const mockMember = mockTeamMembers.find(m => m.id === id);
    if (!mockMember) {
      throw new Error("Team member not found in mock data");
    }
    
    // Update the mock member
    const updatedMember: TeamMember = {
      ...mockMember,
      ...updates,
    };
    
    // Update the mock data
    const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
    if (memberIndex >= 0) {
      mockTeamMembers[memberIndex] = updatedMember;
    }
    
    console.log('Updated mock team member:', updatedMember);
    
    return updatedMember;
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting team member:', error);
      throw error;
    }
    
    console.log('Successfully deleted team member with ID:', id);
  } catch (error) {
    console.error('Error in deleteTeamMember:', error);
    throw error;
  }
};

/**
 * Activate a team member (change status to 'active')
 */
export const activateTeamMember = async (id: string): Promise<TeamMember> => {
  console.log(`Activating team member with ID: ${id}`);
  try {
    // Update in the database
    const { data, error } = await supabase
      .from('team_members')
      .update({ 
        status: 'active',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error activating team member in database:", error);
      throw error;
    }
    
    // Get the updated team member details
    return getTeamMemberById(id) as Promise<TeamMember>;
  } catch (error) {
    console.error('Error in activateTeamMember:', error);
    throw error;
  }
};

/**
 * Deactivate a team member (change status to 'inactive')
 */
export const deactivateTeamMember = async (id: string): Promise<TeamMember> => {
  console.log(`Deactivating team member with ID: ${id}`);
  try {
    // Update in the database
    const { data, error } = await supabase
      .from('team_members')
      .update({ 
        status: 'inactive',
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error("Error deactivating team member in database:", error);
      throw error;
    }

    // Get the updated team member details
    return getTeamMemberById(id) as Promise<TeamMember>;
  } catch (error) {
    console.error('Error in deactivateTeamMember:', error);
    throw error;
  }
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
    // In a real app, we would update the database
    // Here we'll just log the operation
    console.log(`Mock operation: Updated WhatsApp permissions for team member ${teamMemberId}:`, accountIds);
    
    // Find and update the member in our mock data
    const memberIndex = mockTeamMembers.findIndex(m => m.id === teamMemberId);
    if (memberIndex >= 0) {
      // This is a simplified version - in reality we'd need to map accountIds to account names
      mockTeamMembers[memberIndex].whatsappAccounts = accountIds.map(id => `Account ${id.substring(0, 8)}`);
    }
  } catch (error) {
    console.error('Error updating WhatsApp permissions:', error);
    throw error;
  }
};

export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*');

    if (error) {
      throw error;
    }

    // For each department, count the number of team members
    const departmentsWithCounts: Department[] = [];
    
    for (const dept of data || []) {
      const { count, error: countError } = await supabase
        .from('team_members')
        .select('*', { count: 'exact', head: true })
        .eq('department_id', dept.id);
      
      if (countError) {
        console.error('Error counting department members:', countError);
      }
      
      // Try to get lead name if lead_id exists
      let leadName;
      if (dept.lead_id) {
        const { data: leadData } = await supabase
          .from('team_members')
          .select('name')
          .eq('id', dept.lead_id)
          .single();
        
        if (leadData) {
          leadName = leadData.name;
        }
      }
      
      departmentsWithCounts.push({
        id: dept.id,
        name: dept.name,
        description: dept.description,
        memberCount: count || 0,
        leadName
      });
    }
    
    return departmentsWithCounts;
  } catch (error) {
    console.error('Error in getDepartments:', error);
    return [];
  }
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  return mockDepartments.find(dept => dept.id === id);
};

export const addDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .insert({
        name: department.name,
        description: department.description,
        lead_id: null // We'll need to find the lead ID based on name if provided
      })
      .select();

    if (error) {
      throw error;
    }

    const newDept = data[0];
    
    // Find and assign a lead by name if provided
    if (department.leadName) {
      try {
        const { data: leadData } = await supabase
          .from('team_members')
          .select('id')
          .eq('name', department.leadName)
          .single();
        
        if (leadData) {
          await supabase
            .from('departments')
            .update({ lead_id: leadData.id })
            .eq('id', newDept.id);
        }
      } catch (error) {
        console.error('Error finding team lead by name:', error);
      }
    }
    
    return {
      id: newDept.id,
      name: department.name,
      description: department.description || undefined,
      memberCount: 0,
      leadName: department.leadName
    };
  } catch (error) {
    console.error('Error in addDepartment:', error);
    throw error;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  try {
    // First find the lead ID if a name is provided
    let leadId = undefined;
    if (updates.leadName) {
      try {
        const { data: leadData } = await supabase
          .from('team_members')
          .select('id')
          .eq('name', updates.leadName)
          .single();
        
        if (leadData) {
          leadId = leadData.id;
        }
      } catch (error) {
        console.error('Error finding team lead by name:', error);
      }
    }
    
    // Update the department
    const { data, error } = await supabase
      .from('departments')
      .update({
        name: updates.name,
        description: updates.description,
        lead_id: leadId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();

    if (error) {
      throw error;
    }
    
    // Get current count of members
    const { count, error: countError } = await supabase
      .from('team_members')
      .select('*', { count: 'exact', head: true })
      .eq('department_id', id);
    
    if (countError) {
      console.error('Error counting department members:', countError);
    }
    
    return {
      id,
      name: updates.name || "",  // TypeScript needs a fallback even though name is required
      description: updates.description,
      memberCount: count || 0,
      leadName: updates.leadName
    };
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    // Update any team members that belong to this department
    await supabase
      .from('team_members')
      .update({ department_id: null })
      .eq('department_id', id);
    
    // Delete the department
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);
      
    if (error) {
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDepartment:', error);
    throw error;
  }
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

// In-memory mock data
let mockTeamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 555-123-4567',
    role: 'admin',
    status: 'active',
    whatsappAccounts: ['Business Account 1'],
    department: 'Customer Support',
    position: 'Team Lead',
    company: 'Demo Corp',
    lastActive: new Date().toISOString(),
  },
  {
    id: '2',
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+1 555-987-6543',
    role: 'manager',
    status: 'active',
    whatsappAccounts: ['Business Account 2'],
    department: 'Sales',
    position: 'Sales Manager',
    company: 'Demo Corp',
    lastActive: new Date().toISOString(),
  },
  {
    id: '3',
    name: 'Alice Johnson',
    email: 'alice@example.com',
    phone: '+1 555-567-8901',
    role: 'agent',
    status: 'inactive',
    whatsappAccounts: [],
    department: 'Marketing',
    position: 'Marketing Specialist',
    company: 'Demo Corp',
    lastActive: new Date().toISOString(),
  }
];

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
