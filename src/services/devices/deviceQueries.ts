
import { supabase } from "@/integrations/supabase/client";
import { DeviceAccount, AccountLimitResult } from './deviceTypes';
import { mockDeviceAccounts } from './mockData';
import { getUserPlan, getAccountLimits } from './planService';

/**
 * Get all device accounts
 */
export const getDeviceAccounts = async (): Promise<DeviceAccount[]> => {
  try {
    // Using mock data as fallback if database access fails
    try {
      const { data, error } = await supabase
        .from('device_accounts')
        .select('*');
      
      if (error) {
        console.error('Error in getDeviceAccounts:', error);
        return mockDeviceAccounts;
      }
      
      return data as DeviceAccount[];
    } catch (dbError) {
      console.log('Using mock data for development:', dbError);
      return mockDeviceAccounts;
    }
  } catch (error) {
    console.error('Error in getDeviceAccounts:', error);
    return mockDeviceAccounts;
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
