
import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Plus, X, Edit, ExternalLink, MessageSquare, Phone } from "lucide-react";

export interface TemplateButton {
  id: string;
  type: 'url' | 'phone' | 'quick_reply';
  text: string;
  value?: string;
}

interface ButtonEditorProps {
  buttons: TemplateButton[];
  onChange: (buttons: TemplateButton[]) => void;
  maxButtons?: number;
}

export function ButtonEditor({ buttons, onChange, maxButtons = 3 }: ButtonEditorProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingButton, setEditingButton] = useState<TemplateButton | null>(null);
  const [buttonType, setButtonType] = useState<'url' | 'phone' | 'quick_reply'>('quick_reply');
  const [buttonText, setButtonText] = useState('');
  const [buttonValue, setButtonValue] = useState('');
  const [currentIndex, setCurrentIndex] = useState<number | null>(null);

  const generateId = () => Math.random().toString(36).substring(2, 9);

  const handleAddButton = () => {
    setEditingButton(null);
    setCurrentIndex(null);
    setButtonType('quick_reply');
    setButtonText('');
    setButtonValue('');
    setIsDialogOpen(true);
  };

  const handleEditButton = (button: TemplateButton, index: number) => {
    setEditingButton(button);
    setCurrentIndex(index);
    setButtonType(button.type);
    setButtonText(button.text);
    setButtonValue(button.value || '');
    setIsDialogOpen(true);
  };

  const handleRemoveButton = (index: number) => {
    const newButtons = [...buttons];
    newButtons.splice(index, 1);
    onChange(newButtons);
  };

  const handleSaveButton = () => {
    // Validate inputs
    if (!buttonText.trim()) {
      alert('Button text is required');
      return;
    }

    if ((buttonType === 'url' || buttonType === 'phone') && !buttonValue.trim()) {
      alert(`Please enter a valid ${buttonType === 'url' ? 'URL' : 'phone number'}`);
      return;
    }

    if (buttonType === 'url' && !buttonValue.startsWith('http')) {
      alert('URL must start with http:// or https://');
      return;
    }

    // Create or update button
    const button: TemplateButton = {
      id: editingButton?.id || generateId(),
      type: buttonType,
      text: buttonText,
      value: buttonType !== 'quick_reply' ? buttonValue : undefined
    };

    const newButtons = [...buttons];
    
    if (currentIndex !== null) {
      // Update existing button
      newButtons[currentIndex] = button;
    } else {
      // Add new button
      newButtons.push(button);
    }

    onChange(newButtons);
    setIsDialogOpen(false);
  };

  const getButtonIcon = (type: string) => {
    switch(type) {
      case 'url': return <ExternalLink className="h-4 w-4" />;
      case 'phone': return <Phone className="h-4 w-4" />;
      case 'quick_reply': return <MessageSquare className="h-4 w-4" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        {buttons.map((button, index) => (
          <div key={button.id} className="rounded-md border p-3">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-2">
                {getButtonIcon(button.type)}
                <div>
                  <div className="font-medium text-sm">{button.text}</div>
                  {button.value && (
                    <div className="text-xs text-muted-foreground">{button.value}</div>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={() => handleEditButton(button, index)}>
                  <Edit className="h-4 w-4" />
                </Button>
                <Button variant="ghost" size="icon" onClick={() => handleRemoveButton(index)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {buttons.length < maxButtons && (
        <Button 
          variant="outline" 
          size="sm" 
          onClick={handleAddButton} 
          className="w-full"
        >
          <Plus className="h-4 w-4 mr-2" /> Add Button
        </Button>
      )}

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>
              {editingButton ? 'Edit Button' : 'Add Button'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Button Type</Label>
              <RadioGroup value={buttonType} onValueChange={(value) => setButtonType(value as any)}>
                <div className="flex flex-col space-y-2">
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="quick_reply" id="quick_reply" />
                    <Label htmlFor="quick_reply" className="flex items-center">
                      <MessageSquare className="h-4 w-4 mr-2" /> Quick Reply
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="url" id="url" />
                    <Label htmlFor="url" className="flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2" /> URL
                    </Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="phone" id="phone" />
                    <Label htmlFor="phone" className="flex items-center">
                      <Phone className="h-4 w-4 mr-2" /> Phone Number
                    </Label>
                  </div>
                </div>
              </RadioGroup>
            </div>
            <div className="space-y-2">
              <Label htmlFor="button-text">Button Text</Label>
              <Input 
                id="button-text" 
                value={buttonText} 
                onChange={(e) => setButtonText(e.target.value)} 
                maxLength={25}
                placeholder="Enter button text (max 25 characters)"
              />
            </div>
            {buttonType !== 'quick_reply' && (
              <div className="space-y-2">
                <Label htmlFor="button-value">
                  {buttonType === 'url' ? 'URL' : 'Phone Number'}
                </Label>
                <Input 
                  id="button-value" 
                  value={buttonValue} 
                  onChange={(e) => setButtonValue(e.target.value)} 
                  placeholder={buttonType === 'url' ? 'https://example.com' : '+1234567890'}
                  type={buttonType === 'phone' ? 'tel' : 'text'}
                />
              </div>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSaveButton}>Save Button</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
