
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Chatbot {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'draft';
  flow: any[];
  triggers: string[];
  created_at: string;
  updated_at: string;
  version: number;
  device_id?: string;
}

export const fetchChatbots = async (): Promise<Chatbot[]> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .order('updated_at', { ascending: false }) as { data: Chatbot[] | null; error: any };

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching chatbots:', error);
    toast.error('Failed to load chatbots');
    return [];
  }
};

export const getChatbot = async (id: string): Promise<Chatbot | null> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('chatbots')
      .select('*')
      .eq('id', id)
      .single() as { data: Chatbot | null; error: any };

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching chatbot:', error);
    toast.error('Failed to load chatbot');
    return null;
  }
};

export const addChatbot = async (chatbot: Omit<Chatbot, 'id' | 'created_at' | 'updated_at' | 'version'>): Promise<Chatbot | null> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('chatbots')
      .insert({
        name: chatbot.name,
        description: chatbot.description || '',
        status: chatbot.status || 'draft',
        flow: chatbot.flow || [],
        triggers: chatbot.triggers || [],
        version: 1,
        device_id: chatbot.device_id
      })
      .select()
      .single() as { data: Chatbot | null; error: any };

    if (error) {
      throw error;
    }

    toast.success('Chatbot created successfully');
    return data;
  } catch (error) {
    console.error('Error creating chatbot:', error);
    toast.error('Failed to create chatbot');
    return null;
  }
};

export const updateChatbot = async (id: string, updates: Partial<Chatbot>): Promise<boolean> => {
  try {
    // Increment version if flow is updated
    const versionUpdate = updates.flow ? { version: (updates.version || 1) + 1 } : {};
    
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('chatbots')
      .update({
        ...updates,
        ...versionUpdate,
        updated_at: new Date().toISOString()
      })
      .eq('id', id) as { data: any; error: any };

    if (error) {
      throw error;
    }

    toast.success('Chatbot updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating chatbot:', error);
    toast.error('Failed to update chatbot');
    return false;
  }
};

export const deleteChatbot = async (id: string): Promise<boolean> => {
  try {
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('chatbots')
      .delete()
      .eq('id', id) as { data: any; error: any };

    if (error) {
      throw error;
    }

    toast.success('Chatbot deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting chatbot:', error);
    toast.error('Failed to delete chatbot');
    return false;
  }
};

export const subscribeToChatbotChanges = (callback: (chatbots: Chatbot[]) => void) => {
  const channel = supabase
    .channel('chatbots-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'chatbots' },
      async () => {
        // When any change happens, fetch the updated list
        const chatbots = await fetchChatbots();
        callback(chatbots);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
