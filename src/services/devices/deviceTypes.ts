
export interface DeviceAccount {
  id: string;
  name: string;
  phone: string;
  status: 'connected' | 'disconnected' | 'expired';
  type: string;
  last_active?: string;
  business_id?: string;
  plan_tier?: 'starter' | 'professional' | 'enterprise';
  organization_id?: string;
  created_at?: string;
  qr_code_url?: string;
  verification_code?: string;
  verification_sent_at?: string;
}

export interface AccountLimitResult {
  canAdd: boolean;
  currentCount: number;
  limit: number;
}

export interface DeviceConnectionStatus {
  success: boolean;
  message: string;
  deviceId?: string;
}

export interface QRCodeResponse {
  qrCodeUrl: string;
  expiresAt: string;
}

export interface VerificationResponse {
  success: boolean;
  verification_id?: string;
  message: string;
}

export interface DeviceConnection {
  type: 'browser_qr' | 'browser_web' | 'phone_otp' | 'business_api';
  deviceId?: string;
  status: 'pending' | 'connected' | 'failed';
  sessionData?: any;
}
