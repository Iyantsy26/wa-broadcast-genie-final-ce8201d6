
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/conversation";

export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error fetching leads:", error);
    throw error;
  }

  return data.map(lead => ({
    ...lead,
    initials: getInitials(lead.name)
  })) as Lead[];
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
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) {
    console.error("Error creating lead:", error);
    throw error;
  }

  return {
    ...data,
    initials: getInitials(data.name)
  } as Lead;
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

// Export leads to CSV
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

// Parse CSV file for importing leads
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

// Import leads from CSV
export const importLeadsFromCSV = async (file: File): Promise<Lead[]> => {
  try {
    const leadsToImport = await parseCSVForImport(file);
    
    const { data, error } = await supabase
      .from('leads')
      .insert(leadsToImport)
      .select();
      
    if (error) {
      throw error;
    }
    
    return data.map(lead => ({
      ...lead,
      initials: getInitials(lead.name)
    })) as Lead[];
  } catch (error) {
    console.error('Error importing leads:', error);
    throw error;
  }
};

// Helper function to get initials from name
export const getInitials = (name: string): string => {
  if (!name) return '';
  
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, 2)
    .join('');
};
