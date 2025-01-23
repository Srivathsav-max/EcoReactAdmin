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
import { useState } from "react";
import { UseFormReturn } from "react-hook-form";

interface Product {
  id: string;
  name: string;
  price: number;
}

interface ProductsConfigProps {
  form: UseFormReturn<any>;
  type: string;
  products: Product[];
}

export const ProductsConfig = ({
  form,
  type,
  products
}: ProductsConfigProps) => {
  const [open, setOpen] = useState(false);
  const selectedIds = form.watch("config.productIds") || [];

  const selectedProducts = products.filter(product => 
    selectedIds.includes(product.id)
  );

  const handleSelect = (productId: string) => {
    const currentIds = form.getValues("config.productIds") || [];
    const newIds = currentIds.includes(productId)
      ? currentIds.filter((id: string) => id !== productId)
      : [...currentIds, productId];
    
    form.setValue("config.productIds", newIds);
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
              <Input placeholder="Featured Products" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />

      <Card className="p-4">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Select Products</Label>
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  role="combobox"
                  aria-expanded={open}
                  className="w-full justify-between"
                >
                  {selectedProducts.length > 0
                    ? `${selectedProducts.length} products selected`
                    : "Select products..."}
                  <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-full p-0" align="start">
                <Command>
                  <CommandInput placeholder="Search products..." />
                  <CommandEmpty>No products found.</CommandEmpty>
                  <CommandGroup className="max-h-64 overflow-auto">
                    {products.map(product => (
                      <CommandItem
                        key={product.id}
                        value={product.id}
                        onSelect={() => handleSelect(product.id)}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            selectedIds.includes(product.id) 
                              ? "opacity-100" 
                              : "opacity-0"
                          )}
                        />
                        {product.name}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </Command>
              </PopoverContent>
            </Popover>
          </div>

          {selectedProducts.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {selectedProducts.map(product => (
                <Badge
                  key={product.id}
                  variant="secondary"
                  className="cursor-pointer"
                  onClick={() => handleSelect(product.id)}
                >
                  {product.name}
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
          name="config.maxItems"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Max Items</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1}
                  placeholder="8"
                  {...field}
                  onChange={e => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {type === "products-grid" && (
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
        )}
      </div>
    </div>
  );
};