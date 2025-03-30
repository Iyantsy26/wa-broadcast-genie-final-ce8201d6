
import { supabase } from "@/integrations/supabase/client";
import { Lead } from "@/types/lead";

export const getLeads = async (): Promise<Lead[]> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching leads:', error);
    throw error;
  }

  // Map database fields to lead interface
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email || '',
    phone: item.phone || '',
    company: item.company || '',
    source: item.source || '',
    status: item.status || '',
    value: item.value || 0,
    createdAt: item.created_at,
    lastContact: item.last_contact,
    avatarUrl: item.avatar_url,
    notes: item.notes,
    industry: item.industry
  }));
};

export const getLead = async (id: string): Promise<Lead | null> => {
  const { data, error } = await supabase
    .from('leads')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching lead:', error);
    throw error;
  }

  if (!data) return null;

  // Map database fields to lead interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    source: data.source || '',
    status: data.status || '',
    value: data.value || 0,
    createdAt: data.created_at,
    lastContact: data.last_contact,
    avatarUrl: data.avatar_url,
    notes: data.notes,
    industry: data.industry
  };
};

export const createLead = async (lead: Omit<Lead, 'id'>): Promise<Lead> => {
  // Map lead interface to database fields
  const dbLead = {
    name: lead.name,
    email: lead.email,
    phone: lead.phone,
    company: lead.company,
    source: lead.source,
    status: lead.status,
    value: lead.value,
    avatar_url: lead.avatarUrl,
    notes: lead.notes,
    industry: lead.industry,
    last_contact: lead.lastContact
  };

  const { data, error } = await supabase
    .from('leads')
    .insert([dbLead])
    .select()
    .single();

  if (error) {
    console.error('Error creating lead:', error);
    throw error;
  }

  // Map database response back to lead interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    source: data.source || '',
    status: data.status || '',
    value: data.value || 0,
    createdAt: data.created_at,
    lastContact: data.last_contact,
    avatarUrl: data.avatar_url,
    notes: data.notes,
    industry: data.industry
  };
};

export const updateLead = async (id: string, lead: Partial<Lead>): Promise<Lead> => {
  // Map lead interface to database fields
  const dbLead: any = {};
  
  if (lead.name !== undefined) dbLead.name = lead.name;
  if (lead.email !== undefined) dbLead.email = lead.email;
  if (lead.phone !== undefined) dbLead.phone = lead.phone;
  if (lead.company !== undefined) dbLead.company = lead.company;
  if (lead.source !== undefined) dbLead.source = lead.source;
  if (lead.status !== undefined) dbLead.status = lead.status;
  if (lead.value !== undefined) dbLead.value = lead.value;
  if (lead.lastContact !== undefined) dbLead.last_contact = lead.lastContact;
  if (lead.avatarUrl !== undefined) dbLead.avatar_url = lead.avatarUrl;
  if (lead.notes !== undefined) dbLead.notes = lead.notes;
  if (lead.industry !== undefined) dbLead.industry = lead.industry;

  const { data, error } = await supabase
    .from('leads')
    .update(dbLead)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating lead:', error);
    throw error;
  }

  // Map database response back to lead interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    source: data.source || '',
    status: data.status || '',
    value: data.value || 0,
    createdAt: data.created_at,
    lastContact: data.last_contact,
    avatarUrl: data.avatar_url,
    notes: data.notes,
    industry: data.industry
  };
};

export const deleteLead = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting lead:', error);
    throw error;
  }
};
