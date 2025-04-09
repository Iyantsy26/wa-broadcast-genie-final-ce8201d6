
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Broadcast {
  id: string;
  name: string;
  status: 'scheduled' | 'sending' | 'completed' | 'draft';
  template?: string;
  audience: string;
  sent: number;
  delivered: number;
  read: number;
  responded: number;
  scheduled: string;
  created_at?: string;
  updated_at?: string;
}

export const fetchBroadcasts = async (): Promise<Broadcast[]> => {
  try {
    // Use type assertion to bypass TypeScript's strict table checking
    const { data, error } = await (supabase
      .from('broadcasts') as any)
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching broadcasts:', error);
    toast.error('Failed to load broadcast campaigns');
    return [];
  }
};

export const addBroadcast = async (broadcast: Omit<Broadcast, 'id'>): Promise<Broadcast | null> => {
  try {
    // Use type assertion to bypass TypeScript's strict table checking
    const { data, error } = await (supabase
      .from('broadcasts') as any)
      .insert({
        name: broadcast.name,
        status: broadcast.status,
        template: broadcast.template,
        audience: broadcast.audience,
        sent: broadcast.sent || 0,
        delivered: broadcast.delivered || 0,
        read: broadcast.read || 0,
        responded: broadcast.responded || 0,
        scheduled: broadcast.scheduled || ''
      })
      .select()
      .single();

    if (error) {
      throw error;
    }

    toast.success('Broadcast campaign created successfully');
    return data;
  } catch (error) {
    console.error('Error creating broadcast:', error);
    toast.error('Failed to create broadcast campaign');
    return null;
  }
};

export const updateBroadcast = async (id: string, updates: Partial<Broadcast>): Promise<boolean> => {
  try {
    // Use type assertion to bypass TypeScript's strict table checking
    const { error } = await (supabase
      .from('broadcasts') as any)
      .update(updates)
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast.success('Broadcast campaign updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating broadcast:', error);
    toast.error('Failed to update broadcast campaign');
    return false;
  }
};

export const deleteBroadcast = async (id: string): Promise<boolean> => {
  try {
    // Use type assertion to bypass TypeScript's strict table checking
    const { error } = await (supabase
      .from('broadcasts') as any)
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    toast.success('Broadcast campaign deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting broadcast:', error);
    toast.error('Failed to delete broadcast campaign');
    return false;
  }
};

export const subscribeToBroadcastChanges = (callback: (broadcasts: Broadcast[]) => void) => {
  const channel = supabase
    .channel('broadcasts-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'broadcasts' },
      async () => {
        // When any change happens, fetch the updated list
        const broadcasts = await fetchBroadcasts();
        callback(broadcasts);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
