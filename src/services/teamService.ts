
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

// Team Member functions
export const getTeamMembers = async (): Promise<TeamMember[]> => {
  try {
    const { data: teamMembersData, error: teamMembersError } = await supabase
      .from('team_members')
      .select(`
        id,
        name,
        email,
        phone,
        avatar,
        role,
        status,
        last_active,
        departments(id, name)
      `);

    if (teamMembersError) {
      console.error('Error fetching team members:', teamMembersError);
      throw new Error(teamMembersError.message);
    }

    // Get WhatsApp accounts for each team member
    const whatsappPromises = teamMembersData.map(async (member) => {
      const { data: whatsappData, error: whatsappError } = await supabase
        .from('whatsapp_accounts')
        .select('account_name')
        .eq('team_member_id', member.id);

      if (whatsappError) {
        console.error('Error fetching WhatsApp accounts:', whatsappError);
        return [];
      }

      return whatsappData.map(account => account.account_name);
    });

    const whatsappAccountsArray = await Promise.all(whatsappPromises);

    // Transform data to match the TeamMember interface
    const transformedMembers: TeamMember[] = teamMembersData.map((member, index) => {
      return {
        id: member.id,
        name: member.name,
        email: member.email,
        phone: member.phone || undefined,
        avatar: member.avatar || undefined,
        role: member.role as 'admin' | 'manager' | 'agent',
        status: member.status as 'active' | 'inactive' | 'pending',
        whatsappAccounts: whatsappAccountsArray[index],
        department: member.departments?.name,
        lastActive: member.last_active,
      };
    });

    return transformedMembers;
  } catch (error) {
    console.error('Error in getTeamMembers:', error);
    return [];
  }
};

export const getTeamMemberById = async (id: string): Promise<TeamMember | undefined> => {
  try {
    const { data: member, error } = await supabase
      .from('team_members')
      .select(`
        id,
        name,
        email,
        phone,
        avatar,
        role,
        status,
        last_active,
        departments(id, name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching team member:', error);
      throw new Error(error.message);
    }

    // Get WhatsApp accounts for the team member
    const { data: whatsappData, error: whatsappError } = await supabase
      .from('whatsapp_accounts')
      .select('account_name')
      .eq('team_member_id', id);

    if (whatsappError) {
      console.error('Error fetching WhatsApp accounts:', whatsappError);
      throw new Error(whatsappError.message);
    }

    // Transform data to match the TeamMember interface
    const transformedMember: TeamMember = {
      id: member.id,
      name: member.name,
      email: member.email,
      phone: member.phone || undefined,
      avatar: member.avatar || undefined,
      role: member.role as 'admin' | 'manager' | 'agent',
      status: member.status as 'active' | 'inactive' | 'pending',
      whatsappAccounts: whatsappData.map(account => account.account_name),
      department: member.departments?.name,
      lastActive: member.last_active,
    };

    return transformedMember;
  } catch (error) {
    console.error('Error in getTeamMemberById:', error);
    return undefined;
  }
};

export const addTeamMember = async (member: Omit<TeamMember, 'id'>): Promise<TeamMember> => {
  try {
    // Find department ID if department is provided
    let departmentId = null;
    if (member.department) {
      const { data: departmentData, error: departmentError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', member.department)
        .single();

      if (departmentError && departmentError.code !== 'PGRST116') {
        console.error('Error finding department:', departmentError);
        throw new Error(departmentError.message);
      }

      if (departmentData) {
        departmentId = departmentData.id;
      }
    }

    // Insert new team member
    const { data: newMember, error } = await supabase
      .from('team_members')
      .insert({
        name: member.name,
        email: member.email,
        phone: member.phone || null,
        avatar: member.avatar || null,
        role: member.role,
        status: member.status,
        department_id: departmentId,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding team member:', error);
      throw new Error(error.message);
    }

    // Add WhatsApp accounts if any
    if (member.whatsappAccounts && member.whatsappAccounts.length > 0) {
      const whatsappAccounts = member.whatsappAccounts.map(account => ({
        account_name: account,
        phone_number: `+1${Math.floor(100000000 + Math.random() * 900000000)}`, // Random dummy phone number
        team_member_id: newMember.id
      }));

      const { error: whatsappError } = await supabase
        .from('whatsapp_accounts')
        .insert(whatsappAccounts);

      if (whatsappError) {
        console.error('Error adding WhatsApp accounts:', whatsappError);
      }
    }

    // Fetch the complete member data including WhatsApp accounts
    return getTeamMemberById(newMember.id) as Promise<TeamMember>;
  } catch (error) {
    console.error('Error in addTeamMember:', error);
    throw error;
  }
};

export const updateTeamMember = async (id: string, updates: Partial<TeamMember>): Promise<TeamMember> => {
  try {
    // Find department ID if department is provided
    let departmentId = null;
    if (updates.department) {
      const { data: departmentData, error: departmentError } = await supabase
        .from('departments')
        .select('id')
        .eq('name', updates.department)
        .single();

      if (departmentError && departmentError.code !== 'PGRST116') {
        console.error('Error finding department:', departmentError);
      } else if (departmentData) {
        departmentId = departmentData.id;
      }
    }

    // Update team member
    const { data: updatedMember, error } = await supabase
      .from('team_members')
      .update({
        name: updates.name,
        email: updates.email,
        phone: updates.phone || null,
        avatar: updates.avatar || null,
        role: updates.role,
        status: updates.status,
        department_id: departmentId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating team member:', error);
      throw new Error(error.message);
    }

    // Update WhatsApp accounts if provided
    if (updates.whatsappAccounts) {
      // First, delete existing WhatsApp accounts for this member
      const { error: deleteError } = await supabase
        .from('whatsapp_accounts')
        .delete()
        .eq('team_member_id', id);

      if (deleteError) {
        console.error('Error deleting WhatsApp accounts:', deleteError);
      }

      // Add new WhatsApp accounts if there are any
      if (updates.whatsappAccounts.length > 0) {
        const whatsappAccounts = updates.whatsappAccounts.map(account => ({
          account_name: account,
          phone_number: `+1${Math.floor(100000000 + Math.random() * 900000000)}`, // Random dummy phone number
          team_member_id: id
        }));

        const { error: insertError } = await supabase
          .from('whatsapp_accounts')
          .insert(whatsappAccounts);

        if (insertError) {
          console.error('Error adding WhatsApp accounts:', insertError);
        }
      }
    }

    // Fetch the complete updated member data
    return getTeamMemberById(id) as Promise<TeamMember>;
  } catch (error) {
    console.error('Error in updateTeamMember:', error);
    throw error;
  }
};

export const deleteTeamMember = async (id: string): Promise<void> => {
  try {
    // WhatsApp accounts will be automatically deleted due to CASCADE

    const { error } = await supabase
      .from('team_members')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting team member:', error);
      throw new Error(error.message);
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

// Department functions
export const getDepartments = async (): Promise<Department[]> => {
  try {
    // Get all departments with their lead members
    const { data: departmentsData, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        description,
        lead_id,
        team_members!departments_lead_id_fkey(name)
      `);

    if (error) {
      console.error('Error fetching departments:', error);
      throw new Error(error.message);
    }

    // Count members in each department
    const memberCountPromises = departmentsData.map(async (department) => {
      const { count, error: countError } = await supabase
        .from('team_members')
        .select('id', { count: 'exact', head: true })
        .eq('department_id', department.id);

      if (countError) {
        console.error('Error counting members:', countError);
        return 0;
      }

      return count || 0;
    });

    const memberCounts = await Promise.all(memberCountPromises);

    // Transform data to match the Department interface
    const transformedDepartments: Department[] = departmentsData.map((department, index) => {
      return {
        id: department.id,
        name: department.name,
        description: department.description || undefined,
        memberCount: memberCounts[index],
        leadName: department.team_members?.name,
      };
    });

    return transformedDepartments;
  } catch (error) {
    console.error('Error in getDepartments:', error);
    return [];
  }
};

export const getDepartmentById = async (id: string): Promise<Department | undefined> => {
  try {
    const { data: department, error } = await supabase
      .from('departments')
      .select(`
        id,
        name,
        description,
        lead_id,
        team_members!departments_lead_id_fkey(name)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching department:', error);
      throw new Error(error.message);
    }

    // Count members in the department
    const { count, error: countError } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('department_id', department.id);

    if (countError) {
      console.error('Error counting members:', countError);
      throw new Error(countError.message);
    }

    // Transform data to match the Department interface
    const transformedDepartment: Department = {
      id: department.id,
      name: department.name,
      description: department.description || undefined,
      memberCount: count || 0,
      leadName: department.team_members?.name,
    };

    return transformedDepartment;
  } catch (error) {
    console.error('Error in getDepartmentById:', error);
    return undefined;
  }
};

export const addDepartment = async (department: Omit<Department, 'id'>): Promise<Department> => {
  try {
    // Find lead ID if leadName is provided
    let leadId = null;
    if (department.leadName) {
      const { data: leadData, error: leadError } = await supabase
        .from('team_members')
        .select('id')
        .eq('name', department.leadName)
        .single();

      if (leadError && leadError.code !== 'PGRST116') {
        console.error('Error finding lead member:', leadError);
      } else if (leadData) {
        leadId = leadData.id;
      }
    }

    // Insert new department
    const { data: newDepartment, error } = await supabase
      .from('departments')
      .insert({
        name: department.name,
        description: department.description || null,
        lead_id: leadId
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding department:', error);
      throw new Error(error.message);
    }

    // Return transformed department
    return {
      id: newDepartment.id,
      name: newDepartment.name,
      description: newDepartment.description || undefined,
      memberCount: 0, // New department has no members yet
      leadName: department.leadName,
    };
  } catch (error) {
    console.error('Error in addDepartment:', error);
    throw error;
  }
};

export const updateDepartment = async (id: string, updates: Partial<Department>): Promise<Department> => {
  try {
    // Find lead ID if leadName is provided
    let leadId = null;
    if (updates.leadName) {
      const { data: leadData, error: leadError } = await supabase
        .from('team_members')
        .select('id')
        .eq('name', updates.leadName)
        .single();

      if (leadError && leadError.code !== 'PGRST116') {
        console.error('Error finding lead member:', leadError);
      } else if (leadData) {
        leadId = leadData.id;
      }
    }

    // Update department
    const { data: updatedDepartment, error } = await supabase
      .from('departments')
      .update({
        name: updates.name,
        description: updates.description || null,
        lead_id: leadId,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating department:', error);
      throw new Error(error.message);
    }

    // Get current member count
    const { count, error: countError } = await supabase
      .from('team_members')
      .select('id', { count: 'exact', head: true })
      .eq('department_id', id);

    if (countError) {
      console.error('Error counting members:', countError);
    }

    // Return transformed department
    return {
      id: updatedDepartment.id,
      name: updatedDepartment.name,
      description: updatedDepartment.description || undefined,
      memberCount: count || 0,
      leadName: updates.leadName,
    };
  } catch (error) {
    console.error('Error in updateDepartment:', error);
    throw error;
  }
};

export const deleteDepartment = async (id: string): Promise<void> => {
  try {
    // Remove department_id from team members in this department
    const { error: updateError } = await supabase
      .from('team_members')
      .update({ department_id: null })
      .eq('department_id', id);

    if (updateError) {
      console.error('Error updating team members:', updateError);
      throw new Error(updateError.message);
    }

    // Delete the department
    const { error } = await supabase
      .from('departments')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting department:', error);
      throw new Error(error.message);
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
