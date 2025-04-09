
import React, { useState, useRef, useEffect } from 'react';
import { Check, Search, ChevronDown } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { languages, Language } from '@/utils/languages';
import { ScrollArea } from "@/components/ui/scroll-area";

interface LanguageSelectorProps {
  value: string;
  onValueChange: (value: string) => void;
}

export function LanguageSelector({ value, onValueChange }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  const selectedLanguage = languages.find((lang) => lang.code === value);
  
  const filteredLanguages = searchQuery === "" 
    ? languages 
    : languages.filter((lang) => 
        lang.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        (lang.nativeName && lang.nativeName.toLowerCase().includes(searchQuery.toLowerCase()))
      );

  useEffect(() => {
    if (open && inputRef.current) {
      // Focus the search input when popover opens
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }, [open]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedLanguage ? selectedLanguage.name : "Select language..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[300px] p-0">
        <Command shouldFilter={false}>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <CommandInput 
              ref={inputRef}
              placeholder="Search languages..." 
              value={searchQuery} 
              onValueChange={setSearchQuery} 
              className="h-9 border-none focus:ring-0"
            />
          </div>
          <CommandEmpty>No language found.</CommandEmpty>
          <ScrollArea className="h-[300px]">
            <CommandGroup>
              {filteredLanguages.map((language) => (
                <CommandItem
                  key={language.code}
                  value={language.code}
                  onSelect={(currentValue) => {
                    onValueChange(currentValue);
                    setOpen(false);
                  }}
                >
                  <div className="flex flex-1 items-start flex-col">
                    <span>{language.name}</span>
                    {language.nativeName && (
                      <span className="text-xs text-muted-foreground">{language.nativeName}</span>
                    )}
                  </div>
                  <Check
                    className={`ml-auto h-4 w-4 ${language.code === value ? "opacity-100" : "opacity-0"}`}
                  />
                </CommandItem>
              ))}
            </CommandGroup>
          </ScrollArea>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
