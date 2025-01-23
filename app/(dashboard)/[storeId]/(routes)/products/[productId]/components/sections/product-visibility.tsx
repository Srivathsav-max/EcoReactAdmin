"use client";

import { FormField, FormItem, FormLabel, FormControl, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { ProductVisibilityProps } from "./types";

export const ProductVisibility: React.FC<ProductVisibilityProps> = ({
  loading,
  form,
}) => {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="isVisible"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Visible</FormLabel>
              <FormDescription>
                This product will appear in the store
              </FormDescription>
            </div>
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="tags"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Tags</FormLabel>
            <FormControl>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {field.value.map((tag, index) => (
                    <Badge 
                      key={index}
                      variant="outline"
                      className="flex items-center gap-1"
                    >
                      {tag}
                      <button
                        type="button"
                        onClick={() => {
                          const newTags = [...field.value];
                          newTags.splice(index, 1);
                          field.onChange(newTags);
                        }}
                        className="text-muted-foreground hover:text-foreground rounded-full"
                      >
                        <X className="h-3 w-3" />
                      </button>
                    </Badge>
                  ))}
                </div>
                <Input
                  disabled={loading}
                  placeholder="Type a tag and press enter"
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      const input = e.currentTarget;
                      const newTag = input.value.trim();
                      
                      if (newTag && !field.value.includes(newTag)) {
                        const updatedTags = [...field.value, newTag];
                        field.onChange(updatedTags);
                        input.value = '';
                      }
                    }
                  }}
                />
              </div>
            </FormControl>
            <FormDescription>
              Press enter to add a tag. Tags help with product categorization and search.
            </FormDescription>
          </FormItem>
        )}
      />
    </div>
  );
};