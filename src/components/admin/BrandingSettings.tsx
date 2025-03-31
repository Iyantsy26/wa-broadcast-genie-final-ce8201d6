
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
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Globe, Upload, Image, Palette, Type } from "lucide-react";

const MAX_FILE_SIZE = 2 * 1024 * 1024; // 2MB

const brandingFormSchema = z.object({
  siteName: z.string().min(2, { message: "Site name must be at least 2 characters" }),
  primaryColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Must be a valid hex color" }),
  secondaryColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Must be a valid hex color" }),
  accentColor: z.string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: "Must be a valid hex color" }),
  customDomain: z.string().optional(),
});

type BrandingFormValues = z.infer<typeof brandingFormSchema>;

const BrandingSettings = () => {
  const { toast } = useToast();
  const [logoPreview, setLogoPreview] = useState<string | null>(null);
  const [faviconPreview, setFaviconPreview] = useState<string | null>(null);
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [faviconFile, setFaviconFile] = useState<File | null>(null);
  
  const form = useForm<BrandingFormValues>({
    resolver: zodResolver(brandingFormSchema),
    defaultValues: {
      siteName: "My WhatsApp Dashboard",
      primaryColor: "#1a1f2c",
      secondaryColor: "#ffffff",
      accentColor: "#8b5cf6",
      customDomain: "",
    },
  });
  
  const onSubmit = async (data: BrandingFormValues) => {
    try {
      // Here we would typically update the branding in the database
      console.log("Form data:", data);
      console.log("Logo file:", logoFile);
      console.log("Favicon file:", faviconFile);
      
      toast({
        title: "Branding updated",
        description: "Your branding settings have been updated successfully.",
      });
    } catch (error) {
      console.error("Error updating branding:", error);
      toast({
        title: "Error",
        description: "Failed to update branding settings. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleLogoUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Logo image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setLogoFile(file);
    const objectUrl = URL.createObjectURL(file);
    setLogoPreview(objectUrl);
    
    toast({
      title: "Logo uploaded",
      description: "Your logo has been uploaded successfully.",
    });
  };
  
  const handleFaviconUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (!event.target.files || event.target.files.length === 0) {
      return;
    }
    
    const file = event.target.files[0];
    
    if (file.size > MAX_FILE_SIZE) {
      toast({
        title: "File too large",
        description: "Favicon image must be less than 2MB",
        variant: "destructive",
      });
      return;
    }
    
    setFaviconFile(file);
    const objectUrl = URL.createObjectURL(file);
    setFaviconPreview(objectUrl);
    
    toast({
      title: "Favicon uploaded",
      description: "Your favicon has been uploaded successfully.",
    });
  };

  return (
    <div className="space-y-6">
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="general">
            <Type className="h-4 w-4 mr-2" />
            General
          </TabsTrigger>
          <TabsTrigger value="colors">
            <Palette className="h-4 w-4 mr-2" />
            Colors
          </TabsTrigger>
          <TabsTrigger value="assets">
            <Image className="h-4 w-4 mr-2" />
            Assets
          </TabsTrigger>
        </TabsList>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <TabsContent value="general" className="space-y-6 pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="siteName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Site Name</FormLabel>
                      <FormControl>
                        <Input placeholder="My WhatsApp Dashboard" {...field} />
                      </FormControl>
                      <FormDescription>
                        This is the name that will appear in the browser tab and various places throughout the app.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="customDomain"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Custom Domain</FormLabel>
                      <FormControl>
                        <div className="flex items-center">
                          <Globe className="h-4 w-4 mr-2 text-muted-foreground" />
                          <Input placeholder="app.yourdomain.com" {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Set up a custom domain for your white label dashboard.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </TabsContent>
            
            <TabsContent value="colors" className="space-y-6 pt-4">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="primaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Primary Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                          <Input {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        The main color used for headers, buttons, etc.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="secondaryColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Secondary Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                          <Input {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for backgrounds and secondary elements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accentColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Accent Color</FormLabel>
                      <FormControl>
                        <div className="flex items-center gap-3">
                          <div 
                            className="w-10 h-10 rounded-md border"
                            style={{ backgroundColor: field.value }}
                          />
                          <Input {...field} />
                        </div>
                      </FormControl>
                      <FormDescription>
                        Used for highlights and call-to-action elements.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <div className="mt-6 p-4 border rounded-md">
                  <h3 className="text-sm font-medium mb-2">Preview</h3>
                  <div 
                    className="p-4 rounded-md flex flex-col items-center justify-center"
                    style={{ backgroundColor: form.watch('secondaryColor') }}
                  >
                    <div 
                      className="w-full h-12 rounded-md mb-4"
                      style={{ backgroundColor: form.watch('primaryColor') }}
                    />
                    <div className="flex gap-2">
                      <div 
                        className="px-4 py-2 rounded-md"
                        style={{ backgroundColor: form.watch('primaryColor'), color: form.watch('secondaryColor') }}
                      >
                        Primary Button
                      </div>
                      <div 
                        className="px-4 py-2 rounded-md"
                        style={{ backgroundColor: form.watch('accentColor'), color: form.watch('secondaryColor') }}
                      >
                        Accent Button
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <TabsContent value="assets" className="space-y-6 pt-4">
              <div className="space-y-6">
                <div className="space-y-2">
                  <Label>Logo</Label>
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-40 h-24 rounded-md border flex items-center justify-center"
                      style={{ backgroundColor: form.watch('secondaryColor') }}
                    >
                      {logoPreview ? (
                        <img 
                          src={logoPreview} 
                          alt="Logo Preview" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      ) : (
                        <Upload className="h-8 w-8 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('logo-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Logo
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 300x100px. Max size: 2MB
                      </p>
                      <input
                        id="logo-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleLogoUpload}
                      />
                    </div>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label>Favicon</Label>
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-md border flex items-center justify-center">
                      {faviconPreview ? (
                        <img 
                          src={faviconPreview} 
                          alt="Favicon Preview" 
                          className="max-w-full max-h-full object-contain" 
                        />
                      ) : (
                        <Upload className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                    <div className="space-y-2">
                      <Button 
                        type="button" 
                        variant="outline" 
                        onClick={() => document.getElementById('favicon-upload')?.click()}
                      >
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Favicon
                      </Button>
                      <p className="text-xs text-muted-foreground">
                        Recommended size: 32x32px or 64x64px. Max size: 2MB
                      </p>
                      <input
                        id="favicon-upload"
                        type="file"
                        accept="image/*"
                        className="hidden"
                        onChange={handleFaviconUpload}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </TabsContent>
            
            <Button type="submit">Save Branding Settings</Button>
          </form>
        </Form>
      </Tabs>
    </div>
  );
};

export default BrandingSettings;
