
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Plus, Edit, Trash, ArrowUp, ArrowDown } from "lucide-react";

export interface TemplateButton {
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  value?: string; // URL for url type, phone number for phone type, text for quick_reply
}

interface ButtonEditorProps {
  buttons: TemplateButton[];
  onChange: (buttons: TemplateButton[]) => void;
  maxButtons?: number;
}

export function ButtonEditor({
  buttons,
  onChange,
  maxButtons = 3
}: ButtonEditorProps) {
  const [currentButton, setCurrentButton] = useState<TemplateButton | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [editIndex, setEditIndex] = useState<number>(-1);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleAddButton = () => {
    if (buttons.length >= maxButtons) return;
    
    setIsEditMode(false);
    setCurrentButton({ type: 'quick_reply', text: '', value: '' });
    setDialogOpen(true);
  };

  const handleEditButton = (index: number) => {
    setIsEditMode(true);
    setEditIndex(index);
    setCurrentButton({ ...buttons[index] });
    setDialogOpen(true);
  };

  const handleDeleteButton = (index: number) => {
    const newButtons = [...buttons];
    newButtons.splice(index, 1);
    onChange(newButtons);
  };

  const handleMoveButton = (index: number, direction: 'up' | 'down') => {
    if (
      (direction === 'up' && index === 0) || 
      (direction === 'down' && index === buttons.length - 1)
    ) {
      return;
    }

    const newButtons = [...buttons];
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    
    // Swap positions
    [newButtons[index], newButtons[newIndex]] = [newButtons[newIndex], newButtons[index]];
    
    onChange(newButtons);
  };

  const handleSaveButton = () => {
    if (!currentButton || !currentButton.text) return;

    // Validate button data
    if (currentButton.type === 'url' && (!currentButton.value || !currentButton.value.startsWith('http'))) {
      return;
    }
    
    if (currentButton.type === 'phone' && (!currentButton.value || !currentButton.value.startsWith('+'))) {
      return;
    }

    const newButtons = [...buttons];
    
    if (isEditMode && editIndex > -1) {
      newButtons[editIndex] = currentButton;
    } else {
      newButtons.push(currentButton);
    }
    
    onChange(newButtons);
    setDialogOpen(false);
    setCurrentButton(null);
  };

  const renderButtonTypeOptions = () => {
    // Different types allowed based on button position
    const position = isEditMode ? editIndex : buttons.length;
    
    // WhatsApp rules: First two buttons can be any type, third must be quick_reply
    if (position === 2) {
      return (
        <SelectItem value="quick_reply">Quick Reply</SelectItem>
      );
    }

    return (
      <>
        <SelectItem value="url">URL Button</SelectItem>
        <SelectItem value="phone">Phone Button</SelectItem>
        <SelectItem value="quick_reply">Quick Reply</SelectItem>
      </>
    );
  };

  return (
    <div className="space-y-3">
      {buttons.length === 0 ? (
        <div className="text-center p-6 border border-dashed rounded-md">
          <p className="text-sm text-muted-foreground">No buttons added yet</p>
        </div>
      ) : (
        <div className="space-y-2">
          {buttons.map((button, index) => (
            <div 
              key={index} 
              className="flex items-center justify-between p-3 border rounded-md group"
            >
              <div className="flex-1">
                <div className="font-medium">{button.text}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <span className="capitalize">{button.type.replace('_', ' ')}</span>
                  {button.value && (
                    <>
                      <span>•</span>
                      <span className="truncate max-w-[150px]">{button.value}</span>
                    </>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={() => handleMoveButton(index, 'up')}
                  disabled={index === 0}
                >
                  <ArrowUp className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 opacity-0 group-hover:opacity-100"
                  onClick={() => handleMoveButton(index, 'down')}
                  disabled={index === buttons.length - 1}
                >
                  <ArrowDown className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8"
                  onClick={() => handleEditButton(index)}
                >
                  <Edit className="h-4 w-4" />
                </Button>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-500 hover:text-red-600 hover:bg-red-50"
                  onClick={() => handleDeleteButton(index)}
                >
                  <Trash className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
      
      {buttons.length < maxButtons && (
        <Button 
          variant="outline" 
          size="sm" 
          className="w-full mt-2" 
          onClick={handleAddButton}
        >
          <Plus className="h-4 w-4 mr-1" />
          Add Button
        </Button>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{isEditMode ? 'Edit Button' : 'Add Button'}</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="button-type">Button Type</Label>
              <Select
                value={currentButton?.type || 'quick_reply'}
                onValueChange={(value: 'url' | 'phone' | 'quick_reply') => 
                  setCurrentButton(prev => prev ? { ...prev, type: value } : null)
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select button type" />
                </SelectTrigger>
                <SelectContent>
                  {renderButtonTypeOptions()}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                {currentButton?.type === 'url' ? 'Opens a URL when clicked' : 
                 currentButton?.type === 'phone' ? 'Initiates a phone call' : 
                 'Sends a quick response message'}
              </p>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input
                id="button-text"
                maxLength={20}
                value={currentButton?.text || ''}
                onChange={(e) => 
                  setCurrentButton(prev => prev ? { ...prev, text: e.target.value } : null)
                }
                placeholder="e.g., Learn More"
              />
              <p className="text-xs text-muted-foreground">
                Maximum 20 characters
              </p>
            </div>
            
            {currentButton?.type === 'url' && (
              <div className="space-y-2">
                <Label htmlFor="button-url">URL</Label>
                <Input
                  id="button-url"
                  type="url"
                  value={currentButton?.value || ''}
                  onChange={(e) => 
                    setCurrentButton(prev => prev ? { ...prev, value: e.target.value } : null)
                  }
                  placeholder="https://example.com"
                />
              </div>
            )}
            
            {currentButton?.type === 'phone' && (
              <div className="space-y-2">
                <Label htmlFor="button-phone">Phone Number</Label>
                <Input
                  id="button-phone"
                  value={currentButton?.value || ''}
                  onChange={(e) => 
                    setCurrentButton(prev => prev ? { ...prev, value: e.target.value } : null)
                  }
                  placeholder="+1234567890"
                />
                <p className="text-xs text-muted-foreground">
                  Include country code with + prefix
                </p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSaveButton}>
              Save
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
