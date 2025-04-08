
import React from 'react';
import { Client } from '@/types/conversation';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Calendar } from 'lucide-react';

interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  onViewClient: (client: Client) => void;
  formatDate: (dateString?: string) => string;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  searchTerm,
  statusFilter,
  onViewClient,
  formatDate
}) => {
  const filteredClients = clients.filter((client) => {
    const matchesSearch = 
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.company && client.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (client.phone && client.phone.includes(searchTerm));
      
    const matchesStatusFilter = statusFilter === 'all' || 
      (client.tags && client.tags.includes(statusFilter));
    
    return matchesSearch && matchesStatusFilter;
  });

  if (isLoading) {
    return <div className="py-10 text-center">Loading clients...</div>;
  }

  if (filteredClients.length === 0) {
    return (
      <div className="py-10 text-center">
        {searchTerm || statusFilter !== 'all' 
          ? 'No clients match your search or filters.' 
          : 'No clients available. Add your first client!'}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow className="bg-gray-50">
            <TableHead className="py-4 font-semibold text-gray-700">NAME</TableHead>
            <TableHead className="py-4 font-semibold text-gray-700">CONTACT</TableHead>
            <TableHead className="py-4 font-semibold text-gray-700">COMPANY</TableHead>
            <TableHead className="py-4 font-semibold text-gray-700">ADDRESS</TableHead>
            <TableHead className="py-4 font-semibold text-gray-700">PLAN DETAILS</TableHead>
            <TableHead className="py-4 font-semibold text-gray-700">LAST CONTACT</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredClients.map((client) => (
            <TableRow 
              key={client.id} 
              className="hover:bg-gray-50 cursor-pointer"
              onClick={() => onViewClient(client)}
            >
              <TableCell className="py-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden flex-shrink-0">
                    {client.avatar_url ? (
                      <img 
                        src={client.avatar_url} 
                        alt={client.name} 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-gray-600 font-semibold">
                        {client.name.substring(0, 2).toUpperCase()}
                      </span>
                    )}
                  </div>
                  <div>
                    <div className="font-semibold">{client.name}</div>
                    {client.tags && client.tags.length > 0 && (
                      <Badge variant="outline" className="mt-1 bg-blue-50 text-blue-700 border-blue-200">
                        {client.tags[0]}
                      </Badge>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell className="py-4">
                <div className="space-y-1 text-sm">
                  {client.email && <div>{client.email}</div>}
                  {client.phone && <div>{client.phone}</div>}
                </div>
              </TableCell>
              <TableCell className="py-4">
                {client.company || "-"}
              </TableCell>
              <TableCell className="py-4">
                {client.address || "-"}
              </TableCell>
              <TableCell className="py-4">
                {client.plan_details || "-"}
              </TableCell>
              <TableCell className="py-4">
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-gray-500" />
                  <span>{formatDate(client.join_date)}</span>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
