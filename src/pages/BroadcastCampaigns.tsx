
import React, { useState, useRef } from 'react';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Plus,
  FileText,
  Users,
  Calendar,
  ChevronRight,
  MoreHorizontal,
  Eye,
  Edit,
  Trash2,
  Filter,
  Search,
  Upload,
  Image,
  File,
  Video,
  Send,
  Clock,
  CheckCircle,
  XCircle,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { CreateBroadcastDialog } from "@/components/broadcasts/CreateBroadcastDialog";

interface BroadcastCampaign {
  id: string;
  name: string;
  status: 'scheduled' | 'sending' | 'completed' | 'draft';
  template?: string;
  audience: string;
  sent: number;
  delivered: number;
  read: number;
  responded: number;
  scheduled: string;
}

const campaigns: BroadcastCampaign[] = [
  {
    id: '1',
    name: 'Summer Promotion',
    status: 'completed',
    template: 'Summer_Promo_2023',
    audience: 'All Customers',
    sent: 2500,
    delivered: 2450,
    read: 1890,
    responded: 312,
    scheduled: '2023-06-15T09:00:00Z',
  },
  {
    id: '2',
    name: 'Product Launch Announcement',
    status: 'sending',
    template: 'New_Product_2023',
    audience: 'Premium Customers',
    sent: 1200,
    delivered: 1150,
    read: 800,
    responded: 95,
    scheduled: '2023-06-20T14:30:00Z',
  },
  {
    id: '3',
    name: 'Customer Feedback Survey',
    status: 'scheduled',
    template: 'Feedback_Survey_Q2',
    audience: 'Active Users',
    sent: 0,
    delivered: 0,
    read: 0,
    responded: 0,
    scheduled: '2023-06-25T10:00:00Z',
  },
  {
    id: '4',
    name: 'Holiday Campaign Draft',
    status: 'draft',
    audience: 'No audience selected',
    sent: 0,
    delivered: 0,
    read: 0,
    responded: 0,
    scheduled: '',
  },
];

const BroadcastCampaigns = () => {
  const { toast } = useToast();
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [selectedAudience, setSelectedAudience] = useState<string>('');
  const [campaignName, setCampaignName] = useState<string>('');
  const [messageContent, setMessageContent] = useState<string>('');
  const [showAudienceDialog, setShowAudienceDialog] = useState<boolean>(false);
  const [csvFile, setCsvFile] = useState<File | null>(null);
  const csvFileInputRef = useRef<HTMLInputElement>(null);
  const [openCreateDialog, setOpenCreateDialog] = useState(false);

  const handleCreateCampaign = () => {
    if (!campaignName) {
      toast({
        title: "Missing information",
        description: "Please provide a campaign name",
        variant: "destructive",
      });
      return;
    }

    if (!selectedTemplate && !messageContent) {
      toast({
        title: "Missing content",
        description: "Please select a template or create a custom message",
        variant: "destructive",
      });
      return;
    }

    if (!selectedAudience) {
      toast({
        title: "Missing audience",
        description: "Please select an audience for your broadcast",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Campaign created",
      description: "Your broadcast campaign has been created as a draft",
    });
  };

  const handleFileUpload = () => {
    if (csvFileInputRef.current) {
      csvFileInputRef.current.click();
    }
  };

  const handleCsvFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type !== 'text/csv' && !file.name.endsWith('.csv')) {
        toast({
          title: "Invalid file type",
          description: "Please upload a valid CSV file",
          variant: "destructive",
        });
        return;
      }
      
      setCsvFile(file);
      toast({
        title: "File selected",
        description: `${file.name} has been selected`,
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-600 bg-green-50';
      case 'sending':
        return 'text-blue-600 bg-blue-50';
      case 'scheduled':
        return 'text-yellow-600 bg-yellow-50';
      case 'draft':
        return 'text-gray-600 bg-gray-50';
      default:
        return '';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'sending':
        return <Send className="h-4 w-4 text-blue-600" />;
      case 'scheduled':
        return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'draft':
        return <FileText className="h-4 w-4 text-gray-600" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Broadcasts</h1>
          <p className="text-muted-foreground">
            Create and manage your WhatsApp broadcast campaigns
          </p>
        </div>
        
        <Button onClick={() => setOpenCreateDialog(true)}>
          <Plus className="mr-2 h-4 w-4" />
          New Broadcast
        </Button>
        <CreateBroadcastDialog 
          open={openCreateDialog} 
          onOpenChange={setOpenCreateDialog}
          onSuccess={() => {
            toast({
              title: "Campaign created",
              description: "Your broadcast campaign has been created successfully"
            });
          }}
        />
        
        <Dialog open={showAudienceDialog} onOpenChange={setShowAudienceDialog}>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Create New Audience</DialogTitle>
              <DialogDescription>
                Upload contacts or define criteria for your new audience.
              </DialogDescription>
            </DialogHeader>
            
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload CSV</TabsTrigger>
                <TabsTrigger value="criteria">Define Criteria</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4 py-4">
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 mx-auto text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Drag and drop your CSV file here, or click to browse
                  </p>
                  
                  <input
                    ref={csvFileInputRef}
                    type="file"
                    accept=".csv,text/csv"
                    className="hidden"
                    onChange={handleCsvFileChange}
                  />
                  
                  <Button variant="outline" size="sm" className="mt-4" onClick={handleFileUpload}>
                    Choose File
                  </Button>
                  
                  {csvFile && (
                    <div className="mt-3 text-sm">
                      <p className="font-medium">{csvFile.name}</p>
                      <p className="text-xs text-muted-foreground">
                        {(csvFile.size / 1024).toFixed(1)} KB
                      </p>
                    </div>
                  )}
                </div>
                <div className="text-sm text-muted-foreground">
                  <p>Your CSV should include the following columns:</p>
                  <ul className="list-disc list-inside mt-2">
                    <li>Name (required)</li>
                    <li>Phone (required, with country code)</li>
                    <li>Email (optional)</li>
                    <li>Custom Variables (optional)</li>
                  </ul>
                </div>
              </TabsContent>
              
              <TabsContent value="criteria" className="space-y-4 py-4">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="audience-name">Audience Name</Label>
                    <Input id="audience-name" placeholder="e.g., Active Premium Customers" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Filter by tags</Label>
                    <div className="flex flex-wrap gap-2">
                      <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                        Premium
                      </div>
                      <div className="bg-primary/10 text-primary text-sm px-3 py-1 rounded-full">
                        Active
                      </div>
                      <div className="border border-dashed rounded-full px-3 py-1 text-sm text-muted-foreground">
                        + Add Tag
                      </div>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Filter by activity</Label>
                    <Select defaultValue="active-90">
                      <SelectTrigger>
                        <SelectValue placeholder="Select activity filter" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active-30">Active in last 30 days</SelectItem>
                        <SelectItem value="active-90">Active in last 90 days</SelectItem>
                        <SelectItem value="inactive-90">Inactive for 90+ days</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
            
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowAudienceDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                toast({
                  title: "Audience created",
                  description: "Your new audience has been created successfully"
                });
                setShowAudienceDialog(false);
              }}>
                Create Audience
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="flex flex-col md:flex-row justify-between gap-4">
        <div className="flex flex-col sm:flex-row gap-2">
          <div className="relative w-full sm:w-64 md:w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search campaigns..."
              className="pl-8"
            />
          </div>
          
          <Button variant="outline" size="icon">
            <Filter className="h-4 w-4" />
          </Button>
        </div>
        
        <div className="flex items-center gap-2">
          <p className="text-sm text-muted-foreground">
            Showing <b>4</b> of <b>4</b> campaigns
          </p>
        </div>
      </div>

      <Card>
        <CardHeader className="py-4">
          <CardTitle>All Campaigns</CardTitle>
          <CardDescription>
            View and manage all your broadcast campaigns
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Campaign</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Audience</TableHead>
                <TableHead className="text-right">Metrics</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {campaigns.map((campaign) => (
                <TableRow key={campaign.id}>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium">{campaign.name}</span>
                      <span className="text-xs text-muted-foreground">
                        {campaign.template || 'Custom Message'} • {' '}
                        {campaign.scheduled ? 
                          new Date(campaign.scheduled).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : 
                          'Not scheduled'}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(campaign.status)}`}>
                      {getStatusIcon(campaign.status)}
                      <span className="ml-1 capitalize">{campaign.status}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1.5">
                      <Users className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm">{campaign.audience}</span>
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="text-sm">
                      {campaign.status !== 'draft' ? (
                        <>
                          <div className="font-medium">{campaign.sent} sent</div>
                          <div className="text-xs text-muted-foreground">
                            {Math.round((campaign.read / campaign.sent) * 100) || 0}% read rate
                          </div>
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No metrics yet</span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          View Details
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit Campaign
                        </DropdownMenuItem>
                        {campaign.status === 'scheduled' && (
                          <DropdownMenuItem>
                            <Send className="mr-2 h-4 w-4" />
                            Send Now
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default BroadcastCampaigns;
