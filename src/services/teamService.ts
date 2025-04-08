
import { supabase } from "@/integrations/supabase/client";

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: string;
  department_id?: string;
  position?: string;
  avatar?: string;
  status: string;
  last_active?: string;
  department?: string; // Department name for display
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
  description: string;
  permissions: string[];
}

export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data, error } = await supabase
      .from('team_members')
      .select(`
        *,
        departments:department_id (name)
      `)
      .order('name');
    
    if (error) {
      console.error("Error fetching team members:", error);
      throw new Error(error.message);
    }

    return data.map((item: any) => ({
      id: item.id,
      name: item.name,
      email: item.email,
      phone: item.phone,
      role: item.role,
      department_id: item.department_id,
      position: item.position,
      avatar: item.avatar,
      status: item.status,
      last_active: item.last_active,
      department: item.departments?.name
    }));
  } catch (error) {
    console.error("Error in getTeamMembers:", error);
    return [];
  }
};

export const addTeamMember = async (member: Partial<TeamMember>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('team_members')
    .insert({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department_id: member.department_id,
      position: member.position,
      status: member.status || 'pending',
    })
    .select(`
      *,
      departments:department_id (name)
    `)
    .single();

  if (error) {
    console.error("Error adding team member:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    department_id: data.department_id,
    position: data.position,
    avatar: data.avatar,
    status: data.status,
    last_active: data.last_active,
    department: data.departments?.name
  };
};

export const updateTeamMember = async (id: string, member: Partial<TeamMember>): Promise<TeamMember> => {
  const { data, error } = await supabase
    .from('team_members')
    .update({
      name: member.name,
      email: member.email,
      phone: member.phone,
      role: member.role,
      department_id: member.department_id,
      position: member.position,
      status: member.status,
    })
    .eq('id', id)
    .select(`
      *,
      departments:department_id (name)
    `)
    .single();

  if (error) {
    console.error("Error updating team member:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    email: data.email,
    phone: data.phone,
    role: data.role,
    department_id: data.department_id,
    position: data.position,
    avatar: data.avatar,
    status: data.status,
    last_active: data.last_active,
    department: data.departments?.name
  };
};

export const activateTeamMember = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .update({ status: 'active' })
    .eq('id', id);

  if (error) {
    console.error("Error activating team member:", error);
    throw new Error(error.message);
  }
};

export const deactivateTeamMember = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .update({ status: 'inactive' })
    .eq('id', id);

  if (error) {
    console.error("Error deactivating team member:", error);
    throw new Error(error.message);
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('team_members')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting team member:", error);
    throw new Error(error.message);
  }
};

// Department functions
export const getDepartments = async (): Promise<Department[]> => {
  try {
    const { data, error } = await supabase
      .from('departments')
      .select('*, team_members!department_id(id, name)');
    
    if (error) {
      console.error("Error fetching departments:", error);
      throw new Error(error.message);
    }

    return data.map((dept: any) => ({
      id: dept.id,
      name: dept.name,
      description: dept.description,
      memberCount: Array.isArray(dept.team_members) ? dept.team_members.length : 0,
      leadName: dept.lead_id ? dept.team_members.find((m: any) => m.id === dept.lead_id)?.name : undefined
    }));
  } catch (error) {
    console.error("Error in getDepartments:", error);
    return [];
  }
};

export const addDepartment = async (department: Partial<Department>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .insert({
      name: department.name,
      description: department.description,
    })
    .select()
    .single();

  if (error) {
    console.error("Error adding department:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    memberCount: 0,
    leadName: undefined
  };
};

export const updateDepartment = async (id: string, department: Partial<Department>): Promise<Department> => {
  const { data, error } = await supabase
    .from('departments')
    .update({
      name: department.name,
      description: department.description,
    })
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating department:", error);
    throw new Error(error.message);
  }

  return {
    id: data.id,
    name: data.name,
    description: data.description,
    memberCount: 0, // This will be updated when we fetch departments again
    leadName: undefined
  };
};

export const deleteDepartment = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('departments')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting department:", error);
    throw new Error(error.message);
  }
};

// Role functions
export const getRoles = async (): Promise<Role[]> => {
  // This is a mock function for now - in a real app, this would fetch from the database
  return [
    {
      id: '1',
      name: 'Administrator',
      description: 'Full system access and control',
      permissions: [
        'Manage team members',
        'View all conversations',
        'Assign conversations',
        'Create and edit templates',
        'Access analytics',
        'Manage organization settings',
        'Manage integrations',
        'Manage billing'
      ]
    },
    {
      id: '2',
      name: 'Manager',
      description: 'Team and customer management',
      permissions: [
        'View team analytics',
        'Assign conversations',
        'View all conversations',
        'Create and edit templates',
        'Access limited analytics'
      ]
    },
    {
      id: '3',
      name: 'Agent',
      description: 'Customer conversations only',
      permissions: [
        'View assigned conversations',
        'Send messages',
        'Use templates',
        'View personal analytics'
      ]
    }
  ];
};

export const updateRolePermissions = async (roleId: string, permissions: string[]): Promise<Role> => {
  // This would be implemented in a real app with a database call
  console.log('Update role', roleId, 'with permissions:', permissions);
  return {
    id: roleId,
    name: 'Updated Role',
    description: 'Updated description',
    permissions
  };
};
