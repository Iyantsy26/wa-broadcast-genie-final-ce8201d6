
import { DeviceAccount } from './deviceTypes';

// Mock data for development
export const mockDeviceAccounts: DeviceAccount[] = [
  {
    id: "1",
    name: "Marketing WhatsApp",
    phone: "+1 234-567-8901",
    status: "connected",
    type: "browser_qr",
    last_active: new Date().toISOString(),
    created_at: new Date().toISOString(),
    plan_tier: "professional"
  },
  {
    id: "2",
    name: "Support Team",
    phone: "+1 987-654-3210",
    status: "disconnected",
    type: "browser_web",
    last_active: new Date(Date.now() - 86400000).toISOString(),
    created_at: new Date(Date.now() - 86400000 * 10).toISOString(),
    plan_tier: "starter"
  }
];
