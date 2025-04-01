
import React, { useState } from 'react';
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/hooks/use-toast";
import { Building, Check, Loader2 } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

const organizationSchema = z.object({
  name: z.string().min(2, {
    message: "Organization name must be at least 2 characters.",
  }),
  slug: z.string().min(2, {
    message: "Slug must be at least 2 characters.",
  }).regex(/^[a-z0-9-]+$/, {
    message: "Slug can only contain lowercase letters, numbers, and hyphens.",
  }),
});

type OrganizationFormValues = z.infer<typeof organizationSchema>;

interface OrganizationFormProps {
  onSuccess: () => void;
  onCancel: () => void;
  organizationData?: {
    id?: string;
    name: string;
    slug: string;
  };
}

const OrganizationForm: React.FC<OrganizationFormProps> = ({ 
  onSuccess, 
  onCancel,
  organizationData
}) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const isEditing = !!organizationData?.id;
  
  const form = useForm<OrganizationFormValues>({
    resolver: zodResolver(organizationSchema),
    defaultValues: {
      name: organizationData?.name || "",
      slug: organizationData?.slug || "",
    },
  });
  
  const onSubmit = async (values: OrganizationFormValues) => {
    setIsSubmitting(true);
    try {
      if (isEditing && organizationData?.id) {
        // Update existing organization
        const { error } = await supabase
          .from('organizations')
          .update({
            name: values.name,
            slug: values.slug,
            updated_at: new Date().toISOString(),
          })
          .eq('id', organizationData.id);
          
        if (error) throw error;
        
        toast({
          title: "Organization Updated",
          description: "The organization has been updated successfully.",
        });
      } else {
        // Create new organization
        const { data: { user } } = await supabase.auth.getUser();
        
        const { data, error } = await supabase
          .from('organizations')
          .insert([{
            name: values.name,
            slug: values.slug,
            owner_id: user?.id,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            is_active: true,
          }])
          .select();
          
        if (error) throw error;
        
        // If successful, also create org membership for the creator
        if (data && data[0] && user) {
          await supabase
            .from('organization_members')
            .insert([{
              user_id: user.id,
              organization_id: data[0].id,
              role: 'admin',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }]);
        }
        
        toast({
          title: "Organization Created",
          description: "The new organization has been created successfully.",
        });
      }
      
      onSuccess();
    } catch (error: any) {
      console.error("Error saving organization:", error);
      
      let errorMessage = "Failed to save organization.";
      if (error.code === '23505') {
        errorMessage = "An organization with this slug already exists.";
      }
      
      toast({
        title: "Error",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Auto-generate slug from name
  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const name = e.target.value;
    form.setValue("name", name);
    
    // Only auto-generate slug if it hasn't been manually edited or is empty
    if (!form.getValues("slug") || form.getValues("slug") === form.formState.defaultValues?.slug) {
      const slug = name.toLowerCase()
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .replace(/\s+/g, '-') // Replace spaces with hyphens
        .replace(/-+/g, '-'); // Replace multiple hyphens with single hyphen
      
      form.setValue("slug", slug);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Name</FormLabel>
              <FormControl>
                <div className="relative">
                  <Building className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                  <Input
                    {...field}
                    className="pl-8"
                    placeholder="Acme Corporation"
                    onChange={handleNameChange}
                  />
                </div>
              </FormControl>
              <FormDescription>
                Enter the name of your organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Organization Slug</FormLabel>
              <FormControl>
                <div className="flex items-baseline">
                  <span className="text-muted-foreground mr-1">app.yourdomain.com/</span>
                  <Input {...field} placeholder="acme" />
                </div>
              </FormControl>
              <FormDescription>
                The URL-friendly identifier for your organization
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEditing ? "Updating..." : "Creating..."}
              </>
            ) : (
              <>
                <Check className="mr-2 h-4 w-4" />
                {isEditing ? "Update Organization" : "Create Organization"}
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default OrganizationForm;
