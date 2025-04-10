import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { uploadFile } from "@/utils/fileUpload";
import { TemplateButton } from "@/components/templates/ButtonEditor";
import { Json } from "@/integrations/supabase/types";

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
  media_type?: 'image' | 'video' | 'document';
  buttons?: TemplateButton[];
}

export const fetchTemplates = async (): Promise<Template[]> => {
  try {
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

export const addTemplate = async (
  template: Omit<Template, 'id' | 'created_at'>, 
  mediaFile?: File | null
): Promise<Template | null> => {
  try {
    let mediaUrl: string | undefined;
    let mediaType: 'image' | 'video' | 'document' | undefined;
    
    if (mediaFile) {
      if (mediaFile.type.startsWith('image/')) {
        mediaType = 'image';
      } else if (mediaFile.type.startsWith('video/')) {
        mediaType = 'video';
      } else {
        mediaType = 'document';
      }
      
      mediaUrl = await uploadFile(mediaFile);
      if (!mediaUrl) {
        throw new Error('Failed to upload media file');
      }
    }

    const buttonsJson = template.buttons ? JSON.parse(JSON.stringify(template.buttons)) : undefined;
    
    const { data, error } = await supabase
      .from('templates')
      .insert({
        name: template.name,
        status: template.status || 'pending',
        type: template.type,
        language: template.language,
        content: template.content,
        variables: template.variables || [],
        media_url: mediaUrl || template.media_url,
        media_type: mediaType || template.media_type,
        buttons: buttonsJson
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
    const updatesWithJsonButtons = {
      ...updates,
      buttons: updates.buttons ? JSON.parse(JSON.stringify(updates.buttons)) : undefined
    };
    
    const { error } = await supabase
      .from('templates')
      .update(updatesWithJsonButtons)
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

export const getTemplateCategoriesSummary = async (): Promise<any> => {
  try {
    const templates = await fetchTemplates();
    
    const total = templates.length;
    const approved = templates.filter(t => t.status === 'approved').length;
    const pending = templates.filter(t => t.status === 'pending').length;
    const rejected = templates.filter(t => t.status === 'rejected').length;
    
    const textCount = templates.filter(t => t.type === 'text').length;
    const mediaCount = templates.filter(t => t.type === 'media').length;
    const interactiveCount = templates.filter(t => t.type === 'interactive').length;
    
    return {
      total,
      approved,
      pending,
      rejected,
      byType: {
        text: textCount,
        media: mediaCount,
        interactive: interactiveCount
      }
    };
  } catch (error) {
    console.error('Error generating templates summary:', error);
    return null;
  }
};

export const subscribeToTemplateChanges = (callback: (templates: Template[]) => void) => {
  const channel = supabase
    .channel('templates-changes')
    .on('postgres_changes', 
      { event: '*', schema: 'public', table: 'templates' },
      async () => {
        const templates = await fetchTemplates();
        callback(templates);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
};
