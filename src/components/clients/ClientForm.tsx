
import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { 
  Form, 
  FormControl, 
  FormField, 
  FormItem, 
  FormLabel, 
  FormMessage 
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Client } from '@/types/client';
import { getClientTagOptions, uploadClientPhoto } from '@/services/clientService';
import { toast } from '@/hooks/use-toast';
import { User, X } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface ClientFormProps {
  initialData?: Partial<Client>;
  onSubmit: (data: Partial<Client>) => Promise<void>;
  onCancel: () => void;
}

const ClientForm: React.FC<ClientFormProps> = ({
  initialData = {},
  onSubmit,
  onCancel
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedTags, setSelectedTags] = useState<string[]>(initialData.tags || []);
  const [photoFile, setPhotoFile] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string | null>(initialData.avatarUrl || null);
  
  const tagOptions = getClientTagOptions();
  
  const form = useForm<Partial<Client>>({
    defaultValues: {
      name: initialData.name || '',
      email: initialData.email || '',
      phone: initialData.phone || '',
      company: initialData.company || '',
      industry: initialData.industry || '',
      value: initialData.value || 0,
      clientSince: initialData.clientSince || new Date().toISOString().split('T')[0],
      referredBy: initialData.referredBy || '',
      notes: initialData.notes || '',
      subscriptionPlan: initialData.subscriptionPlan || '',
      renewalDate: initialData.renewalDate || '',
    }
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    // Check file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      toast({
        title: "File too large",
        description: "Please select an image under 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setPhotoFile(file);
    
    // Create preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };
  
  const clearPhotoPreview = () => {
    setPhotoPreview(initialData.avatarUrl || null);
    setPhotoFile(null);
  };
  
  const addTag = (tag: string) => {
    if (!selectedTags.includes(tag)) {
      setSelectedTags([...selectedTags, tag]);
    }
  };
  
  const removeTag = (tag: string) => {
    setSelectedTags(selectedTags.filter(t => t !== tag));
  };
  
  const handleFormSubmit = async (values: Partial<Client>) => {
    try {
      setIsSubmitting(true);
      
      // Add selected tags to the form data
      const formData = {
        ...values,
        tags: selectedTags
      };
      
      await onSubmit(formData);
      
      // Handle photo upload if there's a new photo and we have a client ID
      if (photoFile && initialData.id) {
        try {
          await uploadClientPhoto(initialData.id, photoFile);
          toast({
            title: "Photo uploaded",
            description: "Client photo has been updated"
          });
        } catch (error) {
          console.error("Error uploading photo:", error);
          toast({
            title: "Upload failed",
            description: "Failed to upload client photo",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error("Error submitting form:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-6">
        {/* Profile Photo Upload */}
        <div className="flex flex-col items-center space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4">
          <div className="relative">
            <Avatar className="h-24 w-24">
              <AvatarImage src={photoPreview || undefined} alt="Profile" />
              <AvatarFallback className="text-2xl">
                <User className="h-12 w-12" />
              </AvatarFallback>
            </Avatar>
            {photoPreview && photoPreview !== initialData.avatarUrl && (
              <Button 
                type="button" 
                variant="destructive" 
                size="icon" 
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                onClick={clearPhotoPreview}
              >
                <X className="h-3 w-3" />
              </Button>
            )}
          </div>
          <div>
            <FormLabel className="block mb-2">Profile Photo</FormLabel>
            <Input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="max-w-xs"
            />
            <p className="text-xs text-muted-foreground mt-1">Max size: 2MB</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Name *</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter client name" {...field} required />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="company"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Company</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter company name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="industry"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Industry</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter industry" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="referredBy"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Referred By</FormLabel>
                  <FormControl>
                    <Input placeholder="Who referred this client?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Contact Information */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter email address" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="phone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter phone number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="clientSince"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Join Date</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Client Value</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(parseFloat(e.target.value))} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Tags */}
        <div className="space-y-2">
          <FormLabel>Client Tags</FormLabel>
          <div className="flex flex-wrap gap-2 mb-3">
            {selectedTags.map((tag) => (
              <Badge key={tag} className="flex items-center gap-1 px-3 py-1">
                {tag}
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-4 w-4 p-0 ml-1"
                  onClick={() => removeTag(tag)}
                >
                  <X className="h-3 w-3" />
                </Button>
              </Badge>
            ))}
          </div>
          <Select onValueChange={addTag}>
            <SelectTrigger className="w-full max-w-xs">
              <SelectValue placeholder="Select a tag" />
            </SelectTrigger>
            <SelectContent>
              {tagOptions.map((tag) => (
                <SelectItem 
                  key={tag.value} 
                  value={tag.value}
                  disabled={selectedTags.includes(tag.value)}
                >
                  {tag.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Subscription Details */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="subscriptionPlan"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Subscription Plan</FormLabel>
                <FormControl>
                  <Input placeholder="Enter subscription plan" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <FormField
            control={form.control}
            name="renewalDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Renewal Date</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Notes */}
        <FormField
          control={form.control}
          name="notes"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Notes</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Enter client notes" 
                  rows={4}
                  className="resize-none"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Form Actions */}
        <div className="flex justify-end space-x-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Client'}
          </Button>
        </div>
      </form>
    </Form>
  );
};

export default ClientForm;
