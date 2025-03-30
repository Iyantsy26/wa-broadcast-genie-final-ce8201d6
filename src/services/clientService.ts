
import { supabase } from "@/integrations/supabase/client";
import { Client } from "@/types/client";

export const getClients = async (): Promise<Client[]> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching clients:', error);
    throw error;
  }

  // Map database fields to client interface
  return (data || []).map(item => ({
    id: item.id,
    name: item.name,
    email: item.email || '',
    phone: item.phone || '',
    company: item.company || '',
    industry: item.industry || '',
    value: item.value || 0,
    clientSince: item.client_since || '',
    avatarUrl: item.avatar_url,
    status: item.status,
    website: item.website,
    address: item.address,
    notes: item.notes,
    // Handle new fields that might not exist in the database
    referredBy: item.referred_by || '',
    tags: item.tags || [],
    subscriptionPlan: item.subscription_plan || '',
    renewalDate: item.renewal_date || ''
  }));
};

export const getClient = async (id: string): Promise<Client | null> => {
  const { data, error } = await supabase
    .from('clients')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching client:', error);
    throw error;
  }

  if (!data) return null;

  // Map database fields to client interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    industry: data.industry || '',
    value: data.value || 0,
    clientSince: data.client_since || '',
    avatarUrl: data.avatar_url,
    status: data.status,
    website: data.website,
    address: data.address,
    notes: data.notes,
    // Handle new fields that might not exist in the database
    referredBy: (data as any).referred_by || '',
    tags: (data as any).tags || [],
    subscriptionPlan: (data as any).subscription_plan || '',
    renewalDate: (data as any).renewal_date || ''
  };
};

export const createClient = async (client: Omit<Client, 'id'>): Promise<Client> => {
  // Map client interface to database fields
  const dbClient = {
    name: client.name,
    email: client.email,
    phone: client.phone,
    company: client.company,
    industry: client.industry,
    value: client.value,
    client_since: client.clientSince,
    avatar_url: client.avatarUrl,
    status: client.status,
    website: client.website,
    address: client.address,
    notes: client.notes,
    // Handle new fields
    referred_by: client.referredBy,
    tags: client.tags,
    subscription_plan: client.subscriptionPlan,
    renewal_date: client.renewalDate
  };

  const { data, error } = await supabase
    .from('clients')
    .insert([dbClient])
    .select()
    .single();

  if (error) {
    console.error('Error creating client:', error);
    throw error;
  }

  // Map database response back to client interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    industry: data.industry || '',
    value: data.value || 0,
    clientSince: data.client_since || '',
    avatarUrl: data.avatar_url,
    status: data.status,
    website: data.website,
    address: data.address,
    notes: data.notes,
    // Handle new fields that might not exist in the database
    referredBy: (data as any).referred_by || '',
    tags: (data as any).tags || [],
    subscriptionPlan: (data as any).subscription_plan || '',
    renewalDate: (data as any).renewal_date || ''
  };
};

export const updateClient = async (id: string, client: Partial<Client>): Promise<Client> => {
  // Map client interface to database fields
  const dbClient: any = {};
  
  if (client.name !== undefined) dbClient.name = client.name;
  if (client.email !== undefined) dbClient.email = client.email;
  if (client.phone !== undefined) dbClient.phone = client.phone;
  if (client.company !== undefined) dbClient.company = client.company;
  if (client.industry !== undefined) dbClient.industry = client.industry;
  if (client.value !== undefined) dbClient.value = client.value;
  if (client.clientSince !== undefined) dbClient.client_since = client.clientSince;
  if (client.avatarUrl !== undefined) dbClient.avatar_url = client.avatarUrl;
  if (client.status !== undefined) dbClient.status = client.status;
  if (client.website !== undefined) dbClient.website = client.website;
  if (client.address !== undefined) dbClient.address = client.address;
  if (client.notes !== undefined) dbClient.notes = client.notes;
  if (client.referredBy !== undefined) dbClient.referred_by = client.referredBy;
  if (client.tags !== undefined) dbClient.tags = client.tags;
  if (client.subscriptionPlan !== undefined) dbClient.subscription_plan = client.subscriptionPlan;
  if (client.renewalDate !== undefined) dbClient.renewal_date = client.renewalDate;

  const { data, error } = await supabase
    .from('clients')
    .update(dbClient)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating client:', error);
    throw error;
  }

  // Map database response back to client interface
  return {
    id: data.id,
    name: data.name,
    email: data.email || '',
    phone: data.phone || '',
    company: data.company || '',
    industry: data.industry || '',
    value: data.value || 0,
    clientSince: data.client_since || '',
    avatarUrl: data.avatar_url,
    status: data.status,
    website: data.website,
    address: data.address,
    notes: data.notes,
    // Handle new fields that might not exist in the database
    referredBy: (data as any).referred_by || '',
    tags: (data as any).tags || [],
    subscriptionPlan: (data as any).subscription_plan || '',
    renewalDate: (data as any).renewal_date || ''
  };
};

export const deleteClient = async (id: string): Promise<void> => {
  const { error } = await supabase
    .from('clients')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting client:', error);
    throw error;
  }
};

// Function to upload client profile photo (max 2MB)
export const uploadClientPhoto = async (clientId: string, file: File): Promise<string> => {
  // Check file size (2MB max)
  if (file.size > 2 * 1024 * 1024) {
    throw new Error('File size exceeds the 2MB limit');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${clientId}-${Date.now()}.${fileExt}`;
  const filePath = `client-photos/${fileName}`;

  const { error: uploadError } = await supabase.storage
    .from('client-assets')
    .upload(filePath, file);

  if (uploadError) {
    console.error('Error uploading file:', uploadError);
    throw uploadError;
  }

  const { data } = supabase.storage
    .from('client-assets')
    .getPublicUrl(filePath);

  // Update client with new avatar URL
  await updateClient(clientId, { avatarUrl: data.publicUrl });

  return data.publicUrl;
};

// Function to get client tags options
export const getClientTagOptions = (): { value: string; label: string; color: string }[] => {
  return [
    { value: 'VIP', label: 'VIP', color: 'purple' },
    { value: 'Gold', label: 'Gold', color: 'yellow' },
    { value: 'Silver', label: 'Silver', color: 'gray' },
    { value: 'Beginner', label: 'Beginner', color: 'blue' },
    { value: 'Premium', label: 'Premium', color: 'green' },
    { value: 'Enterprise', label: 'Enterprise', color: 'red' }
  ];
};
