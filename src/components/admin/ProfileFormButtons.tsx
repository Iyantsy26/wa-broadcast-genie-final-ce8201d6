
import React from 'react';
import { Button } from "@/components/ui/button";

interface ProfileFormButtonsProps {
  isSaving: boolean;
}

const ProfileFormButtons: React.FC<ProfileFormButtonsProps> = ({ isSaving }) => {
  return (
    <Button type="submit" className="w-full sm:w-auto" disabled={isSaving}>
      {isSaving ? "Saving..." : "Save Changes"}
    </Button>
  );
};

export default ProfileFormButtons;
