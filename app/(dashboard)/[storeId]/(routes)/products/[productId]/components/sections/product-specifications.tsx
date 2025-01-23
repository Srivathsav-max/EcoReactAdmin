"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem } from "@/components/ui/command";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { ProductSpecificationsProps } from "./types";

export const ProductSpecifications: React.FC<ProductSpecificationsProps> = ({
  loading,
  form,
  taxonomies,
}) => {
  return (
    <>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-4">
        <FormField
          control={form.control}
          name="weight"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Weight (kg)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="height"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Height (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="width"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Width (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="depth"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Depth (cm)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.1" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="grid grid-cols-1 gap-8 md:grid-cols-3 mt-8">
        <FormField
          control={form.control}
          name="minimumQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Minimum Order Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  disabled={loading} 
                  min={1} 
                  {...field}
                  value={field.value || 1}
                  onChange={(e) => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="maximumQuantity"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Maximum Order Quantity</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  disabled={loading} 
                  min={1} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="taxRate"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Tax Rate (%)</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  step="0.01" 
                  disabled={loading} 
                  {...field}
                  value={field.value || ''}
                  onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      <div className="mt-8">
        <FormField
          control={form.control}
          name="taxons"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Categories</FormLabel>
              <Popover>
                <PopoverTrigger asChild>
                  <FormControl>
                    <div
                      className={cn(
                        "w-full border rounded-md p-2 min-h-[42px] flex flex-wrap gap-1",
                        !field.value?.length && "text-muted-foreground"
                      )}
                    >
                      {field.value?.length ? (
                        field.value.map((taxonId) => {
                          // Find the taxon across all taxonomies
                          let taxonName = "";
                          let taxonomyName = "";
                          for (const taxonomy of taxonomies) {
                            const taxon = taxonomy.taxons.find(t => t.id === taxonId);
                            if (taxon) {
                              taxonName = taxon.name;
                              taxonomyName = taxonomy.name;
                              break;
                            }
                          }
                          return (
                            <Badge
                              key={taxonId}
                              variant="outline"
                              className="flex items-center gap-1"
                            >
                              {taxonomyName}: {taxonName}
                              <button
                                type="button"
                                className="ml-1 ring-offset-background rounded-full outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    field.onChange(field.value.filter((id) => id !== taxonId));
                                  }
                                }}
                                onClick={() => {
                                  field.onChange(field.value.filter((id) => id !== taxonId));
                                }}
                              >
                                <X className="h-3 w-3" />
                              </button>
                            </Badge>
                          );
                        })
                      ) : (
                        "Select categories..."
                      )}
                    </div>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <Command>
                    <CommandInput placeholder="Search categories..." />
                    <CommandEmpty>No categories found.</CommandEmpty>
                    {taxonomies.map((taxonomy) => (
                      <CommandGroup key={taxonomy.id} heading={taxonomy.name}>
                        {taxonomy.taxons.map((taxon) => {
                          const isSelected = field.value?.includes(taxon.id);
                          return (
                            <CommandItem
                              key={taxon.id}
                              onSelect={() => {
                                if (isSelected) {
                                  field.onChange(field.value.filter((id) => id !== taxon.id));
                                } else {
                                  field.onChange([...(field.value || []), taxon.id]);
                                }
                              }}
                            >
                              <div
                                className={cn(
                                  "mr-2 flex h-4 w-4 items-center justify-center rounded-sm border border-primary",
                                  isSelected
                                    ? "bg-primary text-primary-foreground"
                                    : "opacity-50 [&_svg]:invisible"
                                )}
                              >
                                <X className={cn("h-4 w-4", isSelected ? "opacity-100" : "opacity-0")} />
                              </div>
                              {taxon.name}
                            </CommandItem>
                          );
                        })}
                      </CommandGroup>
                    ))}
                  </Command>
                </PopoverContent>
              </Popover>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </>
  );
};