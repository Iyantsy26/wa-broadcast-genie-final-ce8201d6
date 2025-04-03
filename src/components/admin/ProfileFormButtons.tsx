
import React from 'react';
import { Button } from "@/components/ui/button";
import { Save, X } from "lucide-react";

interface ProfileFormButtonsProps {
  isSaving: boolean;
  onCancel?: () => void;
}

const ProfileFormButtons = ({ isSaving, onCancel }: ProfileFormButtonsProps) => {
  return (
    <div className="flex justify-end gap-2 pt-2">
      {onCancel && (
        <Button 
          type="button" 
          variant="outline" 
          onClick={onCancel}
          disabled={isSaving}
        >
          <X className="h-4 w-4 mr-2" />
          Cancel
        </Button>
      )}
      <Button type="submit" disabled={isSaving}>
        <Save className="h-4 w-4 mr-2" />
        {isSaving ? "Saving..." : "Save Changes"}
      </Button>
    </div>
  );
};

export default ProfileFormButtons;
