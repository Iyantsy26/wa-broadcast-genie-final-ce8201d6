
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
 * Send verification code to phone number
 */
export const sendVerificationCode = async (
  phoneNumber: string, 
  countryCode: string,
  deviceId: string
): Promise<VerificationResponse> => {
  try {
    // In a real implementation, this would make a call to a SMS service API
    // For demonstration, we'll simulate sending a verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    
    // Store verification code in device_accounts table temporarily
    // Using the notes field to store verification data (not ideal but works)
    try {
      const { error } = await supabase
        .from('device_accounts')
        .update({ 
          // Store verification code as metadata in existing field
          type: `verification:${verificationCode}`,
          last_active: new Date().toISOString()
        })
        .eq('id', deviceId);
        
      if (error) {
        throw error;
      }
    } catch (error) {
      // Fallback to session storage if update fails
      console.warn("Falling back to temporary storage for verification code");
      sessionStorage.setItem(`verification-${deviceId}`, JSON.stringify({
        code: verificationCode,
        sent_at: new Date().toISOString()
      }));
    }

    // This would be an SMS service in a real implementation
    console.log(`Verification code ${verificationCode} sent to ${countryCode}${phoneNumber}`);
    
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
    // Try to get verification from device_accounts table
    let storedCode = "";
    let sentAt: Date;
    
    const { data, error } = await supabase
      .from('device_accounts')
      .select('type, last_active')
      .eq('id', deviceId)
      .maybeSingle();
      
    if (error || !data || !data.type || !data.type.startsWith('verification:')) {
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
      // Extract verification code from type field
      storedCode = data.type.split(':')[1];
      sentAt = new Date(data.last_active);
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
      
      // Reset device type if it was used for verification
      await supabase
        .from('device_accounts')
        .update({
          type: 'phone_otp', // Set to normal type
          status: 'connected'
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
    // In a real implementation, this would validate the connection with WhatsApp Business API
    // For demonstration, we'll simulate a successful connection
    await updateDeviceStatus(deviceId, 'connected');
    
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
