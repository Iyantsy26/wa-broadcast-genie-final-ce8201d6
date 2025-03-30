import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Lead } from '@/types/conversation';
import { generateMockLeads } from './mockLeadData';

// In-memory cache for development/testing
let mockLeads = generateMockLeads();

export const getLeads = async (): Promise<Lead[]> => {
  try {
    // Try to fetch from Supabase first
    const { data, error } = await supabase
      .from('leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching leads:', error);
      // Fall back to mock data if Supabase query fails
      return mockLeads;
    }

    // If we got data from Supabase, use it
    if (data && data.length > 0) {
      return data.map(lead => ({
        ...lead,
        initials: getInitials(lead.name)
      }));
    }

    // Otherwise use mock data
    return mockLeads;
  } catch (error) {
    console.error('Error in getLeads:', error);
    // Return mock data as fallback
    return mockLeads;
  }
};

export const getLead = async (id: string): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching lead:", error);
    throw error;
  }

  return {
    ...data,
    initials: getInitials(data.name)
  } as Lead;
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at' | 'initials'>): Promise<Lead> => {
  try {
    const { data, error } = await supabase
      .from('leads')
      .insert({
        name: lead.name || '',
        email: lead.email,
        phone: lead.phone,
        company: lead.company,
        address: lead.address,
        avatar_url: lead.avatar_url,
        status: lead.status || 'New',
        source: lead.source,
        referrer_name: lead.referrer_name,
        notes: lead.notes,
        last_contact: lead.last_contact,
        next_followup: lead.next_followup
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating lead:', error);
      throw new Error(error.message);
    }

    return {
      id: data.id,
      name: data.name,
      email: data.email,
      phone: data.phone,
      company: data.company,
      address: data.address,
      avatar_url: data.avatar_url,
      status: data.status,
      source: data.source,
      referrer_name: data.referrer_name,
      notes: data.notes,
      last_contact: data.last_contact,
      next_followup: data.next_followup,
      created_at: data.created_at,
      initials: data.name.split(' ').map(n => n[0]).join('')
    };
  } catch (error) {
    console.error('Error in createLead:', error);
    throw error;
  }
};

export const updateLead = async (id: string, lead: Partial<Lead>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .update(lead)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating lead:", error);
    throw error;
  }

  return {
    ...data,
    initials: getInitials(data.name)
  } as Lead;
};

export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting lead:", error);
    throw error;
  }
};

export const uploadLeadAvatar = async (file: File, leadId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${leadId}-${Date.now()}.${fileExt}`;
  const filePath = `leads/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading lead avatar:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('client-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
};

export const exportLeadsToCSV = (): string => {
  const leads = JSON.parse(localStorage.getItem('cached_leads') || '[]');
  
  if (leads.length === 0) {
    throw new Error('No leads data available to export');
  }

  const headers = [
    'Name', 
    'Email', 
    'Phone', 
    'Company', 
    'Source', 
    'Status', 
    'Created', 
    'Last Contact'
  ].join(',');
  
  const rows = leads.map((lead: Lead) => [
    `"${lead.name}"`,
    `"${lead.email || ''}"`,
    `"${lead.phone || ''}"`,
    `"${lead.company || ''}"`,
    `"${lead.source || ''}"`,
    `"${lead.status || ''}"`,
    `"${new Date(lead.created_at).toLocaleDateString()}"`,
    `"${lead.last_contact ? new Date(lead.last_contact).toLocaleDateString() : ''}"`
  ].join(','));
  
  return [headers, ...rows].join('\n');
};

export const parseCSVForImport = async (file: File): Promise<Omit<Lead, 'id' | 'created_at' | 'initials'>[]> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n');
        const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
        
        const leads = lines.slice(1).filter(line => line.trim()).map(line => {
          const values = line.split(',').map(v => v.trim().replace(/^"(.*)"$/, '$1'));
          const lead: any = {
            status: 'New' // Default status
          };
          
          headers.forEach((header, index) => {
            if (header === 'name') lead.name = values[index];
            else if (header === 'email') lead.email = values[index];
            else if (header === 'phone') lead.phone = values[index];
            else if (header === 'company') lead.company = values[index];
            else if (header === 'source') lead.source = values[index];
            else if (header === 'status') lead.status = values[index] || 'New';
          });
          
          return lead;
        });
        
        resolve(leads.filter(lead => lead.name));
      } catch (error) {
        reject(new Error('Failed to parse CSV file'));
      }
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read CSV file'));
    };
    
    reader.readAsText(file);
  });
};

export const importLeads = async (leads: Omit<Lead, 'id' | 'created_at' | 'initials'>[]): Promise<number> => {
  try {
    // Convert leads to match database schema
    const dbLeads = leads.map(lead => ({
      name: lead.name || 'Unknown',
      email: lead.email,
      phone: lead.phone,
      company: lead.company,
      address: lead.address,
      status: lead.status || 'New',
      source: lead.source,
      referrer_name: lead.referrer_name,
      notes: lead.notes,
      last_contact: lead.last_contact,
      next_followup: lead.next_followup
    }));

    const { data, error } = await supabase
      .from('leads')
      .insert(dbLeads);

    if (error) {
      console.error('Error importing leads:', error);
      throw new Error(error.message);
    }

    return dbLeads.length;
  } catch (error) {
    console.error('Error in importLeads:', error);
    throw error;
  }
};

export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
