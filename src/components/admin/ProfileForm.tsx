
import React from 'react';
import { Form } from "@/components/ui/form";
import { User } from '@supabase/supabase-js';
import { useProfileForm } from "@/hooks/useProfileForm";
import PersonalInfoForm from "./PersonalInfoForm";
import BioSection from "./BioSection";
import ProfileFormButtons from "./ProfileFormButtons";

interface ProfileFormProps {
  user: User | null;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { form, isSaving, isSuperAdmin, onSubmit } = useProfileForm(user);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <PersonalInfoForm form={form} isSuperAdmin={isSuperAdmin} />
        <BioSection form={form} />
        <ProfileFormButtons isSaving={isSaving} />
      </form>
    </Form>
  );
};

export default ProfileForm;
