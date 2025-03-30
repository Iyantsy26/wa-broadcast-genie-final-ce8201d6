
import React from 'react';
import { Button } from '@/components/ui/button';

interface LeadFormActionsProps {
  isSubmitting: boolean;
  onCancel: () => void;
  isEditMode: boolean;
}

const LeadFormActions: React.FC<LeadFormActionsProps> = ({ 
  isSubmitting, 
  onCancel,
  isEditMode
}) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      <Button variant="outline" type="button" onClick={onCancel}>
        Cancel
      </Button>
      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? 'Saving...' : isEditMode ? 'Save Changes' : 'Create Lead'}
      </Button>
    </div>
  );
};

export default LeadFormActions;
