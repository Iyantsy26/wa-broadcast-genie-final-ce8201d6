
import { supabase } from "@/integrations/supabase/client";

export interface DeviceAccount {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'expired';
  type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'new_business' | 'business_api';
  last_active?: string;
  business_id?: string;
  created_at?: string;
  plan_tier?: 'starter' | 'professional' | 'enterprise';
}

// Mock data for development
const mockDeviceAccounts: DeviceAccount[] = [
  {
    id: "1",
    name: "Marketing WhatsApp",
    phone: "+1 234-567-8901",
    status: "connected",
    type: "browser_qr",
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    plan_tier: "professional"
  },
  {
    id: "2",
    name: "Support Team",
    phone: "+1 987-654-3210",
    status: "disconnected",
    type: "browser_web",
    last_active: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    plan_tier: "starter"
  }
];

// Get the user's current plan
export const getUserPlan = async (): Promise<'starter' | 'professional' | 'enterprise'> => {
  // This would normally fetch from a user_plans table
  // For demo purposes, return 'starter' as default
  return 'starter';
};

// Get account limits based on plan
export const getAccountLimits = (plan: 'starter' | 'professional' | 'enterprise'): number => {
  switch (plan) {
    case 'starter': return 2;
    case 'professional': return 10;
    case 'enterprise': return 20;
    default: return 2;
  }
};

// Get all device accounts
export const getDeviceAccounts = async (): Promise<DeviceAccount[]> => {
  try {
    // Using mock data as fallback if database access fails
    try {
      // @ts-ignore - Temporarily ignore TypeScript errors until database types are updated
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

// Add a device account
export const addDeviceAccount = async (account: Omit<DeviceAccount, 'id'>): Promise<DeviceAccount> => {
  try {
    try {
      // @ts-ignore - Temporarily ignore TypeScript errors until database types are updated
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

// Update device account status
export const updateDeviceStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<void> => {
  try {
    try {
      // @ts-ignore - Temporarily ignore TypeScript errors until database types are updated
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

// Delete a device account
export const deleteDeviceAccount = async (id: string): Promise<void> => {
  try {
    try {
      // @ts-ignore - Temporarily ignore TypeScript errors until database types are updated
      const { error } = await supabase
        .from('device_accounts')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error('Error in deleteDeviceAccount:', error);
      }
    } catch (dbError) {
      console.log('Using mock delete for development:', dbError);
    }
  } catch (error) {
    console.error('Error in deleteDeviceAccount:', error);
    throw error;
  }
};

// Check if adding another account would exceed the plan limit
export const checkAccountLimit = async (): Promise<{ canAdd: boolean, currentCount: number, limit: number }> => {
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
