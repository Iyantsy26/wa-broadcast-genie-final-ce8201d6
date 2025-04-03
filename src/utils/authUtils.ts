
import { supabase } from "@/integrations/supabase/client";

/**
 * Gets the current domain for auth redirects
 * Will work on both custom domains and Lovable preview domains
 */
export const getCurrentDomain = (): string => {
  return window.location.origin;
};

/**
 * Signs in with email/password and properly handles redirects for different domains
 */
export const signInWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
    options: {
      emailRedirectTo: `${getCurrentDomain()}/dashboard`
    }
  });
  
  return { data, error };
};

/**
 * Signs up with email/password and properly handles redirects for different domains
 */
export const signUpWithEmail = async (email: string, password: string) => {
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      emailRedirectTo: `${getCurrentDomain()}/dashboard`,
      data: {
        // You can add additional user metadata here if needed
      }
    }
  });
  
  return { data, error };
};

/**
 * Signs out and redirects to the appropriate login page for the current domain
 */
export const signOutAndRedirect = async () => {
  const { error } = await supabase.auth.signOut();
  if (!error) {
    window.location.href = `${getCurrentDomain()}/login`;
  }
  return !error;
};
