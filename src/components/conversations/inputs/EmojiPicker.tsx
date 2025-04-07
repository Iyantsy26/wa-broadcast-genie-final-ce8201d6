
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SmilePlus } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  const commonEmojis = [
    '😀', '😂', '😊', '❤️', '👍', '👌', 
    '🙏', '🎉', '🤔', '🔥', '👏', '💯',
    '😍', '🤗', '😢', '😎', '👋', '💪'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <SmilePlus className="h-5 w-5 text-muted-foreground" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-2" align="start" sideOffset={5}>
        <div className="grid grid-cols-6 gap-2">
          {commonEmojis.map((emoji, index) => (
            <button
              key={index}
              onClick={() => onEmojiSelect(emoji)}
              className="w-8 h-8 flex items-center justify-center hover:bg-gray-100 rounded"
            >
              {emoji}
            </button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
};

export default EmojiPicker;
