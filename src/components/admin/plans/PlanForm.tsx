
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { Trash } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CurrencyCode, CURRENCY_SYMBOLS, PlanFeature, SubscriptionPlan } from "./PlanTypes";

interface FeatureFormState {
  name: string;
  value: string;
}

interface PlanFormProps {
  formData: Partial<SubscriptionPlan>;
  featureForm: FeatureFormState;
  onInputChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onFeatureChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIntervalChange: (value: 'monthly' | 'yearly') => void;
  onTogglePopular: () => void;
  onAddFeature: () => void;
  onRemoveFeature: (id: string) => void;
  selectedCurrency: CurrencyCode;
}

const PlanForm: React.FC<PlanFormProps> = ({
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
  return (
    <div className="grid gap-4 py-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Plan Name</Label>
          <Input
            id="name"
            name="name"
            value={formData.name || ''}
            onChange={onInputChange}
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
              value={formData.price?.toString() || ''}
              onChange={onInputChange}
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
          value={formData.description || ''}
          onChange={onInputChange}
          placeholder="Brief description of the plan"
        />
      </div>
      
      <div className="space-y-2">
        <Label htmlFor="interval">Billing Interval</Label>
        <Select
          value={formData.interval || 'monthly'}
          onValueChange={onIntervalChange}
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
            checked={formData.isPopular || false}
            onChange={onTogglePopular}
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
                {formData.features.map((feature: PlanFeature) => (
                  <li key={feature.id} className="flex items-center justify-between">
                    <span>
                      {feature.name}: {typeof feature.value === 'boolean' 
                        ? (feature.value ? 'Yes' : 'No') 
                        : feature.value}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => onRemoveFeature(feature.id)}
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
                  onChange={onFeatureChange}
                  placeholder="e.g., Storage, Users, etc."
                />
              </div>
              <div className="flex-1 space-y-2">
                <Label htmlFor="feature-value">Value</Label>
                <Input
                  id="feature-value"
                  name="value"
                  value={featureForm.value}
                  onChange={onFeatureChange}
                  placeholder="e.g., 10GB, Unlimited, etc."
                />
              </div>
              <Button
                type="button"
                variant="secondary"
                onClick={onAddFeature}
                className="flex-shrink-0"
              >
                Add
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PlanForm;
