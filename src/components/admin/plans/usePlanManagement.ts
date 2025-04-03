import { useState, useEffect } from 'react';
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { CurrencyCode, SubscriptionPlan, PlanFeature } from './PlanTypes';
import { Json } from "@/integrations/supabase/types";

export const usePlanManagement = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [],
    isPopular: false,
    currency: 'INR',
  });
  const [featureForm, setFeatureForm] = useState({
    name: '',
    value: '',
  });
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Load plans from Supabase
  useEffect(() => {
    fetchPlans();
  }, []);
  
  const fetchPlans = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('plans')
        .select('*')
        .order('created_at', { ascending: false });
        
      if (error) {
        throw error;
      }
      
      if (data && data.length > 0) {
        const formattedPlans = data.map(plan => {
          // Parse the features object from JSON safely
          const featuresObj = plan.features as unknown as Record<string, any>;
          
          return {
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price || 0,
            interval: plan.interval as 'monthly' | 'yearly',
            features: Array.isArray(featuresObj?.features) ? featuresObj.features : [],
            isPopular: Boolean(featuresObj?.isPopular || false),
            currency: featuresObj?.currency || 'INR'
          };
        });
        
        setPlans(formattedPlans);
      } else {
        // No plans found, load initial sample plans
        await loadInitialPlans();
      }
    } catch (error) {
      console.error("Error loading plans:", error);
      toast({
        title: "Error",
        description: "Failed to load subscription plans.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const loadInitialPlans = async () => {
    const initialPlans: SubscriptionPlan[] = [
      {
        id: '1',
        name: 'Basic',
        description: 'For small teams and startups',
        price: 1999,
        interval: 'monthly',
        currency: 'INR',
        features: [
          { id: '1-1', name: 'WhatsApp Accounts', value: 1 },
          { id: '1-2', name: 'Team Members', value: 3 },
          { id: '1-3', name: 'Storage', value: '5GB' },
          { id: '1-4', name: 'Analytics', value: true },
        ]
      },
      {
        id: '2',
        name: 'Professional',
        description: 'For growing businesses',
        price: 4999,
        interval: 'monthly',
        currency: 'INR',
        features: [
          { id: '2-1', name: 'WhatsApp Accounts', value: 3 },
          { id: '2-2', name: 'Team Members', value: 10 },
          { id: '2-3', name: 'Storage', value: '20GB' },
          { id: '2-4', name: 'Analytics', value: true },
          { id: '2-5', name: 'API Access', value: true },
        ],
        isPopular: true
      },
      {
        id: '3',
        name: 'Enterprise',
        description: 'For large organizations',
        price: 14999,
        interval: 'monthly',
        currency: 'INR',
        features: [
          { id: '3-1', name: 'WhatsApp Accounts', value: 10 },
          { id: '3-2', name: 'Team Members', value: 'Unlimited' },
          { id: '3-3', name: 'Storage', value: '100GB' },
          { id: '3-4', name: 'Analytics', value: true },
          { id: '3-5', name: 'API Access', value: true },
          { id: '3-6', name: 'Dedicated Support', value: true },
        ]
      }
    ];
    
    setPlans(initialPlans);
    
    // Save initial plans to Supabase
    try {
      for (const plan of initialPlans) {
        await savePlanToSupabase(plan);
      }
    } catch (error) {
      console.error("Error saving initial plans:", error);
    }
  };
  
  const savePlanToSupabase = async (plan: SubscriptionPlan) => {
    try {
      // Create a properly formatted features object for Supabase
      const featuresObject = {
        features: plan.features,
        isPopular: plan.isPopular,
        currency: plan.currency || 'INR'
      };
      
      // Convert the features object to JSON compatible with Supabase
      const jsonFeatures = featuresObject as unknown as Json;
      
      const { error } = await supabase
        .from('plans')
        .upsert({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          features: jsonFeatures,
          is_active: true
        });
        
      if (error) {
        throw error;
      }
    } catch (error) {
      console.error("Error saving plan to Supabase:", error);
      throw error;
    }
  };
  
  const handleChangeCurrency = (currency: CurrencyCode) => {
    setSelectedCurrency(currency);
    
    // Update currency in all plans
    const updatedPlans = plans.map(plan => ({
      ...plan,
      currency
    }));
    
    setPlans(updatedPlans);
    
    // Save updated plans to Supabase
    try {
      updatedPlans.forEach(async (plan) => {
        await savePlanToSupabase(plan);
      });
      
      toast({
        title: "Currency updated",
        description: `Default currency changed to ${currency}.`,
      });
    } catch (error) {
      console.error("Error updating plan currency:", error);
      toast({
        title: "Error",
        description: "Failed to update currency for all plans.",
        variant: "destructive",
      });
    }
  };
  
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'price') {
      setFormData(prev => ({ ...prev, [name]: parseFloat(value) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleFeatureChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFeatureForm(prev => ({ ...prev, [name]: value }));
  };
  
  const addFeature = () => {
    if (!featureForm.name) return;
    
    const newFeature: PlanFeature = {
      id: Math.random().toString(36).substring(2, 11),
      name: featureForm.name,
      value: featureForm.value || true,
    };
    
    setFormData(prev => ({
      ...prev,
      features: [...(prev.features || []), newFeature],
    }));
    
    setFeatureForm({ name: '', value: '' });
  };
  
  const removeFeature = (featureId: string) => {
    setFormData(prev => ({
      ...prev,
      features: (prev.features || []).filter(f => f.id !== featureId),
    }));
  };
  
  const handleTogglePopular = () => {
    setFormData(prev => ({
      ...prev,
      isPopular: !prev.isPopular,
    }));
  };
  
  const addPlan = async () => {
    if (!formData.name || formData.price === undefined) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the plan",
        variant: "destructive",
      });
      return false;
    }
    
    const newPlan: SubscriptionPlan = {
      id: Math.random().toString(36).substring(2, 11),
      name: formData.name,
      description: formData.description || '',
      price: formData.price,
      interval: formData.interval || 'monthly',
      features: formData.features || [],
      isPopular: formData.isPopular,
      currency: formData.currency || selectedCurrency,
    };
    
    try {
      await savePlanToSupabase(newPlan);
      
      setPlans([...plans, newPlan]);
      resetForm();
      
      toast({
        title: "Plan added",
        description: `${newPlan.name} plan has been added successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error adding plan:", error);
      toast({
        title: "Error",
        description: "Failed to add plan. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const updatePlan = async () => {
    if (!selectedPlan || !formData.name || formData.price === undefined) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the plan",
        variant: "destructive",
      });
      return false;
    }
    
    const updatedPlan: SubscriptionPlan = {
      ...selectedPlan,
      name: formData.name,
      description: formData.description || selectedPlan.description,
      price: formData.price,
      interval: formData.interval || selectedPlan.interval,
      features: formData.features || selectedPlan.features,
      isPopular: formData.isPopular,
      currency: formData.currency || selectedPlan.currency || selectedCurrency,
    };
    
    try {
      await savePlanToSupabase(updatedPlan);
      
      const updatedPlans = plans.map(plan => {
        if (plan.id === selectedPlan.id) {
          return updatedPlan;
        }
        return plan;
      });
      
      setPlans(updatedPlans);
      resetForm();
      
      toast({
        title: "Plan updated",
        description: `${formData.name} plan has been updated successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const deletePlan = async (planToDelete: SubscriptionPlan) => {
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', planToDelete.id);
        
      if (error) {
        throw error;
      }
      
      const updatedPlans = plans.filter(plan => plan.id !== planToDelete.id);
      setPlans(updatedPlans);
      
      toast({
        title: "Plan deleted",
        description: `${planToDelete.name} plan has been deleted successfully.`,
      });
      
      return true;
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
      
      return false;
    }
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      interval: 'monthly',
      features: [],
      isPopular: false,
      currency: selectedCurrency,
    });
    setFeatureForm({ name: '', value: '' });
    setSelectedPlan(null);
  };
  
  const editPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setFormData({
      name: plan.name,
      description: plan.description,
      price: plan.price,
      interval: plan.interval,
      features: [...plan.features],
      isPopular: plan.isPopular,
      currency: plan.currency || selectedCurrency,
    });
  };
  
  return {
    plans,
    isLoading,
    selectedCurrency,
    formData,
    setFormData,
    featureForm,
    selectedPlan,
    setSelectedPlan,
    handleChangeCurrency,
    handleInputChange,
    handleFeatureChange,
    addFeature,
    removeFeature,
    handleTogglePopular,
    addPlan,
    updatePlan,
    deletePlan,
    resetForm,
    editPlan,
  };
};
