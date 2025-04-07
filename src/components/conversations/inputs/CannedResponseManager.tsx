
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { PencilLine, Plus, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface CannedResponse {
  id: string;
  title: string;
  content: string;
}

interface CannedResponseManagerProps {
  isOpen: boolean;
  onClose: () => void;
  initialResponses: CannedResponse[];
  onSave: (responses: CannedResponse[]) => void;
}

const CannedResponseManager: React.FC<CannedResponseManagerProps> = ({
  isOpen,
  onClose,
  initialResponses,
  onSave
}) => {
  const [responses, setResponses] = useState<CannedResponse[]>(initialResponses);
  const [currentResponse, setCurrentResponse] = useState<CannedResponse | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const handleAddNew = () => {
    setCurrentResponse({
      id: `new-${Date.now()}`,
      title: '',
      content: ''
    });
    setIsEditing(true);
  };
  
  const handleEdit = (response: CannedResponse) => {
    setCurrentResponse({...response});
    setIsEditing(true);
  };
  
  const handleDelete = (id: string) => {
    setResponses(responses.filter(r => r.id !== id));
  };
  
  const handleSaveResponse = () => {
    if (!currentResponse?.title || !currentResponse?.content) return;
    
    // Check if this is an edit or new response
    const exists = responses.some(r => r.id === currentResponse.id);
    
    if (exists) {
      setResponses(responses.map(r => 
        r.id === currentResponse.id ? currentResponse : r
      ));
    } else {
      setResponses([...responses, currentResponse]);
    }
    
    setCurrentResponse(null);
    setIsEditing(false);
  };
  
  const handleSaveAll = () => {
    onSave(responses);
    onClose();
  };
  
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl h-[80vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Manage Canned Responses</DialogTitle>
          <DialogDescription>
            Create and edit quick reply templates to use in conversations
          </DialogDescription>
        </DialogHeader>
        
        {isEditing ? (
          <div className="flex-1 overflow-auto py-4 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="response-title">Response Title</Label>
              <Input 
                id="response-title"
                value={currentResponse?.title || ''}
                onChange={(e) => setCurrentResponse(prev => 
                  prev ? {...prev, title: e.target.value} : null
                )}
                placeholder="E.g., Welcome Message, Payment Information"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="response-content">Response Content</Label>
              <Textarea 
                id="response-content"
                value={currentResponse?.content || ''}
                onChange={(e) => setCurrentResponse(prev => 
                  prev ? {...prev, content: e.target.value} : null
                )}
                placeholder="Write your canned response text here..."
                className="min-h-[250px]"
              />
            </div>
            
            <div className="flex justify-end space-x-2 pt-4">
              <Button
                variant="outline"
                onClick={() => {
                  setCurrentResponse(null);
                  setIsEditing(false);
                }}
              >
                Cancel
              </Button>
              <Button onClick={handleSaveResponse}>
                Save Response
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex-1 overflow-auto py-4">
            <div className="flex justify-end mb-4">
              <Button onClick={handleAddNew} className="flex items-center gap-1">
                <Plus className="h-4 w-4" />
                <span>New Response</span>
              </Button>
            </div>
            
            {responses.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">No canned responses yet</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Click "New Response" to create one
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {responses.map((response) => (
                  <div key={response.id} className="rounded-md border p-3">
                    <div className="flex justify-between items-start">
                      <h4 className="font-medium">{response.title}</h4>
                      <div className="flex space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEdit(response)}
                        >
                          <PencilLine className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(response.id)}
                        >
                          <Trash2 className="h-4 w-4 text-red-500" />
                        </Button>
                      </div>
                    </div>
                    <Separator className="my-2" />
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {response.content}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
        
        {!isEditing && (
          <DialogFooter>
            <Button variant="outline" onClick={onClose}>Cancel</Button>
            <Button onClick={handleSaveAll}>Save All Changes</Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default CannedResponseManager;
