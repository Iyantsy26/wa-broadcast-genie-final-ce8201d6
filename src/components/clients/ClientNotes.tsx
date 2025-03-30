
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Client } from '@/types/client';

interface ClientNotesProps {
  client: Client;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ client }) => {
  // Mock data for notes and activities (would be replaced with actual data in a real application)
  const activities = [
    {
      id: 1,
      type: "Meeting",
      date: "2023-06-10",
      notes: "Quarterly business review."
    },
    {
      id: 2,
      type: "Contract Renewal",
      date: "2023-07-15",
      notes: "Renewed annual contract with a 10% discount."
    },
    {
      id: 3,
      type: "Product Update",
      date: "2023-08-05",
      notes: "Introduced new features to the client."
    }
  ];

  return (
    <Card className="w-full">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-xl">Notes & Activity</CardTitle>
        <Button size="sm" className="h-8">
          <Plus className="mr-1 h-4 w-4" />
          Add Activity
        </Button>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Type</TableHead>
              <TableHead>Date</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.map((activity) => (
              <TableRow key={activity.id}>
                <TableCell>
                  <Badge variant="outline">{activity.type}</Badge>
                </TableCell>
                <TableCell>{activity.date}</TableCell>
                <TableCell>{activity.notes}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};

export default ClientNotes;
