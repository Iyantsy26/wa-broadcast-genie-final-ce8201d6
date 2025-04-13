
import React, { useState } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
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
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { 
  Settings as SettingsIcon, 
  User, 
  Bell, 
  Lock, 
  CreditCard, 
  Globe, 
  MessageSquare, 
  Shield, 
  HelpCircle, 
  RefreshCw, 
  Copy, 
  AlertCircle, 
  CheckCircle, 
  UserPlus, 
  Key, 
  Eye, 
  EyeOff,
  Smartphone,
  LogOut,
  Languages,
  Plus
} from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useToast } from "@/hooks/use-toast";

const Settings = () => {
  const { toast } = useToast();
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSaveProfile = () => {
    toast({
      title: "Profile updated",
      description: "Your profile information has been updated successfully",
    });
  };

  const handleSaveNotifications = () => {
    toast({
      title: "Notification preferences saved",
      description: "Your notification settings have been updated",
    });
  };

  const handleChangePassword = () => {
    if (!currentPassword) {
      toast({
        title: "Missing information",
        description: "Please enter your current password",
        variant: "destructive",
      });
      return;
    }

    if (!newPassword) {
      toast({
        title: "Missing information",
        description: "Please enter a new password",
        variant: "destructive",
      });
      return;
    }

    if (newPassword !== confirmPassword) {
      toast({
        title: "Passwords don't match",
        description: "New password and confirmation don't match",
        variant: "destructive",
      });
      return;
    }

    toast({
      title: "Password changed",
      description: "Your password has been updated successfully",
    });

    setCurrentPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
          <p className="text-muted-foreground">
            Manage your account settings and preferences
          </p>
        </div>
      </div>

      <Tabs defaultValue="profile" className="space-y-4">
        <TabsList className="w-full max-w-sm grid grid-cols-5">
          <TabsTrigger value="profile">
            <User className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Profile</span>
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Notifications</span>
          </TabsTrigger>
          <TabsTrigger value="security">
            <Lock className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Security</span>
          </TabsTrigger>
          <TabsTrigger value="billing">
            <CreditCard className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Billing</span>
          </TabsTrigger>
          <TabsTrigger value="integrations">
            <Globe className="h-4 w-4 mr-2" />
            <span className="hidden sm:inline">Integrations</span>
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="profile" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>
                Update your personal information and public profile
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col md:flex-row gap-6">
                <div className="flex flex-col items-center gap-2">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src="" />
                    <AvatarFallback className="text-xl bg-primary/10 text-primary">
                      JD
                    </AvatarFallback>
                  </Avatar>
                  <Button variant="outline" size="sm">
                    Change Avatar
                  </Button>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="first-name">First Name</Label>
                      <Input id="first-name" defaultValue="John" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="last-name">Last Name</Label>
                      <Input id="last-name" defaultValue="Doe" />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <Input id="email" type="email" defaultValue="john.doe@example.com" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="phone">Phone Number</Label>
                    <Input id="phone" defaultValue="+1 555-123-4567" />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="job-title">Job Title</Label>
                    <Input id="job-title" defaultValue="Marketing Manager" />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveProfile}>Save Changes</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Regional Settings</CardTitle>
              <CardDescription>
                Configure your regional preferences and language
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="language">Language</Label>
                  <Select defaultValue="en">
                    <SelectTrigger>
                      <SelectValue placeholder="Select language" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="es">Spanish</SelectItem>
                      <SelectItem value="fr">French</SelectItem>
                      <SelectItem value="de">German</SelectItem>
                      <SelectItem value="pt">Portuguese</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="timezone">Timezone</Label>
                  <Select defaultValue="america-new_york">
                    <SelectTrigger>
                      <SelectValue placeholder="Select timezone" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="america-new_york">America/New York (UTC-5)</SelectItem>
                      <SelectItem value="america-chicago">America/Chicago (UTC-6)</SelectItem>
                      <SelectItem value="america-denver">America/Denver (UTC-7)</SelectItem>
                      <SelectItem value="america-los_angeles">America/Los Angeles (UTC-8)</SelectItem>
                      <SelectItem value="europe-london">Europe/London (UTC+0)</SelectItem>
                      <SelectItem value="europe-paris">Europe/Paris (UTC+1)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="date-format">Date Format</Label>
                  <Select defaultValue="mdy">
                    <SelectTrigger>
                      <SelectValue placeholder="Select date format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="mdy">MM/DD/YYYY</SelectItem>
                      <SelectItem value="dmy">DD/MM/YYYY</SelectItem>
                      <SelectItem value="ymd">YYYY/MM/DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="time-format">Time Format</Label>
                  <Select defaultValue="12h">
                    <SelectTrigger>
                      <SelectValue placeholder="Select time format" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="12h">12 Hour (AM/PM)</SelectItem>
                      <SelectItem value="24h">24 Hour</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>
                Manage how and when you receive notifications
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4">
                <h3 className="text-sm font-medium">Email Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">New conversations</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when a new customer conversation starts
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Ticket assignments</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when you're assigned to a ticket
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Broadcast completions</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive an email when your broadcast campaigns complete
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">System updates</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about system updates and new features
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Marketing emails</Label>
                      <p className="text-sm text-muted-foreground">
                        Receive emails about new features, tips and promotions
                      </p>
                    </div>
                    <Switch />
                  </div>
                </div>
              </div>
              
              <div className="space-y-4">
                <h3 className="text-sm font-medium">In-App Notifications</h3>
                <div className="grid gap-3">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Message notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show notifications for new messages
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Sound alerts</Label>
                      <p className="text-sm text-muted-foreground">
                        Play sound alerts for new notifications
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                  
                  <Separator />
                  
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label className="text-base">Desktop notifications</Label>
                      <p className="text-sm text-muted-foreground">
                        Show browser notifications for important events
                      </p>
                    </div>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button onClick={handleSaveNotifications}>Save Preferences</Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Change Password</CardTitle>
              <CardDescription>
                Update your password to maintain account security
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="current-password">Current Password</Label>
                <div className="relative">
                  <Input 
                    id="current-password" 
                    type={isPasswordVisible ? "text" : "password"} 
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                  />
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setIsPasswordVisible(!isPasswordVisible)}
                  >
                    {isPasswordVisible ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="new-password">New Password</Label>
                <Input 
                  id="new-password" 
                  type="password" 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirm-password">Confirm New Password</Label>
                <Input 
                  id="confirm-password" 
                  type="password" 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                />
              </div>
              
              <div className="bg-gray-50 p-3 rounded-md text-sm space-y-1">
                <p className="font-medium">Password requirements:</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>At least 8 characters long</li>
                  <li>At least one uppercase letter</li>
                  <li>At least one number</li>
                  <li>At least one special character</li>
                </ul>
              </div>
            </CardContent>
            <CardFooter className="flex justify-end gap-2">
              <Button variant="outline">Cancel</Button>
              <Button onClick={handleChangePassword}>Change Password</Button>
            </CardFooter>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>
                Add an extra layer of security to your account
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label className="text-base">Two-Factor Authentication</Label>
                  <p className="text-sm text-muted-foreground">
                    Secure your account with 2FA
                  </p>
                </div>
                <Switch />
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start gap-3">
                  <Smartphone className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">Authenticator App</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use an authenticator app like Google Authenticator, Authy, or 1Password to get authentication codes.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Set Up Authenticator App
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex items-start gap-3">
                  <MessageSquare className="h-8 w-8 text-primary" />
                  <div>
                    <h3 className="font-medium">SMS Authentication</h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Use your phone number to receive authentication codes via SMS.
                    </p>
                    <Button variant="outline" size="sm" className="mt-2">
                      Set Up SMS Authentication
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Sessions & Devices</CardTitle>
              <CardDescription>
                Manage your active sessions and connected devices
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-medium">Current Session</h3>
                  <Badge className="bg-green-500">Active Now</Badge>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Globe className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h4 className="font-medium">Chrome on Windows</h4>
                        <p className="text-xs text-muted-foreground mt-1">
                          192.168.1.123 • New York, United States
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Active now
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <h3 className="text-sm font-medium">Other Active Sessions</h3>
                
                {[
                  { 
                    device: "Safari on macOS", 
                    ip: "192.168.1.145", 
                    location: "New York, United States", 
                    lastActive: "1 hour ago"
                  },
                  { 
                    device: "WhatsApp Manager App on iPhone", 
                    ip: "192.168.1.178", 
                    location: "New York, United States", 
                    lastActive: "Yesterday at 3:45 PM"
                  },
                ].map((session, index) => (
                  <div key={index} className="bg-gray-50 p-4 rounded-md">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <Globe className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{session.device}</h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {session.ip} • {session.location}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Last active {session.lastActive}
                          </p>
                        </div>
                      </div>
                      <Button variant="outline" size="sm">
                        <LogOut className="h-4 w-4 mr-2" />
                        Sign Out
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
            <CardFooter className="flex justify-end">
              <Button variant="outline" className="text-red-600 hover:bg-red-50 hover:text-red-600">
                Sign Out All Devices
              </Button>
            </CardFooter>
          </Card>
        </TabsContent>
        
        <TabsContent value="billing" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Subscription Plan</CardTitle>
              <CardDescription>
                Manage your subscription and billing details
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="bg-primary/5 p-4 rounded-lg border border-primary/10">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="font-bold text-lg">Business Pro</h3>
                      <p className="text-muted-foreground">$99/month, billed monthly</p>
                      <div className="mt-2 flex items-center">
                        <Badge className="bg-green-500">Active</Badge>
                        <span className="text-sm text-muted-foreground ml-2">
                          Renews on July 15, 2023
                        </span>
                      </div>
                    </div>
                    <Button variant="outline">Change Plan</Button>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="space-y-2">
                    <h4 className="font-medium">Your plan includes:</h4>
                    <ul className="grid grid-cols-1 md:grid-cols-2 gap-1.5">
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Up to 5 team members
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        5 WhatsApp numbers
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        25,000 messages/month
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Unlimited templates
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Advanced chatbots
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Advanced analytics
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        API access
                      </li>
                      <li className="flex items-center text-sm">
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        Priority support
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="flex flex-col md:flex-row justify-between gap-4">
                  <div className="space-y-2">
                    <h3 className="font-medium">Need more resources?</h3>
                    <p className="text-sm text-muted-foreground">
                      Upgrade your plan or add extras to meet your needs
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline">Add Extras</Button>
                    <Button>Upgrade Plan</Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>
                Manage your payment information
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-gray-50 p-4 rounded-md">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <div className="rounded-md bg-white p-2 shadow-sm">
                      <CreditCard className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <h4 className="font-medium">Visa ending in 4242</h4>
                      <p className="text-xs text-muted-foreground mt-1">
                        Expires 12/2025
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="sm">Edit</Button>
                    <Button variant="ghost" size="sm">Remove</Button>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end">
                <Button variant="outline">
                  <CreditCard className="h-4 w-4 mr-2" />
                  Add Payment Method
                </Button>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>Billing History</CardTitle>
              <CardDescription>
                View and download your past invoices
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Date
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Description
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Amount
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Invoice
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {[
                      { 
                        date: "Jun 15, 2023", 
                        description: "Business Pro Plan - Monthly", 
                        amount: "$99.00", 
                        status: "Paid" 
                      },
                      { 
                        date: "May 15, 2023", 
                        description: "Business Pro Plan - Monthly", 
                        amount: "$99.00", 
                        status: "Paid" 
                      },
                      { 
                        date: "Apr 15, 2023", 
                        description: "Business Pro Plan - Monthly", 
                        amount: "$99.00", 
                        status: "Paid" 
                      },
                    ].map((invoice, i) => (
                      <tr key={i}>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.date}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.description}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {invoice.amount}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            {invoice.status}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                            Download
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="integrations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Connected Applications</CardTitle>
              <CardDescription>
                Manage your connected applications and integrations
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6">
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md bg-white p-3 shadow-sm">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M12 0C5.37 0 0 5.37 0 12C0 18.63 5.37 24 12 24C18.63 24 24 18.63 24 12C24 5.37 18.63 0 12 0ZM19.6 19.6C19.6 19.6 16.3 21.2 12 21.2C7.7 21.2 4.4 19.6 4.4 19.6V4.4C4.4 4.4 7.7 2.8 12 2.8C16.3 2.8 19.6 4.4 19.6 4.4V19.6Z" fill="#25D366"/>
                        <path d="M12 16.8C14.7614 16.8 17 14.5614 17 11.8C17 9.03857 14.7614 6.8 12 6.8C9.23858 6.8 7 9.03857 7 11.8C7 14.5614 9.23858 16.8 12 16.8Z" fill="#25D366"/>
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">WhatsApp Business API</h3>
                        <Badge className="bg-green-500">Connected</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Enable messaging through the WhatsApp Business API
                      </p>
                      <div className="flex items-center gap-4 mt-3">
                        <Button variant="outline" size="sm">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Reconnect
                        </Button>
                        <Button variant="outline" size="sm" className="text-red-600 hover:text-red-600 hover:bg-red-50">
                          Disconnect
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md bg-white p-3 shadow-sm flex items-center justify-center">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M3.25 2.75h17.5v17.5H3.25V2.75z" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M8.73 10.4c.97 0 1.75-.78 1.75-1.75s-.78-1.75-1.75-1.75-1.75.78-1.75 1.75.78 1.75 1.75 1.75zM14.98 13.4c.97 0 1.75-.78 1.75-1.75s-.78-1.75-1.75-1.75-1.75.78-1.75 1.75.78 1.75 1.75 1.75zM8.73 17.5c.91 0 1.65-.74 1.65-1.65 0-.91-.74-1.65-1.65-1.65s-1.65.74-1.65 1.65c0 .91.74 1.65 1.65 1.65z" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                        <path d="M10.48 8.65l2.77-1.5M10.48 15.85l2.77-1.5" stroke="#0066FF" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">CRM Integration</h3>
                        <Badge variant="outline">Not Connected</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Connect to your CRM to sync contacts and conversations
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Connect CRM
                      </Button>
                    </div>
                  </div>
                </div>
                
                <div className="bg-gray-50 p-4 rounded-md">
                  <div className="flex items-start gap-4">
                    <div className="rounded-md bg-white p-3 shadow-sm flex items-center justify-center">
                      <svg className="h-8 w-8" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="24" height="24" rx="4" fill="#F2F2F2" />
                        <path d="M19.2 6.4H4.8v11.2h14.4V6.4z" fill="#4285F4" />
                        <path d="M19.2 12l-7.2 4.8-7.2-4.8v5.6h14.4V12z" fill="#34A853" />
                        <path d="M19.2 6.4L12 11.2 4.8 6.4h14.4z" fill="#FBBC05" />
                        <path d="M4.8 12l7.2 4.8V12l-7.2-5.6v5.6z" fill="#EA4335" />
                      </svg>
                    </div>
                    <div>
                      <div className="flex items-center justify-between">
                        <h3 className="font-medium">Gmail Integration</h3>
                        <Badge variant="outline">Not Connected</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        Sync emails and contacts with your Gmail account
                      </p>
                      <Button variant="outline" size="sm" className="mt-3">
                        Connect Gmail
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader>
              <CardTitle>API Access</CardTitle>
              <CardDescription>
                Manage your API keys and webhooks
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="api-key">API Key</Label>
                <div className="flex">
                  <Input
                    id="api-key"
                    value="••••••••••••••••••••••••••••••"
                    readOnly
                    className="rounded-r-none"
                  />
                  <Button className="rounded-l-none" variant="outline">
                    <Copy className="h-4 w-4 mr-2" />
                    Copy
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">
                  Your API key provides full access to your account. Keep it secure.
                </p>
              </div>
              
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="font-medium">Regenerate API Key</h3>
                  <p className="text-sm text-muted-foreground">
                    Generate a new API key if your current key is compromised
                  </p>
                </div>
                <Button variant="outline">
                  <RefreshCw className="h-4 w-4 mr-2" />
                  Regenerate
                </Button>
              </div>
              
              <Separator />
              
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <h3 className="font-medium">Webhook Endpoints</h3>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Endpoint
                  </Button>
                </div>
                <p className="text-sm text-muted-foreground">
                  Configure webhook endpoints to receive real-time events
                </p>
              </div>
              
              <div className="rounded-md border">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Endpoint URL
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Events
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    <tr>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        https://example.com/webhooks/messages
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        message.received, message.status
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          Active
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <Button variant="ghost" size="sm" className="text-primary hover:text-primary">
                          Edit
                        </Button>
                        <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-600">
                          Delete
                        </Button>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Settings;
