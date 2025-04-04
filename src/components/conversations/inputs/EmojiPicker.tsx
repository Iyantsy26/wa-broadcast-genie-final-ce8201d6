
import React from 'react';
import { Button } from "@/components/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Smile } from 'lucide-react';

interface EmojiPickerProps {
  onEmojiSelect: (emoji: string) => void;
}

const EmojiPicker: React.FC<EmojiPickerProps> = ({ onEmojiSelect }) => {
  // Expanded emoji selection
  const emojis = [
    '😀', '😂', '😊', '😍', '🥰', '😘', '😎', '👍', '🙏', '❤️', 
    '🔥', '⭐', '🎉', '✅', '🤔', '👏', '🌟', '💯', '🤣', '😢',
    '👌', '🙌', '💪', '🤝', '😉', '🥳', '😇', '💭', '💬', '🚀'
  ];

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon">
          <Smile className="h-5 w-5" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-64 p-2">
        <div className="grid grid-cols-10 gap-1">
          {emojis.map((emoji, index) => (
            <button
              key={index}
              className="h-7 w-7 flex items-center justify-center hover:bg-gray-100 rounded"
              onClick={() => onEmojiSelect(emoji)}
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
