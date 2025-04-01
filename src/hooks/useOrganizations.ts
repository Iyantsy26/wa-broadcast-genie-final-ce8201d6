
import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export const useOrganizations = () => {
  const { toast } = useToast();
  const [organizations, setOrganizations] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const fetchOrganizations = async () => {
    setIsLoading(true);
    setErrorMsg(null);
    
    try {
      // Use an alternative approach to avoid the infinite recursion RLS policy issue
      // Instead of using organization_members in the query, just fetch organizations directly
      const { data, error } = await supabase
        .from('organizations')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        console.error('Error fetching organizations:', error);
        setErrorMsg(`Failed to load organizations: ${error.message}`);
        toast({
          title: 'Error',
          description: `Failed to load organizations: ${error.message}`,
          variant: 'destructive',
        });
        setOrganizations([]);
        return;
      }
      
      // For each org, calculate member count by fetching each org's members separately
      const orgsWithMemberCount = await Promise.all((data || []).map(async (org) => {
        try {
          // Use a separate count query for each organization's members
          const { count, error: countError } = await supabase
            .from('organization_members')
            .select('*', { count: 'exact', head: true })
            .eq('organization_id', org.id);
          
          if (countError) {
            console.error(`Error getting member count for org ${org.id}:`, countError);
            return {
              ...org,
              memberCount: 0,
            };
          }
          
          return {
            ...org,
            memberCount: count || 0,
          };
        } catch (err) {
          console.error(`Error getting member count for org ${org.id}:`, err);
          return {
            ...org,
            memberCount: 0,
          };
        }
      }));
      
      setOrganizations(orgsWithMemberCount);
    } catch (error: any) {
      console.error('Error fetching organizations:', error);
      setErrorMsg(`Failed to load organizations: ${error.message || 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to load organizations. Please try again later.',
        variant: 'destructive',
      });
      
      // Set empty array to prevent infinite loading state
      setOrganizations([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizations();
  }, []);

  const handleDeleteOrg = async (orgId: string) => {
    if (!confirm('Are you sure you want to delete this organization? This action cannot be undone.')) {
      return;
    }
    
    try {
      // Delete organization
      const { error } = await supabase
        .from('organizations')
        .delete()
        .eq('id', orgId);
        
      if (error) {
        console.error('Error deleting organization:', error);
        throw error;
      }
      
      toast({
        title: 'Organization Deleted',
        description: 'The organization has been deleted successfully',
      });
      
      fetchOrganizations();
    } catch (error: any) {
      console.error('Error deleting organization:', error);
      toast({
        title: 'Error',
        description: `Failed to delete organization: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
    }
  };

  return {
    organizations,
    isLoading,
    errorMsg,
    fetchOrganizations,
    handleDeleteOrg,
  };
};
