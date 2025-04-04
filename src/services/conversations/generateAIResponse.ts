
import { supabase } from "@/integrations/supabase/client";

export const generateAIResponse = async (prompt: string): Promise<string> => {
  try {
    // In a real application, this would call an AI service like OpenAI
    // For this demo, we'll just simulate an AI response
    console.log(`Generating AI response for prompt: ${prompt}`);
    
    // Mock AI response delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Create a simple mock response based on the prompt
    let response = '';
    
    if (prompt.toLowerCase().includes('pricing')) {
      response = "Thank you for your interest in our pricing. Our plans start at $19/month for the Basic plan, $49/month for the Pro plan, and $99/month for the Enterprise plan. Each plan includes different features and capabilities. Would you like me to provide more details about what's included in each plan?";
    } else if (prompt.toLowerCase().includes('hello') || prompt.toLowerCase().includes('hi')) {
      response = "Hello! Thank you for reaching out. How can I assist you today? I'm happy to help with any questions you might have about our services.";
    } else if (prompt.toLowerCase().includes('thank')) {
      response = "You're welcome! It's my pleasure to assist you. If you have any other questions or need further help in the future, don't hesitate to reach out.";
    } else {
      response = "Thank you for your message. I'll be happy to help with your inquiry. Could you please provide a bit more information so I can assist you better?";
    }
    
    return response;
  } catch (error) {
    console.error('Error in generateAIResponse:', error);
    throw error;
  }
};
