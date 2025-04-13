
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { UserRole } from '@/services/devices/deviceTypes';
import NotAvailableView from './NotAvailableView';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { 
  RotateCw, 
  Save, 
  Mail, 
  MessageSquare, 
  CreditCard 
} from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";

interface SystemSettingsProps {
  currentRole: UserRole['role'] | null;
}

const SystemSettings: React.FC<SystemSettingsProps> = ({ currentRole }) => {
  // This component should only be visible to super admin
  if (currentRole !== 'super_admin') {
    return (
      <NotAvailableView
        title="System Settings Not Available"
        message="You need super admin privileges to access system settings. Please contact your system administrator for access."
        requiredRole="super_admin"
      />
    );
  }

  const [activeTab, setActiveTab] = React.useState('email');
  const [isTestingSetting, setIsTestingSetting] = React.useState('');
  const [isSaving, setIsSaving] = React.useState(false);

  const handleTestConnection = (type: string) => {
    setIsTestingSetting(type);
    // Simulate API test
    setTimeout(() => {
      setIsTestingSetting('');
      console.log(`Tested ${type} connection`);
    }, 1000);
  };

  const handleSaveSettings = (type: string) => {
    setIsSaving(true);
    // Simulate saving
    setTimeout(() => {
      setIsSaving(false);
      console.log(`Saved ${type} settings`);
    }, 1000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">System Settings</h1>
        <p className="text-muted-foreground">
          Configure system-wide settings and gateway services
        </p>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>System Gateway Settings</CardTitle>
          <CardDescription>
            Configure various gateway services for your application
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="email" className="flex items-center gap-2">
                <Mail className="h-4 w-4" />
                <span>Email</span>
              </TabsTrigger>
              <TabsTrigger value="message" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>SMS</span>
              </TabsTrigger>
              <TabsTrigger value="whatsapp" className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                <span>WhatsApp</span>
              </TabsTrigger>
              <TabsTrigger value="payment" className="flex items-center gap-2">
                <CreditCard className="h-4 w-4" />
                <span>Payment</span>
              </TabsTrigger>
            </TabsList>
            
            {/* Email Gateway Settings */}
            <TabsContent value="email" className="space-y-4">
              <div className="grid gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="email-enabled">Enabled</Label>
                  <Switch id="email-enabled" defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-provider">Provider</Label>
                  <Select defaultValue="sendgrid">
                    <SelectTrigger id="email-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sendgrid">SendGrid</SelectItem>
                      <SelectItem value="mailchimp">Mailchimp</SelectItem>
                      <SelectItem value="mailgun">Mailgun</SelectItem>
                      <SelectItem value="ses">Amazon SES</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-api-key">API Key</Label>
                  <Input id="email-api-key" type="password" placeholder="Enter API key" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-from">From Email</Label>
                  <Input id="email-from" type="email" placeholder="noreply@example.com" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-name">From Name</Label>
                  <Input id="email-name" placeholder="System Notification" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('email')}
                    disabled={isTestingSetting === 'email'}
                  >
                    {isTestingSetting === 'email' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('email')}
                    disabled={isSaving}
                  >
                    {isSaving ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* SMS Gateway Settings */}
            <TabsContent value="message" className="space-y-4">
              <div className="grid gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="sms-enabled">Enabled</Label>
                  <Switch id="sms-enabled" defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-provider">Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="sms-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="nexmo">Nexmo</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-account-sid">Account SID</Label>
                  <Input id="sms-account-sid" type="password" placeholder="Enter Account SID" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-auth-token">Auth Token</Label>
                  <Input id="sms-auth-token" type="password" placeholder="Enter Auth Token" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-from-number">From Number</Label>
                  <Input id="sms-from-number" placeholder="+1234567890" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('sms')}
                    disabled={isTestingSetting === 'sms'}
                  >
                    {isTestingSetting === 'sms' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('sms')}
                    disabled={isSaving}
                  >
                    {isSaving ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* WhatsApp Gateway Settings */}
            <TabsContent value="whatsapp" className="space-y-4">
              <div className="grid gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="whatsapp-enabled">Enabled</Label>
                  <Switch id="whatsapp-enabled" defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-provider">Provider</Label>
                  <Select defaultValue="twilio">
                    <SelectTrigger id="whatsapp-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="infobip">Infobip</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                {/* Similar fields as SMS settings */}
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-account-sid">Account SID</Label>
                  <Input id="whatsapp-account-sid" type="password" placeholder="Enter Account SID" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-auth-token">Auth Token</Label>
                  <Input id="whatsapp-auth-token" type="password" placeholder="Enter Auth Token" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-from-number">WhatsApp Business Number</Label>
                  <Input id="whatsapp-from-number" placeholder="+1234567890" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('whatsapp')}
                    disabled={isTestingSetting === 'whatsapp'}
                  >
                    {isTestingSetting === 'whatsapp' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('whatsapp')}
                    disabled={isSaving}
                  >
                    {isSaving ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
            
            {/* Payment Gateway Settings */}
            <TabsContent value="payment" className="space-y-4">
              <div className="grid gap-4 pt-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="payment-enabled">Enabled</Label>
                  <Switch id="payment-enabled" defaultChecked />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-provider">Provider</Label>
                  <Select defaultValue="stripe">
                    <SelectTrigger id="payment-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="stripe">Stripe</SelectItem>
                      <SelectItem value="paypal">PayPal</SelectItem>
                      <SelectItem value="razorpay">Razorpay</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-publishable-key">Publishable Key</Label>
                  <Input id="payment-publishable-key" placeholder="Enter Publishable Key" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-secret-key">Secret Key</Label>
                  <Input id="payment-secret-key" type="password" placeholder="Enter Secret Key" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-webhook-secret">Webhook Secret</Label>
                  <Input id="payment-webhook-secret" type="password" placeholder="Enter Webhook Secret" />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('payment')}
                    disabled={isTestingSetting === 'payment'}
                  >
                    {isTestingSetting === 'payment' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RotateCw className="mr-2 h-4 w-4" />}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('payment')}
                    disabled={isSaving}
                  >
                    {isSaving ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <Save className="mr-2 h-4 w-4" />}
                    Save Settings
                  </Button>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Global Limits & Restrictions</CardTitle>
          <CardDescription>
            Configure system-wide limitations and restrictions
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Resource Limits</h3>
            <Separator />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="max-file-size">Maximum File Size (MB)</Label>
                <Input id="max-file-size" type="number" defaultValue="10" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-uploads-per-day">Max Uploads Per Day</Label>
                <Input id="max-uploads-per-day" type="number" defaultValue="100" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-users-per-org">Max Users Per Organization</Label>
                <Input id="max-users-per-org" type="number" defaultValue="50" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="max-api-requests">Max API Requests Per Hour</Label>
                <Input id="max-api-requests" type="number" defaultValue="1000" />
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <h3 className="text-lg font-medium">Security Settings</h3>
            <Separator />
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="enforce-mfa">Enforce MFA for all admins</Label>
                  <p className="text-sm text-muted-foreground">
                    Require multi-factor authentication for all admin users
                  </p>
                </div>
                <Switch id="enforce-mfa" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="password-policy">Strict Password Policy</Label>
                  <p className="text-sm text-muted-foreground">
                    Require strong passwords with special characters and numbers
                  </p>
                </div>
                <Switch id="password-policy" defaultChecked />
              </div>
              
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="ip-restriction">IP Restrictions</Label>
                  <p className="text-sm text-muted-foreground">
                    Limit admin access to specific IP addresses
                  </p>
                </div>
                <Switch id="ip-restriction" />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end">
            <Button>Save Global Settings</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SystemSettings;
