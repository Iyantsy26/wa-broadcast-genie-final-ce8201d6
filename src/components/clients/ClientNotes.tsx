
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Client } from '@/types/client';

interface ClientNotesProps {
  client: Client;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ client }) => {
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
        <div className="text-center py-8 text-muted-foreground">
          No activities recorded yet
        </div>
      </CardContent>
    </Card>
  );
};

export default ClientNotes;
