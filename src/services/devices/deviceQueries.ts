
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

/**
 * Get QR code for device connection
 */
export const getQrCodeForDevice = async (deviceId: string): Promise<string> => {
  try {
    // In a real implementation, this would make a call to WhatsApp Business API
    // For now, simulate with a real QR code generation service
    const response = await fetch(`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp:connect:${deviceId}&format=svg`);
    
    if (!response.ok) {
      throw new Error('Failed to generate QR code');
    }
    
    // Store QR code URL in temporary storage since device_accounts doesn't have this column
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=whatsapp:connect:${deviceId}`;
    
    // Try to use a qr_codes table if it exists
    try {
      await supabase
        .from('device_qr_codes')
        .upsert({ 
          device_id: deviceId,
          qr_code_url: qrCodeUrl,
          created_at: new Date().toISOString()
        });
    } catch (e) {
      // Fallback to session storage if table doesn't exist
      sessionStorage.setItem(`qrcode-${deviceId}`, qrCodeUrl);
    }
    
    return qrCodeUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
};

/**
 * Get connection status for a device
 */
export const checkDeviceConnectionStatus = async (deviceId: string): Promise<string> => {
  try {
    const { data, error } = await supabase
      .from('device_accounts')
      .select('status')
      .eq('id', deviceId)
      .single();
      
    if (error) {
      throw error;
    }
    
    return data.status;
  } catch (error) {
    console.error('Error checking device connection status:', error);
    throw error;
  }
};
