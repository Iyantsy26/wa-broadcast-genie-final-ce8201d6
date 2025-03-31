
import React, { useState } from 'react';
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
}

// Sample data
const initialPlans: SubscriptionPlan[] = [
  {
    id: '1',
    name: 'Basic',
    description: 'For small teams and startups',
    price: 29,
    interval: 'monthly',
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
    price: 79,
    interval: 'monthly',
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
    price: 199,
    interval: 'monthly',
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

const SubscriptionPlanManagement = () => {
  const { toast } = useToast();
  const [plans, setPlans] = useState<SubscriptionPlan[]>(initialPlans);
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  
  // Form state
  const [formData, setFormData] = useState<Partial<SubscriptionPlan>>({
    name: '',
    description: '',
    price: 0,
    interval: 'monthly',
    features: [],
    isPopular: false,
  });
  
  // Features form state
  const [featureForm, setFeatureForm] = useState({
    name: '',
    value: '',
  });
  
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
  
  const handleAddPlan = () => {
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
    };
    
    setPlans([...plans, newPlan]);
    resetForm();
    setShowAddPlanDialog(false);
    
    toast({
      title: "Plan added",
      description: `${newPlan.name} plan has been added successfully.`,
    });
  };
  
  const handleEditPlan = () => {
    if (!selectedPlan || !formData.name || formData.price === undefined) {
      toast({
        title: "Missing information",
        description: "Please provide a name and price for the plan",
        variant: "destructive",
      });
      return;
    }
    
    const updatedPlans = plans.map(plan => {
      if (plan.id === selectedPlan.id) {
        return {
          ...plan,
          name: formData.name,
          description: formData.description || plan.description,
          price: formData.price,
          interval: formData.interval || plan.interval,
          features: formData.features || plan.features,
          isPopular: formData.isPopular,
        };
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
  };
  
  const handleDeletePlan = () => {
    if (!selectedPlan) return;
    
    const updatedPlans = plans.filter(plan => plan.id !== selectedPlan.id);
    setPlans(updatedPlans);
    setShowDeletePlanDialog(false);
    
    toast({
      title: "Plan deleted",
      description: `${selectedPlan.name} plan has been deleted successfully.`,
    });
  };
  
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      price: 0,
      interval: 'monthly',
      features: [],
      isPopular: false,
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
    });
    setShowEditPlanDialog(true);
  };
  
  const confirmDeletePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeletePlanDialog(true);
  };
  
  const formatPrice = (price: number, interval: 'monthly' | 'yearly') => {
    return `$${price}/${interval === 'monthly' ? 'mo' : 'yr'}`;
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <Button onClick={() => {
          resetForm();
          setShowAddPlanDialog(true);
        }}>
          <Plus className="h-4 w-4 mr-2" />
          Add Plan
        </Button>
      </div>
      
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
                  ${plan.price}
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
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
      
      {/* Edit Plan Dialog - Same structure as Add Plan Dialog */}
      <Dialog open={showEditPlanDialog} onOpenChange={setShowEditPlanDialog}>
        <DialogContent className="sm:max-w-[550px]">
          <DialogHeader>
            <DialogTitle>Edit Subscription Plan</DialogTitle>
            <DialogDescription>
              Update the details for this subscription plan.
            </DialogDescription>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            {/* Same form fields as Add Plan dialog */}
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
                  <span className="absolute left-3 top-1/2 -translate-y-1/2">$</span>
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
