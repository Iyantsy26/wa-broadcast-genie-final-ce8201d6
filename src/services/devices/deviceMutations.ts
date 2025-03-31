
import { supabase } from "@/integrations/supabase/client";
import { DeviceAccount } from './deviceTypes';
import { mockDeviceAccounts } from './mockData';

/**
 * Add a device account
 */
export const addDeviceAccount = async (account: Omit<DeviceAccount, 'id'>): Promise<DeviceAccount> => {
  try {
    try {
      const { data, error } = await supabase
        .from('device_accounts')
        .insert({
          name: account.name,
          phone: account.phone,
          status: account.status,
          type: account.type,
          last_active: account.last_active || new Date().toISOString(),
          business_id: account.business_id,
          plan_tier: account.plan_tier || 'starter'
        })
        .select()
        .single();
      
      if (error) {
        console.error('Error in addDeviceAccount:', error);
        // For development, create a mock response
        const mockAccount: DeviceAccount = {
          id: Math.random().toString(36).substring(2, 11),
          ...account,
          created_at: new Date().toISOString()
        };
        return mockAccount;
      }
      
      return data as DeviceAccount;
    } catch (dbError) {
      console.log('Using mock data for development:', dbError);
      const mockAccount: DeviceAccount = {
        id: Math.random().toString(36).substring(2, 11),
        ...account,
        created_at: new Date().toISOString()
      };
      return mockAccount;
    }
  } catch (error) {
    console.error('Error in addDeviceAccount:', error);
    throw error;
  }
};

/**
 * Update device account status
 */
export const updateDeviceStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<void> => {
  try {
    try {
      const { error } = await supabase
        .from('device_accounts')
        .update({
          status,
          last_active: new Date().toISOString()
        })
        .eq('id', id);
      
      if (error) {
        console.error('Error in updateDeviceStatus:', error);
      }
    } catch (dbError) {
      console.log('Using mock update for development:', dbError);
    }
  } catch (error) {
    console.error('Error in updateDeviceStatus:', error);
    throw error;
  }
};

/**
 * Delete a device account with improved error handling
 */
export const deleteDeviceAccount = async (id: string): Promise<boolean> => {
  if (!id) {
    console.error('Invalid ID provided for deletion');
    return false;
  }

  try {
    try {
      // First check if the account exists to prevent freezing on non-existent IDs
      const { data: existingAccount, error: checkError } = await supabase
        .from('device_accounts')
        .select('id')
        .eq('id', id)
        .single();
      
      if (checkError || !existingAccount) {
        console.warn('Account not found for deletion:', id);
        return true; // Return true since the account is already gone
      }
      
      const { error } = await supabase
        .from('device_accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error in deleteDeviceAccount:', error);
        return false;
      }
      
      return true;
    } catch (dbError) {
      console.log('Using mock delete for development:', dbError);
      // For mock data, simulate successful deletion
      return true;
    }
  } catch (error) {
    console.error('Error in deleteDeviceAccount:', error);
    return false;
  }
};
