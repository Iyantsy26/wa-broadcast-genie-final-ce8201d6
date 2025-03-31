
import { supabase } from "@/integrations/supabase/client";

export const addTagToConversation = async (conversationId: string, tag: string): Promise<void> => {
  try {
    // First get current tags
    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('tags')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation tags:', fetchError);
      throw fetchError;
    }

    const currentTags = data.tags || [];
    
    // Add new tag if it doesn't exist
    if (!currentTags.includes(tag)) {
      const newTags = [...currentTags, tag];

      const { error: updateError } = await supabase
        .from('conversations')
        .update({
          tags: newTags
        })
        .eq('id', conversationId);

      if (updateError) {
        console.error('Error updating tags:', updateError);
        throw updateError;
      }
    }
  } catch (error) {
    console.error('Error in addTagToConversation:', error);
    throw error;
  }
};

export const removeTag = async (conversationId: string, tag: string): Promise<void> => {
  try {
    // First get current tags
    const { data, error: fetchError } = await supabase
      .from('conversations')
      .select('tags')
      .eq('id', conversationId)
      .single();

    if (fetchError) {
      console.error('Error fetching conversation tags:', fetchError);
      throw fetchError;
    }

    const currentTags = data.tags || [];
    
    // Remove the tag
    const newTags = currentTags.filter(t => t !== tag);

    const { error: updateError } = await supabase
      .from('conversations')
      .update({
        tags: newTags
      })
      .eq('id', conversationId);

    if (updateError) {
      console.error('Error updating tags:', updateError);
      throw updateError;
    }
  } catch (error) {
    console.error('Error in removeTag:', error);
    throw error;
  }
};
