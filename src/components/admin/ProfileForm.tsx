
import React from 'react';
import { Form } from "@/components/ui/form";
import { User } from '@supabase/supabase-js';
import { useProfileForm } from "@/hooks/useProfileForm";
import PersonalInfoForm from "./PersonalInfoForm";
import BioSection from "./BioSection";
import ProfileFormButtons from "./ProfileFormButtons";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { AlertCircle, Key } from "lucide-react";
import SuperAdminDetails from './SuperAdminDetails';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";

interface ProfileFormProps {
  user: User | null;
}

const ProfileForm = ({ user }: ProfileFormProps) => {
  const { 
    form, 
    isSaving, 
    isSuperAdmin, 
    isEditing, 
    setIsEditing, 
    onSubmit, 
    formState
  } = useProfileForm(user);
  
  const isSuperAdminMode = localStorage.getItem('isSuperAdmin') === 'true';
  const customId = form.watch('customId');
  
  // Create a profile object from form values for the details display
  const profileData = {
    name: form.watch('name'),
    email: form.watch('email'),
    phone: form.watch('phone'),
    company: form.watch('company'),
    address: form.watch('address'),
    customId: form.watch('customId'),
    bio: form.watch('bio')
  };
  
  const handleEditClick = () => {
    setIsEditing(true);
  };

  return (
    <Card className="border-2 shadow-lg">
      <CardHeader className="bg-muted/50">
        <CardTitle className="text-xl font-bold">Profile Information</CardTitle>
        <CardDescription>
          Your personal and contact information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6">
        {/* Show SuperAdminDetails when not editing */}
        {(isSuperAdmin || isSuperAdminMode) && !isEditing && (
          <SuperAdminDetails 
            user={user}
            profile={profileData}
            isEditing={isEditing}
            onEdit={handleEditClick}
            formState={formState}
          />
        )}
      
        {/* Show form when editing or not Super Admin */}
        {isEditing || (!isSuperAdmin && !isSuperAdminMode) ? (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              {customId && (
                <Alert className="mb-4 bg-blue-50 border-blue-200">
                  <Key className="h-4 w-4 text-blue-500" />
                  <AlertDescription className="text-blue-700">
                    Your User ID <span className="font-mono font-bold">{customId}</span> is a system-generated master key that cannot be changed.
                  </AlertDescription>
                </Alert>
              )}
              
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
              <ProfileFormButtons isSaving={isSaving} onCancel={() => setIsEditing(false)} />
            </form>
          </Form>
        ) : null}
      </CardContent>
    </Card>
  );
};

export default ProfileForm;
