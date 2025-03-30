
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Import, FileText } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { getLeads } from '@/services/leadService';
import { Lead } from '@/types/conversation';
import LeadForm from "@/components/leads/LeadForm";
import LeadsTable from "@/components/leads/LeadsTable";

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchLeads();
  }, []);

  const fetchLeads = async () => {
    try {
      setLoading(true);
      const data = await getLeads();
      setLeads(data);
    } catch (error) {
      console.error("Error fetching leads:", error);
      toast({
        title: "Error",
        description: "Failed to load leads",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleLeadFormComplete = () => {
    setDialogOpen(false);
    fetchLeads();
  };

  const handleImport = () => {
    toast({
      title: "Import feature",
      description: "Lead import functionality will be implemented soon",
    });
  };

  const handleExport = () => {
    toast({
      title: "Export feature",
      description: "Lead export functionality will be implemented soon",
    });
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Leads</h1>
        
        <Button className="bg-green-600 hover:bg-green-700" onClick={() => setDialogOpen(true)}>
          <Plus className="mr-2 h-5 w-5" />
          Add New Lead
        </Button>
      </div>

      <div className="flex justify-between items-center mt-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <input
              type="text"
              placeholder="Search leads..."
              className="pl-9 h-10 w-64 rounded-md border border-input bg-background px-3 py-2"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <div className="absolute left-3 top-3 text-gray-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8"></circle>
                <path d="m21 21-4.3-4.3"></path>
              </svg>
            </div>
          </div>
          
          <div className="relative">
            <select 
              className="h-10 pr-10 rounded-md border border-input bg-background px-3 py-2"
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All Statuses</option>
              <option value="New">New</option>
              <option value="Contacted">Contacted</option>
              <option value="Qualified">Qualified</option>
              <option value="Proposal">Proposal</option>
              <option value="Converted">Converted</option>
              <option value="Lost">Lost</option>
            </select>
            <div className="absolute right-3 top-3 pointer-events-none text-gray-400">
              <svg width="12" height="12" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 6L8 10L12 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              </svg>
            </div>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button variant="outline" onClick={handleImport} className="flex items-center">
            <Import className="mr-2 h-4 w-4" />
            Import
          </Button>
          <Button variant="outline" onClick={handleExport} className="flex items-center">
            <FileText className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <LeadsTable 
        leads={leads} 
        loading={loading} 
        searchTerm={searchTerm}
        statusFilter={statusFilter}
      />

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <LeadForm onComplete={handleLeadFormComplete} />
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Leads;
