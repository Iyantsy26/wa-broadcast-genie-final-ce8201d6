import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';
import { Client } from '@/types/conversation';

export const getClients = async (): Promise<Client[]> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('name');

    if (error) {
      console.error('Error fetching clients:', error);
      throw new Error(error.message);
    }

    return (data || []).map(client => ({
      id: client.id,
      name: client.name,
      email: client.email,
      phone: client.phone,
      company: client.company,
      address: client.address,
      avatar_url: client.avatar_url,
      join_date: client.join_date,
      renewal_date: client.renewal_date,
      plan_details: client.plan_details,
      referred_by: client.referred_by,
      notes: client.notes,
      tags: client.tags
    }));
  } catch (error) {
    console.error('Error in getClients:', error);
    return [];
  }
};

export const getClient = async (id: string): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error("Error fetching client:", error);
    throw error;
  }

  return data as Client;
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  try {
    const { data, error } = await supabase
      .from('clients')
      .insert({
        name: client.name || '',
        email: client.email,
        phone: client.phone,
        company: client.company,
        address: client.address,
        avatar_url: client.avatar_url,
        join_date: client.join_date,
        renewal_date: client.renewal_date,
        plan_details: client.plan_details,
        referred_by: client.referred_by,
        notes: client.notes,
        tags: client.tags
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating client:', error);
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
      join_date: data.join_date,
      renewal_date: data.renewal_date,
      plan_details: data.plan_details,
      referred_by: data.referred_by,
      notes: data.notes,
      tags: data.tags
    };
  } catch (error) {
    console.error('Error in createClient:', error);
    throw error;
  }
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  const { data, error } = await supabase
    .from('clients')
    .update(client)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error("Error updating client:", error);
    throw error;
  }

  return data as Client;
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error("Error deleting client:", error);
    throw error;
  }
};

export const uploadClientAvatar = async (file: File, clientId: string): Promise<string> => {
  const fileExt = file.name.split('.').pop();
  const fileName = `${clientId}-${Date.now()}.${fileExt}`;
  const filePath = `clients/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error("Error uploading client avatar:", uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('client-assets')
    .getPublicUrl(filePath);

  return data.publicUrl;
};
