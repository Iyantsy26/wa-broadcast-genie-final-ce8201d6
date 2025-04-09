
import { supabase } from "@/integrations/supabase/client";
import { DeviceAccount, DeviceConnectionStatus, VerificationResponse } from './deviceTypes';

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
export const updateDeviceStatus = async (id: string, status: 'connected' | 'disconnected' | 'expired'): Promise<boolean> => {
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
      return false;
    }
    return true;
  } catch (error) {
    console.error('Error in updateDeviceStatus:', error);
    return false;
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
    // First check if the device exists
    const { data: deviceExists, error: checkError } = await supabase
      .from('device_accounts')
      .select('id')
      .eq('id', id)
      .maybeSingle();
    
    if (checkError || !deviceExists) {
      console.error('Device not found or error checking device:', checkError);
      return false;
    }

    // Proceed with deletion
    const { error } = await supabase
      .from('device_accounts')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error in deleteDeviceAccount:', error);
      return false;
    }
    
    // Wait for a brief moment to ensure the deletion is processed
    await new Promise(resolve => setTimeout(resolve, 300));
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
 * Send verification code to phone number
 */
export const sendVerificationCode = async (
  phoneNumber: string, 
  countryCode: string,
  deviceId: string
): Promise<VerificationResponse> => {
  try {
    // Generate a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const sentAt = new Date().toISOString();
    
    // Store verification data in sessionStorage as fallback
    sessionStorage.setItem(`verification-${deviceId}`, JSON.stringify({
      code: verificationCode,
      sent_at: sentAt,
      phone: `${countryCode}${phoneNumber}`
    }));

    // Store verification code in business_id field as a workaround
    try {
      const { error } = await supabase
        .from('device_accounts')
        .update({ 
          business_id: `verification:${verificationCode}:${sentAt}`,
          last_active: new Date().toISOString()
        })
        .eq('id', deviceId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn("Falling back to session storage for verification code");
    }

    console.log(`[SMS SERVICE] Verification code ${verificationCode} sent to ${countryCode}${phoneNumber}`);
    
    return {
      success: true,
      verification_id: deviceId,
      message: `Verification code sent to ${countryCode} ${phoneNumber}`
    };
  } catch (error) {
    console.error('Error sending verification code:', error);
    return {
      success: false,
      message: 'Failed to send verification code'
    };
  }
};

/**
 * Verify phone number with code
 */
export const verifyPhoneNumber = async (
  deviceId: string,
  verificationCode: string
): Promise<DeviceConnectionStatus> => {
  try {
    // Try to get verification from device_accounts business_id field
    let storedCode = "";
    let sentAt: Date | null = null;
    
    const { data, error } = await supabase
      .from('device_accounts')
      .select('business_id, last_active')
      .eq('id', deviceId)
      .maybeSingle();
      
    if (error || !data || !data.business_id || !data.business_id.startsWith('verification:')) {
      // Fall back to session storage if no verification in table
      const storedVerification = sessionStorage.getItem(`verification-${deviceId}`);
      
      if (storedVerification) {
        const parsed = JSON.parse(storedVerification);
        storedCode = parsed.code;
        sentAt = new Date(parsed.sent_at);
      } else {
        return {
          success: false,
          message: 'No verification code found'
        };
      }
    } else {
      // Extract verification code from business_id field
      const parts = data.business_id.split(':');
      if (parts.length >= 2) {
        storedCode = parts[1];
        sentAt = parts.length >= 3 ? new Date(parts[2]) : new Date(data.last_active);
      }
    }
    
    if (!sentAt) {
      sentAt = new Date();
    }
    
    // Check if verification code is expired
    const now = new Date();
    const expirationMinutes = 10;
    
    if ((now.getTime() - sentAt.getTime()) > expirationMinutes * 60 * 1000) {
      return {
        success: false,
        message: 'Verification code expired'
      };
    }
    
    // Check if verification code matches
    if (storedCode === verificationCode) {
      // Update device status to connected and clear verification data
      await updateDeviceStatus(deviceId, 'connected');
      
      // Reset business_id field if it was used for verification
      await supabase
        .from('device_accounts')
        .update({
          type: 'phone_otp',
          status: 'connected',
          business_id: null
        })
        .eq('id', deviceId);
      
      // Clear session storage if it was used
      sessionStorage.removeItem(`verification-${deviceId}`);
      
      return {
        success: true,
        deviceId: deviceId,
        message: 'Phone number verified successfully'
      };
    } else {
      return {
        success: false,
        message: 'Invalid verification code'
      };
    }
  } catch (error) {
    console.error('Error verifying phone number:', error);
    return {
      success: false,
      message: 'Failed to verify phone number'
    };
  }
};

/**
 * Connect device via QR code
 */
export const connectDeviceViaQR = async (deviceId: string): Promise<DeviceConnectionStatus> => {
  try {
    const result = await updateDeviceStatus(deviceId, 'connected');
    
    if (!result) {
      throw new Error('Failed to update device status');
    }
    
    return {
      success: true,
      deviceId: deviceId,
      message: 'Device connected successfully via QR code'
    };
  } catch (error) {
    console.error('Error connecting device via QR code:', error);
    return {
      success: false,
      message: 'Failed to connect device via QR code'
    };
  }
};

/**
 * Connect device via Business API
 */
export const connectDeviceViaBusinessAPI = async (
  deviceId: string,
  businessId: string,
  apiKey: string
): Promise<DeviceConnectionStatus> => {
  try {
    // In a real implementation, this would validate the API key with Meta/WhatsApp Business API
    if (!businessId || !apiKey) {
      return {
        success: false,
        message: 'Business ID and API key are required'
      };
    }
    
    // Update the device with business ID and change status to connected
    const { error } = await supabase
      .from('device_accounts')
      .update({
        business_id: businessId,
        status: 'connected',
        last_active: new Date().toISOString()
      })
      .eq('id', deviceId);
      
    if (error) {
      throw error;
    }
    
    return {
      success: true,
      deviceId: deviceId,
      message: 'Device connected successfully via Business API'
    };
  } catch (error) {
    console.error('Error connecting device via Business API:', error);
    return {
      success: false,
      message: 'Failed to connect device via Business API'
    };
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
