
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
      .select('*');
    
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
