
import React from 'react';
import { Form } from "@/components/ui/form";
import { User } from '@supabase/supabase-js';
import { useProfileForm } from "@/hooks/useProfileForm";
import PersonalInfoForm from "./PersonalInfoForm";
import BioSection from "./BioSection";
import ProfileFormButtons from "./ProfileFormButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle } from "lucide-react";

interface ProfileFormProps {
  user: User | null;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { form, isSaving, isSuperAdmin, onSubmit } = useProfileForm(user);
  const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        {isSuperAdmin && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              As a Super Admin, you can edit your email address. Note that changing your email will require confirmation via the new email address.
            </AlertDescription>
          </Alert>
        )}
        
        {!user && isSuperAdminMode && (
          <Alert variant="warning" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              You are in Super Admin mode without an authenticated user. Your profile changes will be saved locally.
            </AlertDescription>
          </Alert>
        )}
        
        <PersonalInfoForm form={form} isSuperAdmin={isSuperAdmin} />
        <BioSection form={form} />
        <ProfileFormButtons isSaving={isSaving} />
      </form>
    </Form>
  );
};

export default ProfileForm;
