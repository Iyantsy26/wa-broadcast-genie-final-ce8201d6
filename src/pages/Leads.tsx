
import React, { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  PlusCircle, 
  Search, 
  Filter,
  MessageSquare, 
  Mail, 
  Phone,
  MoreVertical,
  ArrowUpDown,
  Download,
  Upload
} from 'lucide-react';
import { getLeads, deleteLead, exportLeadsToCSV, importLeadsFromCSV } from '@/services/leadService';
import { Lead } from '@/types/conversation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import LeadForm from '@/components/leads/LeadForm';

const Leads = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortField, setSortField] = useState<keyof Lead>('created_at');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');
  const [fileInputRef] = useState(React.createRef<HTMLInputElement>());

  // Fetch leads
  const { 
    data: leads = [], 
    isLoading, 
    error, 
    refetch 
  } = useQuery({
    queryKey: ['leads'],
    queryFn: getLeads
  });

  // Cache leads for export
  useEffect(() => {
    if (leads.length > 0) {
      localStorage.setItem('cached_leads', JSON.stringify(leads));
    }
  }, [leads]);

  // Filter leads based on search term and status
  const filteredLeads = useCallback(() => {
    let result = [...leads];
    
    // Apply search filter
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter((lead) => 
        lead.name.toLowerCase().includes(search) ||
        (lead.company && lead.company.toLowerCase().includes(search)) ||
        (lead.email && lead.email.toLowerCase().includes(search)) ||
        (lead.phone && lead.phone.includes(search))
      );
    }
    
    // Apply status filter
    if (statusFilter !== 'All Statuses') {
      result = result.filter(lead => lead.status === statusFilter);
    }
    
    // Apply sorting
    result.sort((a, b) => {
      const fieldA = a[sortField] || '';
      const fieldB = b[sortField] || '';
      
      // String comparison
      if (typeof fieldA === 'string' && typeof fieldB === 'string') {
        return sortDirection === 'asc' 
          ? fieldA.localeCompare(fieldB)
          : fieldB.localeCompare(fieldA);
      }
      
      // Default comparison
      return sortDirection === 'asc'
        ? (fieldA > fieldB ? 1 : -1)
        : (fieldA < fieldB ? 1 : -1);
    });
    
    return result;
  }, [leads, searchTerm, statusFilter, sortField, sortDirection]);

  // Handle lead deletion
  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this lead?')) {
      try {
        await deleteLead(id);
        refetch();
        toast({
          title: "Lead deleted",
          description: "The lead has been successfully deleted.",
        });
      } catch (error) {
        console.error("Error deleting lead:", error);
        toast({
          title: "Error",
          description: "Failed to delete the lead.",
          variant: "destructive",
        });
      }
    }
  };

  // Handle form submission completion
  const handleFormComplete = () => {
    setIsAddDialogOpen(false);
    setEditingLead(null);
    refetch();
  };

  // Handle column sorting
  const handleSort = (field: keyof Lead) => {
    if (sortField === field) {
      // Toggle direction
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      // New field, default to descending
      setSortField(field);
      setSortDirection('desc');
    }
  };

  // Handle export to CSV
  const handleExport = () => {
    try {
      const csvContent = exportLeadsToCSV();
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `leads_export_${new Date().toISOString().slice(0, 10)}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast({
        title: "Export successful",
        description: "Leads have been exported to CSV.",
      });
    } catch (error) {
      console.error("Error exporting leads:", error);
      toast({
        title: "Export failed",
        description: "There was an error exporting the leads.",
        variant: "destructive",
      });
    }
  };

  // Handle import from CSV
  const handleImport = () => {
    fileInputRef.current?.click();
  };

  const processImportedFile = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    try {
      toast({
        title: "Import started",
        description: "Importing leads from CSV...",
      });
      
      await importLeadsFromCSV(file);
      refetch();
      
      toast({
        title: "Import successful",
        description: "Leads have been imported from CSV.",
      });
    } catch (error) {
      console.error("Error importing leads:", error);
      toast({
        title: "Import failed",
        description: "There was an error importing the leads.",
        variant: "destructive",
      });
    } finally {
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  // Get status badge color
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'New':
        return 'bg-blue-100 text-blue-800';
      case 'Contacted':
        return 'bg-yellow-100 text-yellow-800';
      case 'Qualified':
        return 'bg-purple-100 text-purple-800';
      case 'Proposal':
        return 'bg-orange-100 text-orange-800';
      case 'Converted':
        return 'bg-green-100 text-green-800';
      case 'Lost':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // Format date for display
  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString();
  };

  if (error) {
    return (
      <div className="p-4">
        <p className="text-red-500">Error loading leads. Please try again later.</p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Leads</h1>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-green-500 hover:bg-green-600">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add New Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Add New Lead</DialogTitle>
            </DialogHeader>
            <LeadForm onComplete={handleFormComplete} />
          </DialogContent>
        </Dialog>
      </div>

      <Card className="mb-6">
        <CardHeader className="pb-3 pt-5 px-6 flex flex-row justify-between items-center space-y-0">
          <div className="relative w-80">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search leads..."
              className="pl-8 border-gray-300"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          <div className="flex items-center space-x-2">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" className="h-9">
                  <Filter className="h-4 w-4 mr-2" />
                  {statusFilter}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => setStatusFilter('All Statuses')}>
                  All Statuses
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('New')}>
                  New
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Contacted')}>
                  Contacted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Qualified')}>
                  Qualified
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Proposal')}>
                  Proposal
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Converted')}>
                  Converted
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => setStatusFilter('Lost')}>
                  Lost
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            
            <Button variant="outline" onClick={handleImport} className="h-9">
              <Upload className="h-4 w-4 mr-2" />
              Import
            </Button>
            <input 
              ref={fileInputRef}
              type="file" 
              accept=".csv" 
              onChange={processImportedFile}
              className="hidden" 
            />
            
            <Button variant="outline" onClick={handleExport} className="h-9">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
          </div>
        </CardHeader>
        <CardContent className="px-0">
          {isLoading ? (
            <div className="py-6 text-center">Loading leads...</div>
          ) : filteredLeads().length === 0 ? (
            <div className="py-6 text-center">
              {searchTerm || statusFilter !== 'All Statuses' 
                ? 'No leads match your search criteria.' 
                : 'No leads available. Add your first lead!'}
            </div>
          ) : (
            <div>
              <Table>
                <TableHeader>
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-12"></TableHead>
                    <TableHead className="w-[200px]">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('name')}
                      >
                        <span>NAME</span>
                        {sortField === 'name' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[300px]">CONTACT</TableHead>
                    <TableHead className="w-[170px]">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('source')}
                      >
                        <span>SOURCE</span>
                        {sortField === 'source' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('status')}
                      >
                        <span>STATUS</span>
                        {sortField === 'status' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('created_at')}
                      >
                        <span>CREATED</span>
                        {sortField === 'created_at' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px]">
                      <button 
                        className="flex items-center space-x-1"
                        onClick={() => handleSort('last_contact')}
                      >
                        <span>LAST CONTACT</span>
                        {sortField === 'last_contact' && (
                          <ArrowUpDown className="h-3 w-3" />
                        )}
                      </button>
                    </TableHead>
                    <TableHead className="w-[120px] text-right">ACTIONS</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredLeads().map((lead) => (
                    <TableRow key={lead.id} className="hover:bg-gray-50">
                      <TableCell className="font-medium p-3">
                        <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                          {lead.avatar_url ? (
                            <img 
                              src={lead.avatar_url} 
                              alt={lead.name} 
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <span className="font-medium text-sm text-gray-500">
                              {lead.initials}
                            </span>
                          )}
                        </div>
                      </TableCell>
                      <TableCell className="font-medium p-3">
                        <Dialog>
                          <DialogTrigger asChild>
                            <button 
                              className="text-left font-medium text-blue-600 hover:text-blue-800"
                              onClick={() => setEditingLead(lead)}
                            >
                              {lead.name}
                            </button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[600px]">
                            <DialogHeader>
                              <DialogTitle>Edit Lead</DialogTitle>
                            </DialogHeader>
                            {editingLead && (
                              <LeadForm 
                                lead={editingLead} 
                                onComplete={handleFormComplete} 
                              />
                            )}
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="p-3">
                        {lead.email && (
                          <div className="text-sm text-gray-700 mb-1">
                            {lead.email}
                          </div>
                        )}
                        {lead.phone && (
                          <div className="text-sm text-gray-700">
                            {lead.phone}
                          </div>
                        )}
                      </TableCell>
                      <TableCell className="p-3">
                        {lead.source || '-'}
                      </TableCell>
                      <TableCell className="p-3">
                        <Badge className={getStatusColor(lead.status)}>
                          {lead.status}
                        </Badge>
                      </TableCell>
                      <TableCell className="p-3">
                        {formatDate(lead.created_at)}
                      </TableCell>
                      <TableCell className="p-3">
                        {formatDate(lead.last_contact)}
                      </TableCell>
                      <TableCell className="p-3 text-right">
                        <div className="flex justify-end space-x-1">
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <MessageSquare className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Mail className="h-4 w-4 text-gray-500" />
                          </Button>
                          <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                            <Phone className="h-4 w-4 text-gray-500" />
                          </Button>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                                <MoreVertical className="h-4 w-4 text-gray-500" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <Dialog>
                                <DialogTrigger asChild>
                                  <DropdownMenuItem 
                                    onClick={() => setEditingLead(lead)}
                                  >
                                    Edit Lead
                                  </DropdownMenuItem>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-[600px]">
                                  <DialogHeader>
                                    <DialogTitle>Edit Lead</DialogTitle>
                                  </DialogHeader>
                                  {editingLead && (
                                    <LeadForm 
                                      lead={editingLead} 
                                      onComplete={handleFormComplete} 
                                    />
                                  )}
                                </DialogContent>
                              </Dialog>
                              <DropdownMenuItem 
                                className="text-red-600"
                                onClick={() => handleDelete(lead.id)}
                              >
                                Delete Lead
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default Leads;
