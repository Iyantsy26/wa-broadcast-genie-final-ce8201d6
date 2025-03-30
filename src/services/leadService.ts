
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

  return data as Lead[];
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

  return data as Lead;
};

export const createLead = async (lead: Omit<Lead, 'id' | 'created_at'>): Promise<Lead> => {
  const { data, error } = await supabase
    .from('leads')
    .insert(lead)
    .select()
    .single();

  if (error) {
    console.error("Error creating lead:", error);
    throw error;
  }

  return data as Lead;
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

  return data as Lead;
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
