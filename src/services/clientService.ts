
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/conversation";

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('join_date', { ascending: false });

  if (error) {
    console.error("Error fetching clients:", error);
    throw error;
  }

  return data as Client[];
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
  const { data, error } = await supabase
    .from('clients')
    .insert(client)
    .select()
    .single();

  if (error) {
    console.error("Error creating client:", error);
    throw error;
  }

  return data as Client;
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
