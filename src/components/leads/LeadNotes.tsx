
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Lead } from '@/types/lead';

interface LeadNotesProps {
  lead: Lead;
}

const LeadNotes: React.FC<LeadNotesProps> = ({ lead }) => {
  // Mock data for notes and activities (would be replaced with actual data in a real application)
  const activities = [
    {
      id: 1,
      type: "Phone Call",
      date: "2023-05-15",
      notes: "Discussed product features and pricing."
    },
    {
      id: 2,
      type: "Meeting",
      date: "2023-05-20",
      notes: "Presented demo of the software."
    },
    {
      id: 3,
      type: "Follow-up Call",
      date: "2023-05-25",
      notes: "Answered questions about implementation timeline."
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

export default LeadNotes;
