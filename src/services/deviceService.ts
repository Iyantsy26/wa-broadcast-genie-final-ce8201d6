
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

// Mock data for device accounts since we don't have the actual table in Supabase
const mockDeviceAccounts: DeviceAccount[] = [
  {
    id: '1',
    name: 'Marketing Account',
    phone: '+1 123-456-7890',
    status: 'connected',
    type: 'browser_qr',
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    plan_tier: 'starter'
  },
  {
    id: '2',
    name: 'Support Team',
    phone: '+1 234-567-8901',
    status: 'disconnected',
    type: 'browser_web',
    last_active: new Date(Date.now() - 86400000 * 2).toISOString(), // 2 days ago
    created_at: new Date(Date.now() - 86400000 * 30).toISOString(), // 30 days ago
    plan_tier: 'starter'
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
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    return [...mockDeviceAccounts];
  } catch (error) {
    console.error('Error in getDeviceAccounts:', error);
    return [];
  }
};

// Add a device account
export const addDeviceAccount = async (account: Omit<DeviceAccount, 'id'>): Promise<DeviceAccount> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const newAccount: DeviceAccount = {
      id: Date.now().toString(),
      name: account.name,
      phone: account.phone,
      status: account.status,
      type: account.type,
      last_active: account.last_active || new Date().toISOString(),
      business_id: account.business_id,
      created_at: new Date().toISOString(),
      plan_tier: account.plan_tier || 'starter'
    };
    
    mockDeviceAccounts.unshift(newAccount);
    
    return newAccount;
  } catch (error) {
    console.error('Error in addDeviceAccount:', error);
    throw error;
  }
};

// Update device account status
export const updateDeviceStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<void> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const accountIndex = mockDeviceAccounts.findIndex(acc => acc.id === id);
    if (accountIndex >= 0) {
      mockDeviceAccounts[accountIndex].status = status;
      mockDeviceAccounts[accountIndex].last_active = new Date().toISOString();
    }
  } catch (error) {
    console.error('Error in updateDeviceStatus:', error);
    throw error;
  }
};

// Delete a device account
export const deleteDeviceAccount = async (id: string): Promise<void> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 800));
    
    const accountIndex = mockDeviceAccounts.findIndex(acc => acc.id === id);
    if (accountIndex >= 0) {
      mockDeviceAccounts.splice(accountIndex, 1);
    }
  } catch (error) {
    console.error('Error in deleteDeviceAccount:', error);
    throw error;
  }
};

// Check if adding another account would exceed the plan limit
export const checkAccountLimit = async (): Promise<{ canAdd: boolean, currentCount: number, limit: number }> => {
  try {
    // Simulating API call delay
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const plan = await getUserPlan();
    const limit = getAccountLimits(plan);
    const currentCount = mockDeviceAccounts.length;
    
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
