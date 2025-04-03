
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Plus } from "lucide-react";
import { usePlanManagement } from "./plans/usePlanManagement";
import PlanCard from "./plans/PlanCard";
import { AddPlanDialog, EditPlanDialog, DeletePlanDialog } from "./plans/PlanDialogs";
import { CurrencyCode, SubscriptionPlan } from "./plans/PlanTypes";

const SubscriptionPlanManagement = () => {
  const [showAddPlanDialog, setShowAddPlanDialog] = useState(false);
  const [showEditPlanDialog, setShowEditPlanDialog] = useState(false);
  const [showDeletePlanDialog, setShowDeletePlanDialog] = useState(false);
  
  const {
    plans,
    isLoading,
    selectedCurrency,
    formData,
    featureForm,
    selectedPlan,
    setSelectedPlan,
    setFormData,
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
  } = usePlanManagement();
  
  const confirmDeletePlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowDeletePlanDialog(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Subscription Plans</h2>
        <div className="flex items-center gap-4">
          <div className="flex items-center">
            <Label htmlFor="currency" className="mr-2">Currency:</Label>
            <Select 
              value={selectedCurrency} 
              onValueChange={(value: CurrencyCode) => handleChangeCurrency(value)}
            >
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
            <PlanCard
              key={plan.id}
              plan={plan}
              onEdit={editPlan}
              onDelete={confirmDeletePlan}
              selectedCurrency={selectedCurrency}
            />
          ))}
        </div>
      )}
      
      {/* Add Plan Dialog */}
      <AddPlanDialog
        open={showAddPlanDialog}
        onOpenChange={setShowAddPlanDialog}
        onAdd={addPlan}
        formData={formData}
        featureForm={featureForm}
        onInputChange={handleInputChange}
        onFeatureChange={handleFeatureChange}
        onIntervalChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}
        onTogglePopular={handleTogglePopular}
        onAddFeature={addFeature}
        onRemoveFeature={removeFeature}
        selectedCurrency={selectedCurrency}
      />
      
      {/* Edit Plan Dialog */}
      <EditPlanDialog
        open={showEditPlanDialog}
        onOpenChange={setShowEditPlanDialog}
        onUpdate={updatePlan}
        formData={formData}
        featureForm={featureForm}
        onInputChange={handleInputChange}
        onFeatureChange={handleFeatureChange}
        onIntervalChange={(value) => setFormData(prev => ({ ...prev, interval: value }))}
        onTogglePopular={handleTogglePopular}
        onAddFeature={addFeature}
        onRemoveFeature={removeFeature}
        selectedCurrency={selectedCurrency}
      />
      
      {/* Delete Plan Confirmation Dialog */}
      <DeletePlanDialog
        open={showDeletePlanDialog}
        onOpenChange={setShowDeletePlanDialog}
        selectedPlan={selectedPlan}
        onDelete={deletePlan}
      />
    </div>
  );
};

export default SubscriptionPlanManagement;
