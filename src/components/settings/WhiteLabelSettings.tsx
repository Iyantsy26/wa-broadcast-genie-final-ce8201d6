
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from '@/services/devices/deviceTypes';
import NotAvailableView from './NotAvailableView';
import { CircleDot, Upload, Globe, Palette } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface WhiteLabelSettingsProps {
  currentRole: UserRole['role'] | null;
}

const WhiteLabelSettings: React.FC<WhiteLabelSettingsProps> = ({ currentRole }) => {
  // This component should only be visible to white label and super admin
  if (currentRole === 'user' || currentRole === 'admin') {
    return (
      <NotAvailableView
        title="White Label Settings Not Available"
        message="You need white label or super admin privileges to access these settings. Please contact your system administrator for access."
        requiredRole="white_label"
      />
    );
  }

  const [activeTab, setActiveTab] = React.useState('branding');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">White Label Settings</h1>
        <p className="text-muted-foreground">
          Configure white label branding and customization options
        </p>
      </div>
      
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="branding" className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            <span>Branding</span>
          </TabsTrigger>
          <TabsTrigger value="domain" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            <span>Domain</span>
          </TabsTrigger>
          <TabsTrigger value="appearance" className="flex items-center gap-2">
            <CircleDot className="h-4 w-4" />
            <span>Appearance</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Brand Identity</CardTitle>
              <CardDescription>
                Configure your brand logo, favicon and company details
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="company-name">Company Name</Label>
                    <Input id="company-name" placeholder="Enter company name" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="company-tagline">Company Tagline</Label>
                    <Input id="company-tagline" placeholder="Enter tagline" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="support-email">Support Email</Label>
                    <Input id="support-email" type="email" placeholder="support@yourcompany.com" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Logo</Label>
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                      <div className="w-full h-32 bg-muted/30 rounded flex items-center justify-center mb-4">
                        <p className="text-muted-foreground">Logo Preview</p>
                      </div>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Logo</span>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 200x60px, PNG or SVG
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Favicon</Label>
                    <div className="border rounded-md p-4 flex flex-col items-center justify-center">
                      <div className="w-16 h-16 bg-muted/30 rounded flex items-center justify-center mb-4">
                        <p className="text-muted-foreground text-xs">Icon</p>
                      </div>
                      <Button variant="outline" className="w-full flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        <span>Upload Favicon</span>
                      </Button>
                      <p className="text-xs text-muted-foreground mt-2">
                        Recommended size: 32x32px, ICO or PNG
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button>Save Brand Settings</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="domain" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Custom Domain</CardTitle>
              <CardDescription>
                Configure a custom domain for your white label platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="custom-domain">Custom Domain</Label>
                  <Input id="custom-domain" placeholder="app.yourcompany.com" />
                  <p className="text-sm text-muted-foreground">
                    Enter the domain you want to use for your white label platform
                  </p>
                </div>
                
                <div className="bg-muted/30 rounded-md p-4">
                  <h4 className="font-medium mb-2">Domain Setup Instructions</h4>
                  <ol className="space-y-2 text-sm pl-5 list-decimal">
                    <li>Create a CNAME record at your domain registrar</li>
                    <li>Point the CNAME record to <code className="bg-muted px-1 py-0.5 rounded text-xs">whitelabel.ourplatform.com</code></li>
                    <li>Wait for DNS propagation (usually 24-48 hours)</li>
                    <li>Click the Verify Domain button below</li>
                  </ol>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline" className="mr-2">Verify Domain</Button>
                  <Button>Save Domain Settings</Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>SSL Certificate</CardTitle>
              <CardDescription>
                SSL Certificate for your custom domain
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-4 bg-green-50 text-green-700 rounded-md">
                  <div className="flex items-center gap-2">
                    <CircleDot className="h-4 w-4" />
                    <p className="font-medium">SSL Certificate is active</p>
                  </div>
                  <p>Expires in 85 days</p>
                </div>
                
                <div className="flex justify-end">
                  <Button variant="outline">Renew SSL Certificate</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="appearance" className="space-y-4 pt-4">
          <Card>
            <CardHeader>
              <CardTitle>Color & Typography</CardTitle>
              <CardDescription>
                Customize the look and feel of your white label platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h3 className="font-medium">Brand Colors</h3>
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="primary-color">Primary Color</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-primary"></div>
                          <Input id="primary-color" defaultValue="#8B5CF6" className="w-24" />
                        </div>
                      </div>
                      <div className="h-8 bg-primary rounded-md"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="secondary-color">Secondary Color</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-secondary"></div>
                          <Input id="secondary-color" defaultValue="#D946EF" className="w-24" />
                        </div>
                      </div>
                      <div className="h-8 bg-secondary rounded-md"></div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="accent-color">Accent Color</Label>
                        <div className="flex items-center gap-2">
                          <div className="w-5 h-5 rounded-full bg-blue-500"></div>
                          <Input id="accent-color" defaultValue="#3B82F6" className="w-24" />
                        </div>
                      </div>
                      <div className="h-8 bg-blue-500 rounded-md"></div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h3 className="font-medium">Platform Customization</h3>
                  <Separator className="my-2" />
                  
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="platform-name">Platform Name</Label>
                        <p className="text-sm text-muted-foreground">
                          Replace the default platform name with your own
                        </p>
                      </div>
                      <Input id="platform-name" placeholder="Your Platform Name" className="w-48" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="hide-powered-by">Hide "Powered By"</Label>
                        <p className="text-sm text-muted-foreground">
                          Hide the powered by text in the footer
                        </p>
                      </div>
                      <Switch id="hide-powered-by" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="custom-css">Custom CSS</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable custom CSS styles
                        </p>
                      </div>
                      <Switch id="custom-css" />
                    </div>
                    
                    <div className="flex items-center justify-between">
                      <div className="space-y-0.5">
                        <Label htmlFor="custom-login">Custom Login Page</Label>
                        <p className="text-sm text-muted-foreground">
                          Enable custom login page
                        </p>
                      </div>
                      <Switch id="custom-login" />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline" className="mr-2">Preview</Button>
                <Button>Save Appearance</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhiteLabelSettings;
