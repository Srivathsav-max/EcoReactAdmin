"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductVariantsProps } from "./types";

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  loading,
  form,
  colors,
  sizes,
}) => {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="hasVariants"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-8">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Has Variants</FormLabel>
              <FormDescription>
                Enable this if the product comes in different variations
              </FormDescription>
            </div>
          </FormItem>
        )}
      />
      
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2">
        <FormField
          control={form.control}
          name="colorId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Color</FormLabel>
              <Select 
                disabled={loading} 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue="" placeholder="Select a color" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {colors.map((color) => (
                    <SelectItem key={color.id} value={color.id}>
                      <div className="flex items-center gap-x-2">
                        <div 
                          className="h-4 w-4 rounded-full border" 
                          style={{ backgroundColor: color.value }}
                        />
                        {color.name}
                      </div>
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
          name="sizeId"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Size</FormLabel>
              <Select 
                disabled={loading} 
                onValueChange={field.onChange} 
                value={field.value || ""} 
                defaultValue={field.value || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue defaultValue="" placeholder="Select a size" />
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>
                      {size.name} ({size.value})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>
    </div>
  );
};