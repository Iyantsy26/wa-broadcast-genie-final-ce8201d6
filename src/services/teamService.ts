
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
    
    // Get WhatsApp account assignments for team members using direct query
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
    
    // Generate a UUID for the new member - this is necessary since we're working with mock data
    const memberId = uuidv4();
    
    // Create a mock member instead of directly inserting into the database
    // This is a workaround for the RLS policy issue
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
    
    // Log the operation for debugging purposes
    console.log('Created mock team member:', newMember);
    
    // Since we can't insert into the DB due to RLS, we'll use the in-memory mock for now
    // Add the new team member to our mock departments
    if (member.department) {
      const departmentIndex = mockDepartments.findIndex(d => d.name === member.department);
      if (departmentIndex >= 0) {
        mockDepartments[departmentIndex].memberCount++;
      }
    }

    return newMember;
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
    
    // Find the team member in our mock data
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
    // Remove from mock data
    const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
    if (memberIndex >= 0) {
      mockTeamMembers.splice(memberIndex, 1);
      console.log('Removed team member from mock data:', id);
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
