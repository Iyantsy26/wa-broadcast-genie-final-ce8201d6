
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from "uuid";

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

// Dummy data for demo purposes
// In a real application, these would come from the database
export const teamMembers: TeamMember[] = [
  {
    id: '1',
    name: 'Maria Lopez',
    email: 'maria.lopez@example.com',
    phone: '+1 555-123-4567',
    role: 'admin',
    status: 'active',
    whatsappAccounts: ['Business Account 1', 'Marketing Account'],
    department: 'Customer Support',
    lastActive: '2023-06-23T10:15:00Z',
  },
  {
    id: '2',
    name: 'Robert Chen',
    email: 'robert.chen@example.com',
    phone: '+1 555-987-6543',
    role: 'manager',
    status: 'active',
    whatsappAccounts: ['Support Account'],
    department: 'Sales',
    lastActive: '2023-06-23T09:30:00Z',
  },
  {
    id: '3',
    name: 'Sophia Williams',
    email: 'sophia.williams@example.com',
    role: 'agent',
    status: 'active',
    whatsappAccounts: ['Business Account 1'],
    department: 'Customer Support',
    lastActive: '2023-06-22T16:45:00Z',
  },
  {
    id: '4',
    name: 'James Taylor',
    email: 'james.taylor@example.com',
    phone: '+1 555-234-5678',
    role: 'agent',
    status: 'inactive',
    whatsappAccounts: [],
    department: 'Marketing',
    lastActive: '2023-06-15T11:20:00Z',
  },
  {
    id: '5',
    name: 'Emma Johnson',
    email: 'emma.johnson@example.com',
    role: 'agent',
    status: 'pending',
    whatsappAccounts: [],
  },
];

export const departments: Department[] = [
  {
    id: '1',
    name: 'Customer Support',
    description: 'Handles customer inquiries and issues',
    memberCount: 12,
    leadName: 'Maria Lopez',
  },
  {
    id: '2',
    name: 'Sales',
    description: 'Manages lead generation and sales processes',
    memberCount: 8,
    leadName: 'Robert Chen',
  },
  {
    id: '3',
    name: 'Marketing',
    description: 'Creates and executes marketing campaigns',
    memberCount: 6,
    leadName: 'Sarah Parker',
  },
  {
    id: '4',
    name: 'Technical Support',
    description: 'Provides technical assistance and troubleshooting',
    memberCount: 5,
  },
];

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

// Team Member functions
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  // In a real app, this would make a database call
  return Promise.resolve(teamMembers);
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | undefined> => {
  // In a real app, this would make a database call
  const member = teamMembers.find(m => m.id === id);
  return Promise.resolve(member);
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  // In a real app, this would make a database call
  const newMember: TeamMember = {
    ...member,
    id: uuidv4(),
    lastActive: new Date().toISOString()
  };
  return Promise.resolve(newMember);
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  // In a real app, this would make a database call
  const memberIndex = teamMembers.findIndex(m => m.id === id);
  if (memberIndex === -1) {
    throw new Error('Team member not found');
  }
  
  const updatedMember = { ...teamMembers[memberIndex], ...updates };
  return Promise.resolve(updatedMember);
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  // In a real app, this would make a database call
  return Promise.resolve();
};

export const activateTeamMember = async (id: string): Promise<TeamMember> => {
  return updateTeamMember(id, { status: 'active' });
};

export const deactivateTeamMember = async (id: string): Promise<TeamMember> => {
  return updateTeamMember(id, { status: 'inactive' });
};

// Department functions
export const getDepartments = async (): Promise<Department[]> => {
  // In a real app, this would make a database call
  return Promise.resolve(departments);
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  // In a real app, this would make a database call
  const department = departments.find(d => d.id === id);
  return Promise.resolve(department);
};

export const addDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  // In a real app, this would make a database call
  const newDepartment: Department = {
    ...department,
    id: uuidv4()
  };
  return Promise.resolve(newDepartment);
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  // In a real app, this would make a database call
  const departmentIndex = departments.findIndex(d => d.id === id);
  if (departmentIndex === -1) {
    throw new Error('Department not found');
  }
  
  const updatedDepartment = { ...departments[departmentIndex], ...updates };
  return Promise.resolve(updatedDepartment);
};

export const deleteDepartment = async (id: string): Promise<void> => {
  // In a real app, this would make a database call
  return Promise.resolve();
};

// Role functions
export const getRoles = async (): Promise<Role[]> => {
  // In a real app, this would make a database call
  return Promise.resolve(roles);
};

export const getRoleById = async (id: string): Promise<Role | undefined> => {
  // In a real app, this would make a database call
  const role = roles.find(r => r.id === id);
  return Promise.resolve(role);
};

export const updateRolePermissions = async (id: string, permissions: string[]): Promise<Role> => {
  // In a real app, this would make a database call
  const roleIndex = roles.findIndex(r => r.id === id);
  if (roleIndex === -1) {
    throw new Error('Role not found');
  }
  
  const updatedRole = { ...roles[roleIndex], permissions };
  return Promise.resolve(updatedRole);
};
