
import { supabase } from "@/integrations/supabase/client";
import { DeviceAccount, AccountLimitResult } from './deviceTypes';
import { getUserPlan, getAccountLimits } from './planService';

/**
 * Get all device accounts
 */
export const getDeviceAccounts = async (): Promise<DeviceAccount[]> => {
  try {
    const { data, error } = await supabase
      .from('device_accounts')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error in getDeviceAccounts:', error);
      throw error;
    }
    
    return data as DeviceAccount[];
  } catch (error) {
    console.error('Error in getDeviceAccounts:', error);
    throw error;
  }
};

/**
 * Get a single device account by ID
 */
export const getDeviceById = async (deviceId: string): Promise<DeviceAccount | null> => {
  try {
    const { data, error } = await supabase
      .from('device_accounts')
      .select('*')
      .eq('id', deviceId)
      .maybeSingle();
    
    if (error) {
      console.error('Error in getDeviceById:', error);
      throw error;
    }
    
    return data as DeviceAccount;
  } catch (error) {
    console.error('Error in getDeviceById:', error);
    throw error;
  }
};

/**
 * Check if adding another account would exceed the plan limit
 */
export const checkAccountLimit = async (): Promise<AccountLimitResult> => {
  try {
    const accounts = await getDeviceAccounts();
    const plan = await getUserPlan();
    const limit = getAccountLimits(plan);
    const currentCount = accounts.length;
    
    return {
      canAdd: currentCount < limit,
      currentCount,
      limit
    };
  } catch (error) {
    console.error('Error in checkAccountLimit:', error);
    return { canAdd: false, currentCount: 0, limit: 0 };
  }
};

/**
 * Set up real-time listeners for device changes
 * @param callback Function to call when changes are detected
 * @returns Cleanup function to remove the channel
 */
export const subscribeToDeviceChanges = (callback: (payload: any) => void) => {
  const channel = supabase
    .channel('device-changes')
    .on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'device_accounts'
      },
      (payload) => {
        console.log('Real-time device update received:', payload);
        callback(payload);
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};

/**
 * Set up real-time listener for a single device
 */
export const subscribeToDeviceById = (deviceId: string, callback: (payload: any) => void) => {
  const channel = supabase
    .channel(`device-${deviceId}`)
    .on('postgres_changes', 
      {
        event: '*',
        schema: 'public',
        table: 'device_accounts',
        filter: `id=eq.${deviceId}`
      },
      (payload) => {
        console.log(`Real-time update for device ${deviceId}:`, payload);
        callback(payload);
      }
    )
    .subscribe();
    
  return () => {
    supabase.removeChannel(channel);
  };
};
