
import { z } from "zod";

export interface PlanFeature {
  id: string;
  name: string;
  value: string | number | boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  isPopular?: boolean;
  currency?: string;
}

// Define currency symbols without circular references
export const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£'
} as const;

// Define currency code type directly from literals
export type CurrencyCode = 'USD' | 'INR' | 'EUR' | 'GBP';

export const planFeatureSchema = z.object({
  id: z.string(),
  name: z.string(),
  value: z.union([z.string(), z.number(), z.boolean()])
});

export const planSchema = z.object({
  id: z.string(),
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  price: z.number().min(0, "Price must be a positive number"),
  interval: z.enum(['monthly', 'yearly']),
  features: z.array(planFeatureSchema),
  isPopular: z.boolean().optional(),
  currency: z.string().optional()
});

export type PlanFormValues = z.infer<typeof planSchema>;
