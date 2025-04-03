
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
      // Direct query to organizations to avoid the recursive RLS policy issue
      const { data, error } = await supabase
        .from('organizations')
        .select('id, name, slug, created_at, updated_at, is_active, owner_id');
        
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
      
      // For each org, calculate member count separately
      const orgsWithMemberCount = await Promise.all((data || []).map(async (org) => {
        try {
          // Get organization subscription info
          const { data: subscriptionData, error: subscriptionError } = await supabase
            .from('organization_subscriptions')
            .select('plan_id, status, current_period_end')
            .eq('organization_id', org.id)
            .maybeSingle();
            
          // Get plan info if subscription exists
          let planData = null;
          if (subscriptionData?.plan_id) {
            const { data: planInfo } = await supabase
              .from('plans')
              .select('name, price, interval, features')
              .eq('id', subscriptionData.plan_id)
              .maybeSingle();
              
            planData = planInfo;
          }
          
          // Get member count
          const { count, error: countError } = await supabase
            .from('organization_members')
            .select('id', { count: 'exact', head: true })
            .eq('organization_id', org.id);
            
          if (countError) {
            console.warn(`Error getting member count for org ${org.id}:`, countError);
          }
          
          // Get owner info
          let ownerData = null;
          if (org.owner_id) {
            const { data: teamMember } = await supabase
              .from('team_members')
              .select('name, email')
              .eq('id', org.owner_id)
              .maybeSingle();
              
            ownerData = teamMember;
          }
          
          return {
            ...org,
            memberCount: count || 0,
            subscription: subscriptionData,
            plan: planData,
            owner: ownerData
          };
        } catch (err) {
          console.error(`Error processing org data for ${org.id}:`, err);
          return {
            ...org,
            memberCount: 0
          };
        }
      }));
      
      setOrganizations(orgsWithMemberCount);
    } catch (error: any) {
      console.error('Error in useOrganizations:', error);
      setErrorMsg(`Failed to load organizations: ${error.message || 'Unknown error'}`);
      toast({
        title: 'Error',
        description: 'Failed to load organizations. Please try again later.',
        variant: 'destructive',
      });
      
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

  const updateOrganization = async (orgId: string, data: any) => {
    try {
      const { error } = await supabase
        .from('organizations')
        .update(data)
        .eq('id', orgId);
        
      if (error) {
        console.error('Error updating organization:', error);
        throw error;
      }
      
      toast({
        title: 'Organization Updated',
        description: 'The organization has been updated successfully',
      });
      
      fetchOrganizations();
      return true;
    } catch (error: any) {
      console.error('Error updating organization:', error);
      toast({
        title: 'Error',
        description: `Failed to update organization: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      return false;
    }
  };

  const createOrganization = async (data: any) => {
    try {
      const { data: newOrg, error } = await supabase
        .from('organizations')
        .insert(data)
        .select()
        .single();
        
      if (error) {
        console.error('Error creating organization:', error);
        throw error;
      }
      
      toast({
        title: 'Organization Created',
        description: 'The new organization has been created successfully',
      });
      
      fetchOrganizations();
      return newOrg;
    } catch (error: any) {
      console.error('Error creating organization:', error);
      toast({
        title: 'Error',
        description: `Failed to create organization: ${error.message || 'Unknown error'}`,
        variant: 'destructive',
      });
      return null;
    }
  };

  return {
    organizations,
    isLoading,
    errorMsg,
    fetchOrganizations,
    handleDeleteOrg,
    updateOrganization,
    createOrganization
  };
};
