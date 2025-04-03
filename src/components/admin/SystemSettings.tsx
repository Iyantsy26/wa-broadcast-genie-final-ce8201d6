
import React, { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Mail, 
  MessageSquare, 
  CreditCard, 
  Phone,
  Save,
  RefreshCw,
  RotateCw 
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const SystemSettings = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState('email');
  const [isSaving, setIsSaving] = useState(false);
  const [isTestingSetting, setIsTestingSetting] = useState('');
  
  // Form states for each gateway
  const [emailSettings, setEmailSettings] = useState({
    provider: 'sendgrid',
    apiKey: '',
    fromEmail: 'noreply@example.com',
    fromName: 'System Notification',
    enabled: true
  });
  
  const [messageSettings, setMessageSettings] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: true
  });
  
  const [whatsappSettings, setWhatsappSettings] = useState({
    provider: 'twilio',
    accountSid: '',
    authToken: '',
    fromNumber: '',
    enabled: true
  });
  
  const [paymentSettings, setPaymentSettings] = useState({
    provider: 'stripe',
    publishableKey: '',
    secretKey: '',
    webhookSecret: '',
    enabled: true
  });
  
  const handleSaveSettings = (type: string) => {
    setIsSaving(true);
    
    // Simulate saving to database
    setTimeout(() => {
      setIsSaving(false);
      
      // Store settings in localStorage for demo purposes
      const settingsMap = {
        email: emailSettings,
        message: messageSettings,
        whatsapp: whatsappSettings, 
        payment: paymentSettings
      };
      
      // Save the current settings
      localStorage.setItem(`${type}Settings`, JSON.stringify(settingsMap[type as keyof typeof settingsMap]));
      
      toast({
        title: "Settings Saved",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} gateway settings have been updated.`,
      });
    }, 1000);
  };
  
  const handleTestConnection = (type: string) => {
    setIsTestingSetting(type);
    
    // Simulate API test
    setTimeout(() => {
      setIsTestingSetting('');
      
      toast({
        title: "Connection Successful",
        description: `${type.charAt(0).toUpperCase() + type.slice(1)} gateway connection has been verified.`,
      });
    }, 2000);
  };

  return (
    <div className="space-y-6">
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
                <Phone className="h-4 w-4" />
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
                  <Switch 
                    id="email-enabled" 
                    checked={emailSettings.enabled}
                    onCheckedChange={(checked) => setEmailSettings({...emailSettings, enabled: checked})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-provider">Provider</Label>
                  <Select 
                    value={emailSettings.provider} 
                    onValueChange={(value) => setEmailSettings({...emailSettings, provider: value})}
                  >
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
                  <Input 
                    id="email-api-key" 
                    type="password" 
                    value={emailSettings.apiKey}
                    onChange={(e) => setEmailSettings({...emailSettings, apiKey: e.target.value})}
                    placeholder="Enter API key" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-from">From Email</Label>
                  <Input 
                    id="email-from" 
                    type="email" 
                    value={emailSettings.fromEmail}
                    onChange={(e) => setEmailSettings({...emailSettings, fromEmail: e.target.value})}
                    placeholder="noreply@example.com" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="email-name">From Name</Label>
                  <Input 
                    id="email-name" 
                    value={emailSettings.fromName}
                    onChange={(e) => setEmailSettings({...emailSettings, fromName: e.target.value})}
                    placeholder="System Notification" 
                  />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('email')}
                    disabled={isTestingSetting === 'email' || !emailSettings.apiKey}
                  >
                    {isTestingSetting === 'email' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
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
                  <Switch 
                    id="sms-enabled" 
                    checked={messageSettings.enabled}
                    onCheckedChange={(checked) => setMessageSettings({...messageSettings, enabled: checked})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-provider">Provider</Label>
                  <Select 
                    value={messageSettings.provider} 
                    onValueChange={(value) => setMessageSettings({...messageSettings, provider: value})}
                  >
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
                  <Input 
                    id="sms-account-sid" 
                    type="password" 
                    value={messageSettings.accountSid}
                    onChange={(e) => setMessageSettings({...messageSettings, accountSid: e.target.value})}
                    placeholder="Enter Account SID" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-auth-token">Auth Token</Label>
                  <Input 
                    id="sms-auth-token" 
                    type="password" 
                    value={messageSettings.authToken}
                    onChange={(e) => setMessageSettings({...messageSettings, authToken: e.target.value})}
                    placeholder="Enter Auth Token" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="sms-from-number">From Number</Label>
                  <Input 
                    id="sms-from-number" 
                    value={messageSettings.fromNumber}
                    onChange={(e) => setMessageSettings({...messageSettings, fromNumber: e.target.value})}
                    placeholder="+1234567890" 
                  />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('message')}
                    disabled={isTestingSetting === 'message' || !messageSettings.accountSid || !messageSettings.authToken}
                  >
                    {isTestingSetting === 'message' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                    Test Connection
                  </Button>
                  <Button 
                    onClick={() => handleSaveSettings('message')}
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
                  <Switch 
                    id="whatsapp-enabled" 
                    checked={whatsappSettings.enabled}
                    onCheckedChange={(checked) => setWhatsappSettings({...whatsappSettings, enabled: checked})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-provider">Provider</Label>
                  <Select 
                    value={whatsappSettings.provider} 
                    onValueChange={(value) => setWhatsappSettings({...whatsappSettings, provider: value})}
                  >
                    <SelectTrigger id="whatsapp-provider">
                      <SelectValue placeholder="Select provider" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="twilio">Twilio</SelectItem>
                      <SelectItem value="messagebird">MessageBird</SelectItem>
                      <SelectItem value="infobip">Infobip</SelectItem>
                      <SelectItem value="360dialog">360dialog</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-account-sid">Account SID</Label>
                  <Input 
                    id="whatsapp-account-sid" 
                    type="password" 
                    value={whatsappSettings.accountSid}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, accountSid: e.target.value})}
                    placeholder="Enter Account SID" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-auth-token">Auth Token</Label>
                  <Input 
                    id="whatsapp-auth-token" 
                    type="password" 
                    value={whatsappSettings.authToken}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, authToken: e.target.value})}
                    placeholder="Enter Auth Token" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="whatsapp-from-number">WhatsApp Business Number</Label>
                  <Input 
                    id="whatsapp-from-number" 
                    value={whatsappSettings.fromNumber}
                    onChange={(e) => setWhatsappSettings({...whatsappSettings, fromNumber: e.target.value})}
                    placeholder="+1234567890" 
                  />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('whatsapp')}
                    disabled={isTestingSetting === 'whatsapp' || !whatsappSettings.accountSid || !whatsappSettings.authToken}
                  >
                    {isTestingSetting === 'whatsapp' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
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
                  <Switch 
                    id="payment-enabled" 
                    checked={paymentSettings.enabled}
                    onCheckedChange={(checked) => setPaymentSettings({...paymentSettings, enabled: checked})}
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-provider">Provider</Label>
                  <Select 
                    value={paymentSettings.provider} 
                    onValueChange={(value) => setPaymentSettings({...paymentSettings, provider: value})}
                  >
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
                  <Input 
                    id="payment-publishable-key" 
                    value={paymentSettings.publishableKey}
                    onChange={(e) => setPaymentSettings({...paymentSettings, publishableKey: e.target.value})}
                    placeholder="Enter Publishable Key" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-secret-key">Secret Key</Label>
                  <Input 
                    id="payment-secret-key" 
                    type="password" 
                    value={paymentSettings.secretKey}
                    onChange={(e) => setPaymentSettings({...paymentSettings, secretKey: e.target.value})}
                    placeholder="Enter Secret Key" 
                  />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="payment-webhook-secret">Webhook Secret</Label>
                  <Input 
                    id="payment-webhook-secret" 
                    type="password" 
                    value={paymentSettings.webhookSecret}
                    onChange={(e) => setPaymentSettings({...paymentSettings, webhookSecret: e.target.value})}
                    placeholder="Enter Webhook Secret" 
                  />
                </div>
                <div className="flex justify-between mt-4 pt-4 border-t">
                  <Button 
                    variant="outline" 
                    onClick={() => handleTestConnection('payment')}
                    disabled={isTestingSetting === 'payment' || !paymentSettings.publishableKey || !paymentSettings.secretKey}
                  >
                    {isTestingSetting === 'payment' ? <RotateCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
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
    </div>
  );
};

export default SystemSettings;
