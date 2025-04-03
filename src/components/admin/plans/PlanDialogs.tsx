
import React from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import PlanForm from "./PlanForm";
import { SubscriptionPlan, CurrencyCode } from './PlanTypes';

interface AddPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onAdd: () => Promise<boolean>;
  formData: Partial<SubscriptionPlan>;
  featureForm: { name: string; value: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFeatureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIntervalChange: (value: 'monthly' | 'yearly') => void;
  onTogglePopular: () => void;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  selectedCurrency: CurrencyCode;
}

export const AddPlanDialog: React.FC<AddPlanDialogProps> = ({
  open,
  onOpenChange,
  onAdd,
  formData,
  featureForm,
  onInputChange,
  onFeatureChange,
  onIntervalChange,
  onTogglePopular,
  onAddFeature,
  onRemoveFeature,
  selectedCurrency
}) => {
  const handleAdd = async () => {
    const success = await onAdd();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Add Subscription Plan</DialogTitle>
          <DialogDescription>
            Create a new subscription plan for your customers.
          </DialogDescription>
        </DialogHeader>
        
        <PlanForm
          formData={formData}
          featureForm={featureForm}
          onInputChange={onInputChange}
          onFeatureChange={onFeatureChange}
          onIntervalChange={onIntervalChange}
          onTogglePopular={onTogglePopular}
          onAddFeature={onAddFeature}
          onRemoveFeature={onRemoveFeature}
          selectedCurrency={selectedCurrency}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAdd}>
            Add Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface EditPlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => Promise<boolean>;
  formData: Partial<SubscriptionPlan>;
  featureForm: { name: string; value: string };
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFeatureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIntervalChange: (value: 'monthly' | 'yearly') => void;
  onTogglePopular: () => void;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  selectedCurrency: CurrencyCode;
}

export const EditPlanDialog: React.FC<EditPlanDialogProps> = ({
  open,
  onOpenChange,
  onUpdate,
  formData,
  featureForm,
  onInputChange,
  onFeatureChange,
  onIntervalChange,
  onTogglePopular,
  onAddFeature,
  onRemoveFeature,
  selectedCurrency
}) => {
  const handleUpdate = async () => {
    const success = await onUpdate();
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <DialogTitle>Edit Subscription Plan</DialogTitle>
          <DialogDescription>
            Update the details for this subscription plan.
          </DialogDescription>
        </DialogHeader>
        
        <PlanForm
          formData={formData}
          featureForm={featureForm}
          onInputChange={onInputChange}
          onFeatureChange={onFeatureChange}
          onIntervalChange={onIntervalChange}
          onTogglePopular={onTogglePopular}
          onAddFeature={onAddFeature}
          onRemoveFeature={onRemoveFeature}
          selectedCurrency={selectedCurrency}
        />
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUpdate}>
            Update Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

interface DeletePlanDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPlan: SubscriptionPlan | null;
  onDelete: (plan: SubscriptionPlan) => Promise<boolean>;
}

export const DeletePlanDialog: React.FC<DeletePlanDialogProps> = ({
  open,
  onOpenChange,
  selectedPlan,
  onDelete
}) => {
  const handleDelete = async () => {
    if (!selectedPlan) return;
    
    const success = await onDelete(selectedPlan);
    if (success) {
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Confirm Deletion</DialogTitle>
          <DialogDescription>
            Are you sure you want to delete the {selectedPlan?.name} plan? This action cannot be undone.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={handleDelete}>
            Delete Plan
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
