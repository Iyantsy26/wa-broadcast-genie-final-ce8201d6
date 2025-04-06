
import { supabase } from "@/integrations/supabase/client";
import { Lead } from '@/types/conversation';

export const getLeads = async (): Promise<Lead[]> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error fetching leads:', error);
    return [];
  }
};

export const getLead = async (id: string): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .eq('id', id)
      .single();
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error(`Error fetching lead ${id}:`, error);
    return null;
  }
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        ...lead,
        created_at: new Date().toISOString()
      })
      .select()
      .single();
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error('Error creating lead:', error);
    return null;
  }
};

export const updateLead = async (id: string, lead: Partial<Lead>): Promise<Lead | null> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .update(lead)
      .eq('id', id)
      .select()
      .single();
    
    if (error) throw error;
    return data || null;
  } catch (error) {
    console.error(`Error updating lead ${id}:`, error);
    return null;
  }
};

export const deleteLead = async (id: string): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('leads')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error(`Error deleting lead ${id}:`, error);
    return false;
  }
};

export const uploadLeadAvatar = async (file: File, leadId: string): Promise<string | null> => {
  try {
    const fileExt = file.name.split('.').pop();
    const fileName = `${leadId}_${Math.random().toString(36).substring(2)}.${fileExt}`;
    const filePath = `avatars/${fileName}`;
    
    const { error: uploadError } = await supabase.storage
      .from('leads')
      .upload(filePath, file);
    
    if (uploadError) throw uploadError;
    
    const { data: urlData } = await supabase.storage
      .from('leads')
      .getPublicUrl(filePath);
      
    return urlData?.publicUrl || null;
  } catch (error) {
    console.error('Error uploading lead avatar:', error);
    return null;
  }
};

// Function to get mock lead data for development
export const getMockLeads = async (): Promise<Lead[]> => {
  // Mock data for development
  return [
    {
      id: '1',
      name: 'John Smith',
      email: 'john.smith@example.com',
      phone: '+1 (555) 123-4567',
      company: 'ABC Corporation',
      status: 'New',
      source: 'Website',
      created_at: '2023-09-15T10:30:00Z',
      last_contact: '2023-09-15T10:30:00Z',
      next_followup: '2023-09-20T15:00:00Z',
      notes: 'Interested in our premium plan'
    },
    {
      id: '2',
      name: 'Sarah Johnson',
      email: 'sarah.johnson@example.com',
      phone: '+1 (555) 987-6543',
      company: 'XYZ Inc.',
      status: 'In Progress',
      source: 'Referral',
      created_at: '2023-09-10T14:15:00Z',
      last_contact: '2023-09-14T11:20:00Z',
      next_followup: '2023-09-18T10:00:00Z',
      notes: 'Following up after initial demo'
    }
  ];
};
