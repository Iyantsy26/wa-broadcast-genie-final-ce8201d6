
import { useState, useEffect } from 'react';
import { Conversation } from '@/types/conversation';
import { getConversations } from '@/services/conversations/getConversations';
import { toast } from '@/hooks/use-toast';
import { supabase } from "@/integrations/supabase/client";

export const useConversationState = () => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeConversation, setActiveConversation] = useState<Conversation | null>(null);
  const [isSidebarOpen, setIsSidebarOpen] = useState<boolean>(false);

  useEffect(() => {
    fetchConversations();

    // Set up real-time subscription for conversations
    const conversationsChannel = supabase
      .channel('conversations_changes')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'conversations'
        }, 
        async (payload) => {
          console.log('Conversations change detected:', payload);
          // Refresh conversations on any change
          fetchConversations();
        }
      )
      .subscribe();
      
    // Set up real-time subscription for team members that might affect conversations
    const teamMembersChannel = supabase
      .channel('team_members_for_conversations')
      .on('postgres_changes', 
        {
          event: '*',
          schema: 'public',
          table: 'team_members'
        }, 
        async (payload) => {
          console.log('Team members change detected that may affect conversations:', payload);
          // Refresh conversations when team members change as they might be contacts
          fetchConversations();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(conversationsChannel);
      supabase.removeChannel(teamMembersChannel);
    };
  }, []);

  const fetchConversations = async () => {
    try {
      console.log('Fetching all conversations...');
      setLoading(true);
      const data = await getConversations();
      console.log('Retrieved conversations:', data);
      console.log('Team conversations:', data.filter(c => c.chatType === 'team').length);
      
      setConversations(data);
      
      if (!activeConversation && data.length > 0) {
        setActiveConversation(data[0]);
      } else if (activeConversation) {
        // If there's an active conversation, find its updated version
        const updatedActiveConversation = data.find(
          conversation => 
            conversation.id === activeConversation.id || 
            conversation.contact.id === activeConversation.contact.id
        );
        
        if (updatedActiveConversation) {
          setActiveConversation(updatedActiveConversation);
        }
      }
    } catch (error) {
      console.error("Error fetching conversations:", error);
      toast({
        title: "Error",
        description: "Failed to load conversations",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return {
    conversations,
    setConversations,
    loading,
    activeConversation,
    setActiveConversation,
    isSidebarOpen,
    setIsSidebarOpen,
    refreshConversations: fetchConversations
  };
};
