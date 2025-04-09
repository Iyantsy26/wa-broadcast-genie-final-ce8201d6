import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";

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
  message_content?: string;
  media_url?: string;
  media_type?: 'image' | 'video' | 'document';
}

export const fetchBroadcasts = async (): Promise<Broadcast[]> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('broadcasts')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Broadcast[] | null; error: any };

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

export const addBroadcast = async (
  broadcast: Omit<Broadcast, 'id'>, 
  mediaFile?: File | null
): Promise<Broadcast | null> => {
  try {
    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | 'document' | undefined;
    
    // Upload media file if provided
    if (mediaFile) {
      // Determine media type from file
      if (mediaFile.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (mediaFile.type.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'document';
      }
      
      // Upload to Supabase storage
      mediaUrl = await uploadFile(mediaFile, 'broadcast-media');
      if (!mediaUrl) {
        throw new Error('Failed to upload media file');
      }
    }
    
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('broadcasts')
      .insert({
        name: broadcast.name,
        status: broadcast.status,
        template: broadcast.template,
        audience: broadcast.audience,
        sent: broadcast.sent || 0,
        delivered: broadcast.delivered || 0,
        read: broadcast.read || 0,
        responded: broadcast.responded || 0,
        scheduled: broadcast.scheduled || '',
        message_content: broadcast.message_content,
        media_url: mediaUrl || broadcast.media_url,
        media_type: mediaType || broadcast.media_type
      })
      .select()
      .single() as { data: Broadcast | null; error: any };

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
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('broadcasts')
      .update(updates)
      .eq('id', id) as { data: any; error: any };

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
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('broadcasts')
      .delete()
      .eq('id', id) as { data: any; error: any };

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

export const getBroadcastStatistics = async (broadcastId: string): Promise<any> => {
  try {
    // In a real implementation, this would fetch detailed statistics about the broadcast
    // For now, we'll return mock data
    const broadcasts = await fetchBroadcasts();
    const broadcast = broadcasts.find(b => b.id === broadcastId);
    
    if (!broadcast) {
      throw new Error('Broadcast not found');
    }
    
    return {
      total: broadcast.sent,
      delivered: broadcast.delivered,
      read: broadcast.read,
      responded: broadcast.responded,
      failedDelivery: broadcast.sent - broadcast.delivered,
      clickRate: broadcast.responded > 0 ? (broadcast.responded / broadcast.sent) * 100 : 0,
      readRate: broadcast.read > 0 ? (broadcast.read / broadcast.sent) * 100 : 0,
      deliveryRate: broadcast.delivered > 0 ? (broadcast.delivered / broadcast.sent) * 100 : 0
    };
  } catch (error) {
    console.error('Error fetching broadcast statistics:', error);
    toast.error('Failed to load broadcast statistics');
    return null;
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
