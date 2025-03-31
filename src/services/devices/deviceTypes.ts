
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
  organization_id?: string;
  organization_name?: string;
}

export type PlanTier = 'starter' | 'professional' | 'enterprise';

export interface AccountLimitResult {
  canAdd: boolean;
  currentCount: number;
  limit: number;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  created_at?: string;
  owner_id?: string;
  is_active: boolean;
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
}

export interface Plan {
  id: string;
  name: string;
  description?: string;
  price?: number;
  interval?: 'monthly' | 'yearly';
  is_active: boolean;
  is_custom: boolean;
  features: {
    whatsapp_accounts?: number;
    broadcasts_per_month?: number;
    team_members?: number;
    templates?: number;
    [key: string]: any;
  };
}

export interface OrganizationSubscription {
  id: string;
  organization_id: string;
  plan_id: string;
  status: 'active' | 'trialing' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'past_due' | 'unpaid';
  current_period_start: string;
  current_period_end: string;
  plan?: Plan;
}
