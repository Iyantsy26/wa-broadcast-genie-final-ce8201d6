
import React from 'react';
import { User } from '@supabase/supabase-js';
import ProfileAvatar from './ProfileAvatar';
import ProfileForm from './ProfileForm';

interface ProfileSettingsFormProps {
  user: User | null;
}

const ProfileSettingsForm = ({ user }: ProfileSettingsFormProps) => {
  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-6">
        <ProfileAvatar user={user} />
        <div className="flex-1 w-full">
          <ProfileForm user={user} />
        </div>
      </div>
    </div>
  );
};

export default ProfileSettingsForm;
