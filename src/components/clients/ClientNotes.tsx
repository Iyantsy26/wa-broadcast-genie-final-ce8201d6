
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";
import { CalendarClock, Send } from "lucide-react";
import { format } from "date-fns";
import { Client, ClientActivity } from "@/types/client";

interface ClientNotesProps {
  client: Client;
  onUpdateClient: (updatedClient: Client) => void;
}

const ClientNotes: React.FC<ClientNotesProps> = ({ client, onUpdateClient }) => {
  const [newNote, setNewNote] = useState("");
  
  const activities: ClientActivity[] = client.activities || [];
  
  const handleAddNote = () => {
    if (!newNote.trim()) return;
    
    const newActivity: ClientActivity = {
      id: crypto.randomUUID(),
      type: "note",
      content: newNote,
      timestamp: new Date().toISOString(),
      createdBy: "Current User"
    };
    
    const updatedActivities = [...activities, newActivity];
    
    const updatedClient = {
      ...client,
      activities: updatedActivities
    };
    
    onUpdateClient(updatedClient);
    setNewNote("");
    
    toast({
      title: "Note added",
      description: "Your note has been added to this client's history."
    });
  };
  
  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <Textarea
          placeholder="Add a note about this client..."
          value={newNote}
          onChange={(e) => setNewNote(e.target.value)}
          className="min-h-[100px]"
        />
        <Button onClick={handleAddNote} className="w-full sm:w-auto">
          <Send className="mr-2 h-4 w-4" />
          Add Note
        </Button>
      </div>
      
      <ScrollArea className="h-[300px] border rounded-md p-4">
        {activities && activities.length > 0 ? (
          <div className="space-y-4">
            {[...activities].reverse().map((activity) => (
              <div
                key={activity.id}
                className="border-b pb-3 last:border-0"
              >
                <div className="flex justify-between items-start">
                  <div className="font-medium flex items-center">
                    {activity.type === "note" && "Note Added"}
                    {activity.type === "status_change" && "Status Changed"}
                  </div>
                  <div className="text-sm text-muted-foreground flex items-center">
                    <CalendarClock className="h-3 w-3 mr-1" />
                    {format(new Date(activity.timestamp), "MMM d, yyyy h:mm a")}
                  </div>
                </div>
                <div className="mt-1 text-sm">
                  {activity.content}
                </div>
                <div className="mt-1 text-xs text-muted-foreground">
                  By {activity.createdBy}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            No activity yet. Add a note to get started.
          </div>
        )}
      </ScrollArea>
    </div>
  );
};

export default ClientNotes;
