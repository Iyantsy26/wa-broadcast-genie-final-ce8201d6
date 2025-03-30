
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Client } from '@/types/client';
import { User } from 'lucide-react';

interface ClientsTableProps {
  clients: Client[];
}

const ClientsTable: React.FC<ClientsTableProps> = ({ clients }) => {
  const navigate = useNavigate();

  // Get tag color based on tag value
  const getTagColor = (tag: string) => {
    const tagMap: Record<string, string> = {
      'VIP': 'bg-purple-500',
      'Gold': 'bg-yellow-500',
      'Silver': 'bg-gray-400',
      'Beginner': 'bg-blue-500',
      'Premium': 'bg-green-500',
      'Enterprise': 'bg-red-500'
    };
    
    return tagMap[tag] || 'bg-primary';
  };

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[60px]"></TableHead>
            <TableHead>Client</TableHead>
            <TableHead>Company</TableHead>
            <TableHead>Contact</TableHead>
            <TableHead>Referred By</TableHead>
            <TableHead>Join Date</TableHead>
            <TableHead>Tags</TableHead>
            <TableHead>Subscription</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {clients.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center p-4">
                No clients found
              </TableCell>
            </TableRow>
          ) : (
            clients.map((client) => (
              <TableRow 
                key={client.id} 
                className="cursor-pointer hover:bg-muted/50"
                onClick={() => navigate(`/clients/${client.id}`)}
              >
                <TableCell>
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={client.avatarUrl} alt={client.name} />
                    <AvatarFallback>
                      <User className="h-5 w-5" />
                    </AvatarFallback>
                  </Avatar>
                </TableCell>
                <TableCell className="font-medium">{client.name}</TableCell>
                <TableCell>{client.company}</TableCell>
                <TableCell>
                  <div>{client.email}</div>
                  <div className="text-sm text-muted-foreground">{client.phone}</div>
                </TableCell>
                <TableCell>{client.referredBy || '-'}</TableCell>
                <TableCell>{client.clientSince}</TableCell>
                <TableCell>
                  <div className="flex flex-wrap gap-1">
                    {client.tags && client.tags.map((tag, idx) => (
                      <Badge key={idx} className={`${getTagColor(tag)} text-white`}>
                        {tag}
                      </Badge>
                    ))}
                  </div>
                </TableCell>
                <TableCell>
                  {client.subscriptionPlan ? (
                    <div>
                      <div>{client.subscriptionPlan}</div>
                      {client.renewalDate && (
                        <div className="text-sm text-muted-foreground">
                          Renews: {client.renewalDate}
                        </div>
                      )}
                    </div>
                  ) : (
                    '-'
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  );
};

export default ClientsTable;
