import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { hasRole, signOutUser } from "@/services/auth/authService";
import {
  Globe,
  Palette,
  Settings,
  LogOut,
  AlertTriangle,
  Upload,
  Check,
  Copy,
  RefreshCw
} from "lucide-react";
import { updateOrganizationBranding } from "@/services/admin/organizationMutations";

const WhiteLabel = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isWhiteLabel, setIsWhiteLabel] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // White label settings
  const [primaryColor, setPrimaryColor] = useState('#000000');
  const [secondaryColor, setSecondaryColor] = useState('#ffffff');
  const [accentColor, setAccentColor] = useState('#3b82f6');
  const [customDomain, setCustomDomain] = useState('');
  const [logoUrl, setLogoUrl] = useState('');
  const [faviconUrl, setFaviconUrl] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  
  useEffect(() => {
    const checkAccess = async () => {
      const hasAccess = await hasRole('white_label');
      setIsWhiteLabel(hasAccess);
      setIsLoading(false);
      
      if (!hasAccess) {
        toast({
          title: "Access denied",
          description: "You don't have white label access",
          variant: "destructive",
        });
      }
    };
    
    checkAccess();
  }, [toast]);
  
  const handleSignOut = async () => {
    const success = await signOutUser();
    if (success) {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully",
      });
      navigate('/login?dashboard=white_label');
    } else {
      toast({
        title: "Error",
        description: "Failed to sign out",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveBranding = async () => {
    setIsSaving(true);
    try {
      // In a real implementation, you would get the organization ID
      const organizationId = "your-organization-id";
      
      const brandingData = {
        primary_color: primaryColor,
        secondary_color: secondaryColor,
        accent_color: accentColor,
        custom_domain: customDomain,
        logo_url: logoUrl,
        favicon_url: faviconUrl
      };
      
      // This is just for demo, in a real implementation you would use the actual organization ID
      // const result = await updateOrganizationBranding(organizationId, brandingData);
      
      // Simulate successful API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      toast({
        title: "Branding updated",
        description: "Your white label settings have been saved.",
      });
    } catch (error) {
      console.error('Error saving branding:', error);
      toast({
        title: "Error",
        description: "Failed to save branding settings",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        <p className="mt-4">Loading white label dashboard...</p>
      </div>
    );
  }
  
  if (!isWhiteLabel) {
    return (
      <div className="flex flex-col items-center justify-center p-8">
        <AlertTriangle className="text-yellow-500 h-12 w-12 mb-4" />
        <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
        <p className="mb-4">You don't have permission to access the white label dashboard.</p>
        <div className="flex gap-4">
          <Button onClick={() => navigate('/')}>Go to Home</Button>
          <Button variant="outline" onClick={handleSignOut}>Sign Out</Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">White Label Dashboard</h1>
          <p className="text-muted-foreground">
            Customize your white-labeled portal
          </p>
        </div>
        <Button variant="outline" onClick={handleSignOut}>
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
      
      <Tabs defaultValue="branding" className="space-y-4">
        <TabsList>
          <TabsTrigger value="branding">Branding</TabsTrigger>
          <TabsTrigger value="domain">Domain</TabsTrigger>
          <TabsTrigger value="preview">Preview</TabsTrigger>
        </TabsList>
        
        <TabsContent value="branding" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Palette className="mr-2 h-5 w-5" />
                Brand Colors
              </CardTitle>
              <CardDescription>
                Customize the color scheme of your platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="primaryColor">Primary Color</Label>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: primaryColor }}
                  />
                  <Input
                    id="primaryColor"
                    type="text"
                    value={primaryColor}
                    onChange={(e) => setPrimaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="secondaryColor">Secondary Color</Label>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: secondaryColor }}
                  />
                  <Input
                    id="secondaryColor"
                    type="text"
                    value={secondaryColor}
                    onChange={(e) => setSecondaryColor(e.target.value)}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="accentColor">Accent Color</Label>
                <div className="flex space-x-2">
                  <div 
                    className="w-8 h-8 border rounded"
                    style={{ backgroundColor: accentColor }}
                  />
                  <Input
                    id="accentColor"
                    type="text"
                    value={accentColor}
                    onChange={(e) => setAccentColor(e.target.value)}
                  />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Upload className="mr-2 h-5 w-5" />
                Logo & Favicon
              </CardTitle>
              <CardDescription>
                Upload your company logo and favicon
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="logoUrl">Logo URL</Label>
                <Input
                  id="logoUrl"
                  type="text"
                  placeholder="https://example.com/logo.png"
                  value={logoUrl}
                  onChange={(e) => setLogoUrl(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="faviconUrl">Favicon URL</Label>
                <Input
                  id="faviconUrl"
                  type="text"
                  placeholder="https://example.com/favicon.ico"
                  value={faviconUrl}
                  onChange={(e) => setFaviconUrl(e.target.value)}
                />
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveBranding} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Branding
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="domain" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Globe className="mr-2 h-5 w-5" />
                Custom Domain
              </CardTitle>
              <CardDescription>
                Set up your own domain for the platform
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="customDomain">Custom Domain</Label>
                <Input
                  id="customDomain"
                  type="text"
                  placeholder="app.yourcompany.com"
                  value={customDomain}
                  onChange={(e) => setCustomDomain(e.target.value)}
                />
                <p className="text-sm text-muted-foreground">
                  Enter the domain you want to use for your white-labeled application
                </p>
              </div>
              
              <div className="rounded-md bg-muted p-4 mt-4">
                <h3 className="font-medium mb-2">DNS Configuration</h3>
                <p className="text-sm text-muted-foreground mb-2">
                  To connect your custom domain, add the following DNS records:
                </p>
                <div className="bg-background rounded-md p-3 mb-2 flex justify-between items-center">
                  <code className="text-xs">CNAME app.yourcompany.com -&gt; proxy.example.com</code>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
                <div className="bg-background rounded-md p-3 flex justify-between items-center">
                  <code className="text-xs">TXT _verify.app.yourcompany.com -&gt; verification-code-here</code>
                  <Button variant="ghost" size="sm">
                    <Copy className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <div className="flex justify-end">
            <Button onClick={handleSaveBranding} disabled={isSaving}>
              {isSaving ? (
                <>
                  <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Check className="mr-2 h-4 w-4" />
                  Save Domain Settings
                </>
              )}
            </Button>
          </div>
        </TabsContent>
        
        <TabsContent value="preview" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Preview Your Branded Portal</CardTitle>
              <CardDescription>
                See how your portal looks with the current branding settings
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="border rounded-md overflow-hidden">
                <div className="bg-gray-100 p-2 border-b flex items-center">
                  <div className="w-3 h-3 rounded-full bg-red-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500 mr-2"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500 mr-2"></div>
                  <span className="text-xs text-gray-600 mx-auto">{customDomain || 'app.yourcompany.com'}</span>
                </div>
                <div className="p-4 h-64 flex flex-col items-center justify-center"
                  style={{
                    backgroundColor: secondaryColor,
                    color: primaryColor
                  }}
                >
                  {logoUrl ? (
                    <img src={logoUrl} alt="Company Logo" className="h-16 mb-4" />
                  ) : (
                    <div className="w-32 h-16 bg-gray-200 mb-4 flex items-center justify-center text-gray-400">
                      Your Logo
                    </div>
                  )}
                  <div 
                    className="rounded-md px-4 py-2 font-medium"
                    style={{ backgroundColor: accentColor, color: '#ffffff' }}
                  >
                    Sample Button
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default WhiteLabel;
