
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
    const { data, error } = await supabase
      .from('device_accounts')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching device accounts:', error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error in getDeviceAccounts:', error);
    return [];
  }
};

// Add a device account
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
        plan_tier: account.plan_tier || 'starter'
      })
      .select()
      .single();

    if (error) {
      console.error('Error adding device account:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error in addDeviceAccount:', error);
    throw error;
  }
};

// Update device account status
export const updateDeviceStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<void> => {
  try {
    const { error } = await supabase
      .from('device_accounts')
      .update({ 
        status: status, 
        last_active: new Date().toISOString() 
      })
      .eq('id', id);

    if (error) {
      console.error('Error updating device account status:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in updateDeviceStatus:', error);
    throw error;
  }
};

// Delete a device account
export const deleteDeviceAccount = async (id: string): Promise<void> => {
  try {
    const { error } = await supabase
      .from('device_accounts')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting device account:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error in deleteDeviceAccount:', error);
    throw error;
  }
};

// Check if adding another account would exceed the plan limit
export const checkAccountLimit = async (): Promise<{ canAdd: boolean, currentCount: number, limit: number }> => {
  try {
    const plan = await getUserPlan();
    const limit = getAccountLimits(plan);
    
    const { count, error } = await supabase
      .from('device_accounts')
      .select('*', { count: 'exact', head: true });
    
    if (error) {
      console.error('Error checking account limit:', error);
      throw error;
    }
    
    const currentCount = count || 0;
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
