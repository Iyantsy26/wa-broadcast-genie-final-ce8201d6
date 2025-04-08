import React from 'react';
import { Client } from '@/types/conversation';
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Eye, MessageSquare, MoreHorizontal } from 'lucide-react';

export interface ClientsTableProps {
  clients: Client[];
  isLoading: boolean;
  searchTerm: string;
  statusFilter: string;
  onViewClient: (client: Client) => void;
  onMessageClient: (client: Client) => Promise<void>;
  formatDate: (dateString?: string) => string;
}

const ClientsTable: React.FC<ClientsTableProps> = ({
  clients,
  isLoading,
  searchTerm,
  statusFilter,
  onViewClient,
  onMessageClient,
  formatDate,
}) => {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[300px]">Client</TableHead>
          <TableHead>Contact</TableHead>
          <TableHead>Join Date</TableHead>
          <TableHead>Renewal</TableHead>
          <TableHead>Tags</TableHead>
          <TableHead className="text-right">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {isLoading ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              Loading clients...
            </TableCell>
          </TableRow>
        ) : clients.length === 0 ? (
          <TableRow>
            <TableCell colSpan={6} className="text-center py-8">
              {searchTerm || statusFilter ? "No clients match your filters" : "No clients found"}
            </TableCell>
          </TableRow>
        ) : (
          clients.map((client) => (
            <TableRow key={client.id}>
              <TableCell>
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarImage src={client.avatar_url} />
                    <AvatarFallback className="bg-primary/10">
                      {client.name?.substring(0, 2).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className="font-medium">{client.name}</div>
                    {client.company && (
                      <div className="text-sm text-muted-foreground">
                        {client.company}
                      </div>
                    )}
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div className="space-y-1">
                  {client.email && (
                    <div className="text-sm">{client.email}</div>
                  )}
                  {client.phone && (
                    <div className="text-sm text-muted-foreground">
                      {client.phone}
                    </div>
                  )}
                </div>
              </TableCell>
              <TableCell>{formatDate(client.join_date)}</TableCell>
              <TableCell>{formatDate(client.renewal_date)}</TableCell>
              <TableCell>
                <div className="flex flex-wrap gap-1">
                  {client.tags && client.tags.length > 0 ? (
                    client.tags.map((tag, index) => (
                      <Badge key={index} variant="outline">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-muted-foreground text-sm">No tags</span>
                  )}
                </div>
              </TableCell>
              <TableCell className="text-right">
                <div className="flex justify-end gap-2">
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onViewClient(client)}
                  >
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button
                    size="icon"
                    variant="ghost"
                    onClick={() => onMessageClient(client)}
                  >
                    <MessageSquare className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
};

export default ClientsTable;
