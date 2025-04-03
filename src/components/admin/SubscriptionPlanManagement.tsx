
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import {
  Check,
  CheckCircle,
  CreditCard,
  Edit,
  Plus,
  Trash,
  Sparkles,
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";

interface PlanFeature {
  id: string;
  name: string;
  value: string | number | boolean;
}

interface SubscriptionPlan {
  id: string;
  name: string;
  description: string;
  price: number;
  interval: 'monthly' | 'yearly';
  features: PlanFeature[];
  isPopular?: boolean;
  currency?: string;
}

const CURRENCY_SYMBOLS = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£'
};

type CurrencyCode = keyof typeof CURRENCY_SYMBOLS;

const SubscriptionPlanManagement = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCurrency, setSelectedCurrency] = useState<CurrencyCode>('INR');
  
  // Form state
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [],
    isPopular: false,
    currency: 'INR',
  });
  
  // Features form state
  const [featureForm, setFeatureForm] = useState({
    name: '',
    value: '',
  });

  // Load plans from Supabase
  useEffect(() => {
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
          const formattedPlans = data.map(plan => ({
            id: plan.id,
            name: plan.name,
            description: plan.description || '',
            price: plan.price || 0,
            interval: plan.interval as 'monthly' | 'yearly',
            features: plan.features?.features || [],
            isPopular: plan.features?.isPopular || false,
            currency: plan.features?.currency || 'INR'
          }));
          
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
    
    fetchPlans();
  }, [toast]);
  
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
      const { error } = await supabase
        .from('plans')
        .upsert({
          id: plan.id,
          name: plan.name,
          description: plan.description,
          price: plan.price,
          interval: plan.interval,
          features: {
            features: plan.features,
            isPopular: plan.isPopular,
            currency: plan.currency || 'INR'
          },
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
  
  const handleAddPlan = async () => {
    if (!formData.name || formData.price === undefined) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the plan",
        variant: "destructive",
      });
      return;
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
      setShowAddPlanDialog(false);
      
      toast({
        title: "Plan added",
        description: `${newPlan.name} plan has been added successfully.`,
      });
    } catch (error) {
      console.error("Error adding plan:", error);
      toast({
        title: "Error",
        description: "Failed to add plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleEditPlan = async () => {
    if (!selectedPlan || !formData.name || formData.price === undefined) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the plan",
        variant: "destructive",
      });
      return;
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
      setShowEditPlanDialog(false);
      
      toast({
        title: "Plan updated",
        description: `${formData.name} plan has been updated successfully.`,
      });
    } catch (error) {
      console.error("Error updating plan:", error);
      toast({
        title: "Error",
        description: "Failed to update plan. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleDeletePlan = async () => {
    if (!selectedPlan) return;
    
    try {
      const { error } = await supabase
        .from('plans')
        .delete()
        .eq('id', selectedPlan.id);
        
      if (error) {
        throw error;
      }
      
      const updatedPlans = plans.filter(plan => plan.id !== selectedPlan.id);
      setPlans(updatedPlans);
      setShowDeletePlanDialog(false);
      
      toast({
        title: "Plan deleted",
        description: `${selectedPlan.name} plan has been deleted successfully.`,
      });
    } catch (error) {
      console.error("Error deleting plan:", error);
      toast({
        title: "Error",
        description: "Failed to delete plan. Please try again.",
        variant: "destructive",
      });
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
    setShowEditPlanDialog(true);
  };
  
  const confirmDeletePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeletePlanDialog(true);
  };
  
  const formatPrice = (price: number, currency: string = selectedCurrency, interval: 'monthly' | 'yearly') => {
    const currencySymbol = CURRENCY_SYMBOLS[currency as CurrencyCode] || CURRENCY_SYMBOLS[selectedCurrency];
    return `${currencySymbol}${price}/${interval === 'monthly' ? 'mo' : 'yr'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Label htmlFor="currency" className="mr-2">Currency:</Label>
            <Select value={selectedCurrency} onValueChange={(value: CurrencyCode) => handleChangeCurrency(value)}>
              <SelectTrigger className="w-24">
                <SelectValue placeholder="Select currency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INR">₹ INR</SelectItem>
                <SelectItem value="USD">$ USD</SelectItem>
                <SelectItem value="EUR">€ EUR</SelectItem>
                <SelectItem value="GBP">£ GBP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={() => {
            resetForm();
            setShowAddPlanDialog(true);
          }}>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center py-10">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card key={plan.id} className={plan.isPopular ? 'border-primary' : ''}>
              {plan.isPopular && (
                <div className="absolute top-0 right-0 bg-primary text-white text-xs px-3 py-1 rounded-bl-md rounded-tr-md">
                  Popular
                </div>
              )}
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
                <div className="mt-2">
                  <span className="text-3xl font-bold">
                    {CURRENCY_SYMBOLS[plan.currency as CurrencyCode] || CURRENCY_SYMBOLS[selectedCurrency]}
                    {plan.price}
                  </span>
                  <span className="text-muted-foreground ml-1">
                    /{plan.interval === 'monthly' ? 'month' : 'year'}
                  </span>
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {plan.features.map((feature) => (
                    <li key={feature.id} className="flex items-start">
                      <CheckCircle className="h-5 w-5 text-green-500 mr-2 shrink-0 mt-0.5" />
                      <span>
                        {feature.name}: {' '}
                        {typeof feature.value === 'boolean' 
                          ? (feature.value ? 'Yes' : 'No') 
                          : feature.value}
                      </span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter className="flex justify-between">
                <Button variant="outline" onClick={() => editPlan(plan)}>
                  <Edit className="h-4 w-4 mr-2" />
                  Edit
                </Button>
                <Button variant="destructive" onClick={() => confirmDeletePlan(plan)}>
                  <Trash className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      {/* Add Plan Dialog */}
      <Dialog open={showAddPlanDialog} onOpenChange={setShowAddPlanDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Add Subscription Plan</DialogTitle>
            <DialogDescription>
              Create a new subscription plan for your customers.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Plan Name</Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Basic, Pro, Enterprise"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    {CURRENCY_SYMBOLS[selectedCurrency]}
                  </span>
                  <Input
                    id="price"
                    name="price"
                    type="number"
                    value={formData.price?.toString()}
                    onChange={handleInputChange}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the plan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="interval">Billing Interval</Label>
              <Select
                value={formData.interval}
                onValueChange={(value: 'monthly' | 'yearly') => 
                  setFormData(prev => ({ ...prev, interval: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="isPopular"
                  checked={formData.isPopular}
                  onChange={handleTogglePopular}
                  className="mr-2"
                />
                <Label htmlFor="isPopular" className="cursor-pointer">
                  Mark as popular plan
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="border rounded-md p-4">
                <div className="space-y-4">
                  {formData.features && formData.features.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.features.map((feature) => (
                        <li key={feature.id} className="flex items-center justify-between">
                          <span>
                            {feature.name}: {typeof feature.value === 'boolean' 
                              ? (feature.value ? 'Yes' : 'No') 
                              : feature.value}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(feature.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No features added yet.</p>
                  )}
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="feature-name">Feature Name</Label>
                      <Input
                        id="feature-name"
                        name="name"
                        value={featureForm.name}
                        onChange={handleFeatureChange}
                        placeholder="e.g., Storage, Users, etc."
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="feature-value">Value</Label>
                      <Input
                        id="feature-value"
                        name="value"
                        value={featureForm.value}
                        onChange={handleFeatureChange}
                        placeholder="e.g., 10GB, Unlimited, etc."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addFeature}
                      className="flex-shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleAddPlan}>
              Add Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Edit Plan Dialog - Similar structure as Add Plan */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the details for this subscription plan.
            </DialogDescription>
          </DialogHeader>
          
          {/* Same form fields as Add Plan dialog */}
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Plan Name</Label>
                <Input
                  id="edit-name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="e.g., Basic, Pro, Enterprise"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="edit-price">Price</Label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">
                    {CURRENCY_SYMBOLS[selectedCurrency]}
                  </span>
                  <Input
                    id="edit-price"
                    name="price"
                    type="number"
                    value={formData.price?.toString()}
                    onChange={handleInputChange}
                    className="pl-7"
                    placeholder="0.00"
                  />
                </div>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-description">Description</Label>
              <Textarea
                id="edit-description"
                name="description"
                value={formData.description}
                onChange={handleInputChange}
                placeholder="Brief description of the plan"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-interval">Billing Interval</Label>
              <Select
                value={formData.interval}
                onValueChange={(value: 'monthly' | 'yearly') => 
                  setFormData(prev => ({ ...prev, interval: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select billing interval" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="edit-isPopular"
                  checked={formData.isPopular}
                  onChange={handleTogglePopular}
                  className="mr-2"
                />
                <Label htmlFor="edit-isPopular" className="cursor-pointer">
                  Mark as popular plan
                </Label>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label>Features</Label>
              <div className="border rounded-md p-4">
                <div className="space-y-4">
                  {formData.features && formData.features.length > 0 ? (
                    <ul className="space-y-2">
                      {formData.features.map((feature) => (
                        <li key={feature.id} className="flex items-center justify-between">
                          <span>
                            {feature.name}: {typeof feature.value === 'boolean' 
                              ? (feature.value ? 'Yes' : 'No') 
                              : feature.value}
                          </span>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeFeature(feature.id)}
                          >
                            <Trash className="h-4 w-4 text-destructive" />
                          </Button>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No features added yet.</p>
                  )}
                  
                  <div className="flex items-end gap-2">
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="edit-feature-name">Feature Name</Label>
                      <Input
                        id="edit-feature-name"
                        name="name"
                        value={featureForm.name}
                        onChange={handleFeatureChange}
                        placeholder="e.g., Storage, Users, etc."
                      />
                    </div>
                    <div className="flex-1 space-y-2">
                      <Label htmlFor="edit-feature-value">Value</Label>
                      <Input
                        id="edit-feature-value"
                        name="value"
                        value={featureForm.value}
                        onChange={handleFeatureChange}
                        placeholder="e.g., 10GB, Unlimited, etc."
                      />
                    </div>
                    <Button
                      type="button"
                      variant="secondary"
                      onClick={addFeature}
                      className="flex-shrink-0"
                    >
                      Add
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowEditPlanDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleEditPlan}>
              Update Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      {/* Delete Plan Confirmation Dialog */}
      <Dialog open={showDeletePlanDialog} onOpenChange={setShowDeletePlanDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete the {selectedPlan?.name} plan? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeletePlanDialog(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDeletePlan}>
              Delete Plan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SubscriptionPlanManagement;
