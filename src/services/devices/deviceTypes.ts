
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

// Add the missing types referenced in errors
export interface UserRole {
  id: string;
  user_id: string;
  role: 'super_admin' | 'admin' | 'user' | 'white_label';
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  owner_id?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationBranding {
  id: string;
  organization_id: string;
  logo_url?: string;
  favicon_url?: string;
  primary_color?: string;
  secondary_color?: string;
  accent_color?: string;
  custom_domain?: string;
  custom_domain_verified?: boolean;
  created_at: string;
  updated_at: string;
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  interval?: string;
  features: any;
  is_custom: boolean;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: string;
  payment_provider?: string;
  payment_provider_subscription_id?: string;
  current_period_start: string;
  current_period_end: string;
  canceled_at?: string;
  cancel_at?: string;
  created_at: string;
  updated_at: string;
}

export interface TeamMember {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role: UserRole['role'];
  status: 'active' | 'suspended' | 'pending';
  company?: string;
  position?: string;
  address?: string;
  avatar?: string;
  department_id?: string;
  is_super_admin?: boolean;
  custom_id?: string;
  created_at: string;
  updated_at: string;
  last_active?: string;
}
