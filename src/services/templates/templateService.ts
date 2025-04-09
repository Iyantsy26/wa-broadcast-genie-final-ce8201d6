
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface Template {
  id: string;
  name: string;
  status: 'approved' | 'pending' | 'rejected';
  type: 'text' | 'media' | 'interactive';
  language: string;
  content: string;
  created_at: string;
  last_used?: string;
  variables?: string[];
  media_url?: string;
  buttons?: any[];
}

export const fetchTemplates = async (): Promise<Template[]> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('templates')
      .select('*')
      .order('created_at', { ascending: false }) as { data: Template[] | null; error: any };

    if (error) {
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error('Error fetching templates:', error);
    toast.error('Failed to load templates');
    return [];
  }
};

export const addTemplate = async (template: Omit<Template, 'id' | 'created_at'>): Promise<Template | null> => {
  try {
    // Type assertion with explicit generic to bypass TypeScript's strict table checking
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: template.name,
        status: template.status || 'pending',
        type: template.type,
        language: template.language,
        content: template.content,
        variables: template.variables || [],
        media_url: template.media_url,
        buttons: template.buttons
      })
      .select()
      .single() as { data: Template | null; error: any };

    if (error) {
      throw error;
    }

    toast.success('Template submitted successfully');
    return data;
  } catch (error) {
    console.error('Error creating template:', error);
    toast.error('Failed to create template');
    return null;
  }
};

export const updateTemplate = async (id: string, updates: Partial<Template>): Promise<boolean> => {
  try {
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('templates')
      .update(updates)
      .eq('id', id) as { data: any; error: any };

    if (error) {
      throw error;
    }

    toast.success('Template updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating template:', error);
    toast.error('Failed to update template');
    return false;
  }
};

export const deleteTemplate = async (id: string): Promise<boolean> => {
  try {
    // Type assertion to bypass TypeScript's strict table checking
    const { error } = await supabase
      .from('templates')
      .delete()
      .eq('id', id) as { data: any; error: any };

    if (error) {
      throw error;
    }

    toast.success('Template deleted successfully');
    return true;
  } catch (error) {
    console.error('Error deleting template:', error);
    toast.error('Failed to delete template');
    return false;
  }
};

export const markTemplateUsed = async (id: string): Promise<void> => {
  try {
    // Type assertion to bypass TypeScript's strict table checking
    await supabase
      .from('templates')
      .update({ 
        last_used: new Date().toISOString() 
      })
      .eq('id', id) as { data: any; error: any };
  } catch (error) {
    console.error('Error updating template last used date:', error);
  }
};

export const subscribeToTemplateChanges = (callback: (templates: Template[]) => void) => {
  const channel = supabase
    .channel('templates-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'templates' },
      async () => {
        // When any change happens, fetch the updated list
        const templates = await fetchTemplates();
        callback(templates);
      }
    )
    .subscribe();

  // Return unsubscribe function
  return () => {
    supabase.removeChannel(channel);
  };
};
