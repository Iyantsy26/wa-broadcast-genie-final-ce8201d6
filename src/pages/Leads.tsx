import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { PlusCircle, Search, MoreHorizontal, ArrowUpRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { 
  Dialog, 
  DialogTrigger,
  DialogContent
} from "@/components/ui/dialog";
import LeadForm from "@/components/leads/LeadForm";
import { Lead } from '@/types/conversation';
import { createConversation } from '@/services/conversationService';
import { getLeads, createLead } from '@/services/leadService';
import { toast } from '@/hooks/use-toast';

interface DataTableSearchProps {
  leads: Lead[];
  setFilteredLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
}

function DataTableSearch({ leads, setFilteredLeads }: DataTableSearchProps) {
  const [search, setSearch] = React.useState("")

  React.useEffect(() => {
    if (!search) {
      setFilteredLeads(leads);
      return;
    }

    const filtered = leads.filter((lead) => {
      const searchString = `${lead.name} ${lead.email} ${lead.phone}`.toLowerCase();
      return searchString.includes(search.toLowerCase());
    });
    setFilteredLeads(filtered);
  }, [search, leads, setFilteredLeads])

  return (
    <div className="flex items-center space-x-2">
      <Search className="h-4 w-4" />
      <Input
        placeholder="Filter leads..."
        value={search}
        onChange={(event) => setSearch(event.target.value)}
      />
    </div>
  )
}

interface DataTableRowActionsProps {
  lead: Lead;
}

function DataTableRowActions({ lead }: DataTableRowActionsProps) {
  const navigate = useNavigate();

  const handleCreateConversation = async (leadId: string) => {
    try {
      const conversationId = await createConversation(leadId, 'lead', `Initial contact with ${lead.name}`);
      navigate(`/conversations`);
      toast({
        title: "Conversation created",
        description: `A new conversation with ${lead.name} has been created.`,
      });
    } catch (error) {
      console.error("Error creating conversation:", error);
      toast({
        title: "Error",
        description: "Failed to create conversation. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="relative">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => handleCreateConversation(lead.id)}>
            <ArrowUpRight className="mr-2 h-4 w-4" />
            Start Conversation
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem>
            <Button variant="link">
              View Details
            </Button>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )
}

import {
  ColumnDef,
  flexRender,
  getCoreRowModel,
  useReactTable,
  SortingState,
  ColumnFiltersState,
  getPaginationRowModel,
  getFilteredRowModel,
} from "@tanstack/react-table"

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { ScrollArea } from "@/components/ui/scroll-area"

interface DataTableProps {
  columns: ColumnDef<Lead>[];
  data: Lead[];
}

function DataTable<TData, TValue>({
  columns,
  data,
}: DataTableProps) {
  const [sorting, setSorting] = React.useState<SortingState>([])
  const [columnFilters, setColumnFilters] = React.useState<ColumnFiltersState>(
    []
  )
  const [filteredLeads, setFilteredLeads] = React.useState<Lead[]>(data);

  const table = useReactTable({
    data: filteredLeads,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    onSortingChange: setSorting,
    getFilteredRowModel: getFilteredRowModel(),
    onColumnFiltersChange: setColumnFilters,
    state: {
      sorting,
      columnFilters,
    },
  })

  return (
    <div className="w-full">
      <div className="flex items-center py-4">
        <DataTableSearch leads={data} setFilteredLeads={setFilteredLeads} />
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="ml-auto">
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Lead
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px]">
            <LeadForm />
          </DialogContent>
        </Dialog>
      </div>
      <div className="rounded-md border">
        <ScrollArea>
          <div className="relative min-w-[600px]">
            <table className="w-full table-auto">
              <thead>
                {table.getHeaderGroups().map((headerGroup) => (
                  <tr key={headerGroup.id}>
                    {headerGroup.headers.map((header) => {
                      return (
                        <th key={header.id} className="px-4 py-2 text-left">
                          {header.isPlaceholder
                            ? null
                            : flexRender(
                                header.column.columnDef.header,
                                header.getContext()
                              )}
                        </th>
                      )
                    })}
                  </tr>
                ))}
              </thead>
              <tbody>
                {table.getRowModel().rows.map((row) => (
                  <tr key={row.id} className="border-b last:border-b-0">
                    {row.getVisibleCells().map((cell) => (
                      <td key={cell.id} className="p-4">
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </ScrollArea>
      </div>
      <div className="flex items-center justify-end space-x-2 py-2">
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.previousPage()}
          disabled={!table.getCanPreviousPage()}
        >
          Previous
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => table.nextPage()}
          disabled={!table.getCanNextPage()}
        >
          Next
        </Button>
      </div>
    </div>
  )
}

const Leads = () => {
  const [leads, setLeads] = useState<Lead[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);

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

  const columns: ColumnDef<Lead>[] = [
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <div className="flex items-center">
          <Avatar className="mr-2 h-6 w-6">
            <AvatarImage src={row.original.avatar_url} />
            <AvatarFallback className="bg-primary/10 text-primary">
              {row.original.initials}
            </AvatarFallback>
          </Avatar>
          {row.getValue("name")}
        </div>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
    },
    {
      accessorKey: "phone",
      header: "Phone",
    },
    {
      id: "actions",
      cell: ({ row }) => (
        <DataTableRowActions lead={row.original} />
      ),
    },
  ]

  return (
    <div>
      <div className="mb-4">
        <h1 className="text-2xl font-bold tracking-tight">Leads</h1>
        <p className="text-muted-foreground">
          Manage and view your leads
        </p>
      </div>
      <Tabs defaultValue="all" className="w-full space-y-4">
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="active">Active</TabsTrigger>
          <TabsTrigger value="inactive">Inactive</TabsTrigger>
        </TabsList>
        <TabsContent value="all" className="space-y-2">
          {loading ? (
            <div>Loading leads...</div>
          ) : (
            <div className="w-full">
              <div className="flex items-center py-4">
                <DataTableSearch leads={leads} setFilteredLeads={setLeads} />
                <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                  <DialogTrigger asChild>
                    <Button variant="outline" className="ml-auto">
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Lead
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-[425px]">
                    <LeadForm onComplete={handleLeadFormComplete} />
                  </DialogContent>
                </Dialog>
              </div>
              <DataTable columns={columns} data={leads} />
            </div>
          )}
        </TabsContent>
        <TabsContent value="active" className="space-y-2">
          <div>Active leads content</div>
        </TabsContent>
        <TabsContent value="inactive" className="space-y-2">
          <div>Inactive leads content</div>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default Leads;
