"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { Check, ChevronsUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Category {
  id: string;
  name: string;
}

interface CategoriesConfigProps {
  form: UseFormReturn<any>;
  categories: Category[];
}

const displayStyles = [
  { value: "grid", label: "Grid" },
  { value: "list", label: "List" },
  { value: "carousel", label: "Carousel" },
];

export const CategoriesConfig = ({
  form,
  categories
}: CategoriesConfigProps) => {
  const [open, setOpen] = useState(false);
  const selectedIds = form.watch("config.categoryIds") || [];

  const selectedCategories = categories.filter(category => 
    selectedIds.includes(category.id)
  );

  const handleSelect = (categoryId: string) => {
    const currentIds = form.getValues("config.categoryIds") || [];
    const newIds = currentIds.includes(categoryId)
      ? currentIds.filter((id: string) => id !== categoryId)
      : [...currentIds, categoryId];
    
    form.setValue("config.categoryIds", newIds);
  };

  return (
    <div className="space-y-4">
      <FormField
        control={form.control}
        name="config.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Section Title</FormLabel>
            <FormControl>
              <Input placeholder="Shop by Category" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Categories</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedCategories.length > 0
                    ? `${selectedCategories.length} categories selected`
                    : "Select categories..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search categories..." />
                  <CommandEmpty>No categories found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {categories.map(category => (
                      <CommandItem
                        key={category.id}
                        value={category.id}
                        onSelect={() => handleSelect(category.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIds.includes(category.id) 
                              ? "opacity-100" 
                              : "opacity-0"
                          )}
                        />
                        {category.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedCategories.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedCategories.map(category => (
                <Badge
                  key={category.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleSelect(category.id)}
                >
                  {category.name}
                  <Check className="ml-1 h-3 w-3" />
                </Badge>
              ))}
            </div>
          )}
        </div>
      </Card>

      <div className="grid grid-cols-2 gap-4">
        <FormField
          control={form.control}
          name="config.displayStyle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Display Style</FormLabel>
              <Select 
                value={field.value} 
                onValueChange={field.onChange}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue placeholder="Select display style" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {displayStyles.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="config.itemsPerRow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items per Row</FormLabel>
              <FormControl>
                <Input 
                  type="number"
                  min={2}
                  max={6}
                  placeholder="4"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};