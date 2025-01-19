"use client";

import { useState } from "react";
import { Check, ChevronDown, ChevronRight } from "lucide-react";
import { Taxonomy, Taxon } from "@prisma/client";
import { cn } from "@/lib/utils";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";

interface TaxonPickerProps {
  taxonomies: (Taxonomy & {
    taxons: (Taxon & {
      children?: Taxon[];
    })[];
  })[];
  value: string[];
  onChange: (value: string[]) => void;
  disabled?: boolean;
}

export const TaxonPicker: React.FC<TaxonPickerProps> = ({
  taxonomies,
  value,
  onChange,
  disabled
}) => {
  const [open, setOpen] = useState(false);

  const renderTaxonGroup = (taxon: Taxon & { children?: Taxon[] }, level = 0) => {
    if (!taxon) return null;
    const isSelected = value.includes(taxon.id);
    const hasChildren = taxon.children && taxon.children.length > 0;
    
    return (
      <div key={taxon.id}>
        <CommandItem
          className={cn("pl-[calc(12px_*_var(--level))]", { "pl-6": level === 0 })}
          style={{ "--level": level } as any}
          onSelect={() => {
            if (isSelected) {
              onChange(value.filter(id => id !== taxon.id));
            } else {
              onChange([...value, taxon.id]);
            }
          }}
        >
          <div className="flex items-center">
            {hasChildren && <ChevronRight className="mr-2 h-4 w-4" />}
            <Check
              className={cn(
                "mr-2 h-4 w-4",
                isSelected ? "opacity-100" : "opacity-0"
              )}
            />
            {taxon.name}
          </div>
        </CommandItem>
        {hasChildren && taxon.children.map(child => 
          renderTaxonGroup(child, level + 1)
        )}
      </div>
    );
  };

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {value.length > 0
            ? `${value.length} categories selected`
            : "Select categories..."}
          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandEmpty>No category found.</CommandEmpty>
          {taxonomies.map(taxonomy => (
            <CommandGroup key={taxonomy.id} heading={taxonomy.name}>
              {taxonomy.taxons.map(taxon => renderTaxonGroup(taxon))}
            </CommandGroup>
          ))}
        </Command>
      </PopoverContent>
    </Popover>
  );
};