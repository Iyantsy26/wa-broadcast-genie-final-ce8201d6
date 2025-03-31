
import React from 'react';
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Info, Key, Loader2 } from 'lucide-react';

interface BusinessAPITabProps {
  newAccountName: string;
  setNewAccountName: (name: string) => void;
  businessId: string;
  setBusinessId: (id: string) => void;
  apiKey: string;
  setApiKey: (key: string) => void;
  loading: boolean;
  onAddAccount: (type: 'business_api' | 'new_business') => Promise<void>;
}

const BusinessAPITab = ({
  newAccountName,
  setNewAccountName,
  businessId,
  setBusinessId,
  apiKey,
  setApiKey,
  loading,
  onAddAccount
}: BusinessAPITabProps) => {
  return (
    <div className="space-y-4 py-4">
      <Tabs defaultValue="api_key">
        <TabsList className="w-full mb-4">
          <TabsTrigger value="api_key">Direct API</TabsTrigger>
          <TabsTrigger value="new_business">New Business</TabsTrigger>
        </TabsList>
        
        <TabsContent value="api_key">
          <div className="space-y-2">
            <Label htmlFor="api-name">Device Name</Label>
            <Input
              id="api-name"
              placeholder="e.g., Business Account"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="business-id">Business ID</Label>
            <Input
              id="business-id"
              placeholder="Enter Meta Business ID"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            />
          </div>
          
          <div className="space-y-2 mt-4">
            <Label htmlFor="api-key">API Key</Label>
            <Input
              id="api-key"
              type="password"
              placeholder="Enter API Key"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={() => onAddAccount('business_api')}
            disabled={loading || !newAccountName || !businessId || !apiKey}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Key className="mr-2 h-4 w-4" />
                Connect API
              </>
            )}
          </Button>
        </TabsContent>
        
        <TabsContent value="new_business">
          <div className="space-y-2">
            <Label htmlFor="new-business-name">Device Name</Label>
            <Input
              id="new-business-name"
              placeholder="e.g., New Business Account"
              value={newAccountName}
              onChange={(e) => setNewAccountName(e.target.value)}
            />
          </div>
          
          <Alert className="my-4">
            <Info className="h-4 w-4" />
            <AlertDescription>
              This will guide you through creating a new WhatsApp Business API account with Meta.
              You'll need a Facebook Business Manager account to proceed.
            </AlertDescription>
          </Alert>
          
          <div className="space-y-2">
            <Label htmlFor="business-name">Business Name</Label>
            <Input
              id="business-name"
              placeholder="Enter your business name"
              value={businessId}
              onChange={(e) => setBusinessId(e.target.value)}
            />
          </div>
          
          <Button 
            className="w-full mt-4" 
            onClick={() => onAddAccount('new_business')}
            disabled={loading || !newAccountName || !businessId}
          >
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Creating...
              </>
            ) : (
              <>
                <Building2 className="mr-2 h-4 w-4" />
                Create Business Account
              </>
            )}
          </Button>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default BusinessAPITab;
