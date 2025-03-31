
/**
 * Type definitions for device-related operations
 */

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

export type PlanTier = 'starter' | 'professional' | 'enterprise';

export interface AccountLimitResult {
  canAdd: boolean;
  currentCount: number;
  limit: number;
}
