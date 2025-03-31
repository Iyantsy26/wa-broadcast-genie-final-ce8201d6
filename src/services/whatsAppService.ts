
import { supabase } from "@/integrations/supabase/client";
import { v4 as uuidv4 } from 'uuid';

export interface WhatsAppAccount {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'expired';
  type: 'qr' | 'otp' | 'api';
  last_active?: string;
  business_id?: string;
  created_at?: string;
}

export const getWhatsAppAccounts = async (): Promise<WhatsAppAccount[]> => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching WhatsApp accounts:', error);
      throw error;
    }

    return (data || []).map(account => ({
      id: account.id,
      name: account.account_name,
      phone: account.phone_number,
      status: account.status || 'disconnected',
      type: account.connection_type || 'qr',
      last_active: account.last_active || new Date().toISOString(),
      business_id: account.business_id,
      created_at: account.created_at
    }));
  } catch (error) {
    console.error('Error in getWhatsAppAccounts:', error);
    return [];
  }
};

export const addWhatsAppAccount = async (account: Omit<WhatsAppAccount, 'id'>): Promise<WhatsAppAccount> => {
  try {
    const { data, error } = await supabase
      .from('whatsapp_accounts')
      .insert({
        account_name: account.name,
        phone_number: account.phone,
        status: account.status,
        connection_type: account.type,
        last_active: account.last_active || new Date().toISOString(),
        business_id: account.business_id,
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding WhatsApp account:', error);
      throw error;
    }

    return {
      id: data.id,
      name: data.account_name,
      phone: data.phone_number,
      status: data.status,
      type: data.connection_type,
      last_active: data.last_active,
      business_id: data.business_id,
      created_at: data.created_at
    };
  } catch (error) {
    console.error('Error in addWhatsAppAccount:', error);
    throw error;
  }
};

export const updateWhatsAppAccountStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('whatsapp_accounts')
      .update({ status, last_active: new Date().toISOString() })
      .eq('id', id);

    if (error) {
      console.error('Error updating WhatsApp account status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateWhatsAppAccountStatus:', error);
    throw error;
  }
};
