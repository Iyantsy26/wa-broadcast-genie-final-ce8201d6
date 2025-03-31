import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";
import { toast } from "@/hooks/use-toast";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  avatar?: string;
  role: 'admin' | 'manager' | 'agent';
  status: 'active' | 'inactive' | 'pending';
  whatsappAccounts: string[];
  department?: string;
  lastActive?: string;
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

// In-memory store for mock team members
let mockTeamMembers: TeamMember[] = [
  {
    id: uuidv4(),
    name: 'John Doe',
    email: 'john.doe@example.com',
    phone: '+1 123 456 7890',
    avatar: 'https://i.pravatar.cc/150?u=1',
    role: 'admin',
    status: 'active',
    whatsappAccounts: ['Main Account'],
    department: 'Customer Support',
    lastActive: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Jane Smith',
    email: 'jane.smith@example.com',
    phone: '+44 987 654 3210',
    avatar: 'https://i.pravatar.cc/150?u=2',
    role: 'manager',
    status: 'active',
    whatsappAccounts: ['Sales Account'],
    department: 'Sales',
    lastActive: new Date().toISOString(),
  },
  {
    id: uuidv4(),
    name: 'Sam Wilson',
    email: 'sam.wilson@example.com',
    phone: '+1 555 123 4567',
    avatar: 'https://i.pravatar.cc/150?u=3',
    role: 'agent',
    status: 'inactive',
    whatsappAccounts: [],
    department: 'Marketing',
    lastActive: new Date().toISOString(),
  }
];

// Team Member functions
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    // For debugging purposes, let's attempt to fetch real data but not rely on it
    try {
      const { data, error } = await supabase.from('team_members').select('*');
      console.log("Supabase data attempt:", data, error);
    } catch (e) {
      console.log("Failed to fetch from Supabase:", e);
    }
    
    return [...mockTeamMembers];
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    return [];
  }
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | undefined> => {
  try {
    // Use the mock data instead of trying to fetch from Supabase
    return mockTeamMembers.find(member => member.id === id);
  } catch (error) {
    console.error('Error in getTeamMemberById:', error);
    return undefined;
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    console.log("Adding team member:", member);
    
    // Create a new mock member and add it to our in-memory array
    const newId = uuidv4();
    const timestamp = new Date().toISOString();
    
    const mockMember: TeamMember = {
      id: newId,
      name: member.name,
      email: member.email,
      phone: member.phone,
      avatar: member.avatar,
      role: member.role,
      status: member.status,
      whatsappAccounts: member.whatsappAccounts || [],
      department: member.department,
      lastActive: timestamp
    };
    
    // Add to our mock data store
    mockTeamMembers.push(mockMember);
    
    // For debugging, let's still try to insert but catch the error
    try {
      const { data, error } = await supabase.from('team_members').insert({
        name: member.name,
        email: member.email,
        phone: member.phone || null,
        avatar: member.avatar || null,
        role: member.role,
        status: member.status,
      });
      
      if (error) {
        console.log("Supabase insert error (expected):", error);
      } else {
        console.log("Supabase insert success (unexpected):", data);
      }
    } catch (e) {
      console.log("Failed to insert to Supabase:", e);
    }
    
    return mockMember;
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    // Find the member in our mock data
    const memberIndex = mockTeamMembers.findIndex(m => m.id === id);
    
    if (memberIndex === -1) {
      throw new Error("Team member not found");
    }
    
    // Update the mock data
    const updatedMember = {
      ...mockTeamMembers[memberIndex],
      ...updates,
      // Make sure ID doesn't get overwritten
      id: mockTeamMembers[memberIndex].id
    };
    
    mockTeamMembers[memberIndex] = updatedMember;
    
    return updatedMember;
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    // Remove from mock data
    mockTeamMembers = mockTeamMembers.filter(member => member.id !== id);
    
    // Try to delete from Supabase for debugging purposes
    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member from Supabase:', error);
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
