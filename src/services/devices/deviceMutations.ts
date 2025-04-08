
import { supabase } from "@/integrations/supabase/client";
import { DeviceAccount } from './deviceTypes';

/**
 * Add a device account
 */
export const addDeviceAccount = async (account: Omit<DeviceAccount, 'id'>): Promise<DeviceAccount> => {
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
        plan_tier: account.plan_tier || 'starter',
        organization_id: account.organization_id
      })
      .select()
      .single();
    
    if (error) {
      console.error('Error in addDeviceAccount:', error);
      throw error;
    }
    
    return data as DeviceAccount;
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
    const { error } = await supabase
      .from('device_accounts')
      .update({
        status,
        last_active: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error in updateDeviceStatus:', error);
      throw error;
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
    const { error } = await supabase
      .from('device_accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error in deleteDeviceAccount:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in deleteDeviceAccount:', error);
    return false;
  }
};

/**
 * Update a device account's details
 */
export const updateDeviceAccount = async (
  id: string, 
  updates: Partial<Omit<DeviceAccount, 'id' | 'created_at'>>
): Promise<boolean> => {
  if (!id) {
    console.error('Invalid ID provided for update');
    return false;
  }

  try {
    const { error } = await supabase
      .from('device_accounts')
      .update({
        ...updates,
        last_active: new Date().toISOString()
      })
      .eq('id', id);
    
    if (error) {
      console.error('Error in updateDeviceAccount:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in updateDeviceAccount:', error);
    return false;
  }
};

/**
 * Bulk operations for device accounts
 */
export const bulkUpdateDeviceStatus = async (
  ids: string[], 
  status: 'connected' | 'disconnected' | 'expired'
): Promise<boolean> => {
  try {
    const { error } = await supabase
      .from('device_accounts')
      .update({
        status,
        last_active: new Date().toISOString()
      })
      .in('id', ids);
    
    if (error) {
      console.error('Error in bulkUpdateDeviceStatus:', error);
      return false;
    }
    
    return true;
  } catch (error) {
    console.error('Error in bulkUpdateDeviceStatus:', error);
    return false;
  }
};

/**
 * Enable real-time updates for device_accounts table
 * Run once, typically on app initialization
 */
export const enableRealtimeForDevices = async (): Promise<void> => {
  try {
    // Subscribe to the channel
    const channel = supabase
      .channel('schema-db-changes')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'device_accounts' }, 
        (payload) => {
          console.log('Change received:', payload);
        })
      .subscribe();
      
    console.log('Real-time updates enabled for device_accounts table');
  } catch (error) {
    console.error('Error enabling real-time updates:', error);
  }
};
