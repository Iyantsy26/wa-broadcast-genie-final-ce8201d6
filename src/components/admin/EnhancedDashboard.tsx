
import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import {
  Building,
  CreditCard,
  Plus,
  Users,
  Smartphone,
  BarChart,
  FileText,
  ArrowUpRight,
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

const EnhancedDashboard = () => {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    organizations: 0,
    subscriptions: 0,
    users: 0,
    devices: 0,
  });
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDashboardData = async () => {
      setIsLoading(true);
      try {
        // Organizations count
        const { count: orgCount, error: orgError } = await supabase
          .from('organizations')
          .select('*', { count: 'exact', head: true });
          
        // Subscriptions count  
        const { count: subCount, error: subError } = await supabase
          .from('organization_subscriptions')
          .select('*', { count: 'exact', head: true })
          .eq('status', 'active');
          
        // Users count
        const { count: userCount, error: userError } = await supabase
          .from('team_members')
          .select('*', { count: 'exact', head: true });
          
        // Devices count
        const { count: deviceCount, error: deviceError } = await supabase
          .from('device_accounts')
          .select('*', { count: 'exact', head: true });
          
        // Recent activity
        const { data: activityData, error: activityError } = await supabase
          .from('activities')
          .select('*, client_id, lead_id, created_at, title, description, activity_type')
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (activityData) {
          setRecentActivity(activityData);
        }
        
        setStats({
          organizations: orgCount || 0,
          subscriptions: subCount || 0,
          users: userCount || 0,
          devices: deviceCount || 0,
        });
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDashboardData();
    
    // If data isn't available, use mock data
    const timeout = setTimeout(() => {
      if (isLoading) {
        setStats({
          organizations: 15,
          subscriptions: 12,
          users: 573,
          devices: 423,
        });
        
        setRecentActivity([
          {
            id: '1',
            created_at: new Date().toISOString(),
            title: 'Subscription upgraded',
            description: 'Acme Inc upgraded to Premium plan',
            activity_type: 'subscription_change',
          },
          {
            id: '2',
            created_at: new Date(Date.now() - 86400000).toISOString(),
            title: 'New organization created',
            description: 'Globex Corp was added to the platform',
            activity_type: 'organization_created',
          },
          {
            id: '3',
            created_at: new Date(Date.now() - 172800000).toISOString(),
            title: 'Device added',
            description: 'TechFirm LLC added a new WhatsApp Business API device',
            activity_type: 'device_added',
          },
        ]);
        
        setIsLoading(false);
      }
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, [toast]);
  
  const handleQuickAction = (action: string) => {
    switch (action) {
      case 'add-organization':
        navigate('/super-admin?tab=organizations');
        break;
      case 'create-plan':
        navigate('/super-admin?tab=plans');
        break;
      case 'add-admin':
        navigate('/super-admin?tab=admins');
        break;
      case 'view-reports':
        // Navigate to reports page
        toast({
          title: "Reports",
          description: "Navigating to reports would go here",
        });
        break;
      default:
        break;
    }
  };
  
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'subscription_change':
        return <CreditCard className="h-4 w-4 text-blue-500" />;
      case 'organization_created':
        return <Building className="h-4 w-4 text-purple-500" />;
      case 'device_added':
        return <Smartphone className="h-4 w-4 text-green-500" />;
      case 'user_added':
        return <Users className="h-4 w-4 text-amber-500" />;
      default:
        return <FileText className="h-4 w-4 text-gray-500" />;
    }
  };
  
  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Organizations
            </CardTitle>
            <Building className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.organizations}</div>
            <p className="text-xs text-muted-foreground">
              +5 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Active Subscriptions
            </CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.subscriptions}</div>
            <p className="text-xs text-muted-foreground">
              +2 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.users}</div>
            <p className="text-xs text-muted-foreground">
              +58 from last month
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              WhatsApp Devices
            </CardTitle>
            <Smartphone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{isLoading ? '...' : stats.devices}</div>
            <p className="text-xs text-muted-foreground">
              +24 from last month
            </p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        <Card className="col-span-1 md:col-span-2">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Recent Activity</CardTitle>
            {recentActivity.length > 0 && (
              <Button variant="ghost" size="sm" className="gap-1">
                View All
                <ArrowUpRight className="h-3 w-3" />
              </Button>
            )}
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : recentActivity.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No recent activity found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Event</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentActivity.map((activity) => (
                    <TableRow key={activity.id}>
                      <TableCell>
                        {new Date(activity.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <div className="mr-2">
                            {getActivityIcon(activity.activity_type)}
                          </div>
                          <div>
                            <div className="font-medium">{activity.title}</div>
                            <div className="text-sm text-muted-foreground">
                              {activity.description}
                            </div>
                          </div>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('add-organization')}
            >
              <Building className="mr-2 h-4 w-4" />
              Add Organization
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('create-plan')}
            >
              <CreditCard className="mr-2 h-4 w-4" />
              Create Plan
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('add-admin')}
            >
              <Users className="mr-2 h-4 w-4" />
              Add Administrator
            </Button>
            <Button 
              variant="outline" 
              className="w-full justify-start"
              onClick={() => handleQuickAction('view-reports')}
            >
              <BarChart className="mr-2 h-4 w-4" />
              View Reports
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default EnhancedDashboard;
