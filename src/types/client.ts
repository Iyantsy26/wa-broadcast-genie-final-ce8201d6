
/**
 * Client and related types
 */

export interface ClientActivity {
  id: string;
  type: "note" | "status_change" | string;
  content: string;
  timestamp: string;
  createdBy: string;
}

export interface Client {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
  position?: string;
  status: "active" | "inactive" | "pending" | string;
  notes?: string;
  avatar?: string | null;
  createdAt: string;
  updatedAt: string;
  activities?: ClientActivity[];
}
