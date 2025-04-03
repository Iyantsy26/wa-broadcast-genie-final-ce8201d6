
import React from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CheckCircle, Edit, Trash } from "lucide-react";
import { CurrencyCode, CURRENCY_SYMBOLS, SubscriptionPlan } from "./PlanTypes";

interface PlanCardProps {
  plan: SubscriptionPlan;
  onEdit: (plan: SubscriptionPlan) => void;
  onDelete: (plan: SubscriptionPlan) => void;
  selectedCurrency: CurrencyCode;
}

const PlanCard: React.FC<PlanCardProps> = ({ 
  plan, 
  onEdit, 
  onDelete, 
  selectedCurrency 
}) => {
  return (
    <Card className={plan.isPopular ? 'border-primary' : ''}>
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
        <Button variant="outline" onClick={() => onEdit(plan)}>
          <Edit className="h-4 w-4 mr-2" />
          Edit
        </Button>
        <Button variant="destructive" onClick={() => onDelete(plan)}>
          <Trash className="h-4 w-4 mr-2" />
          Delete
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
