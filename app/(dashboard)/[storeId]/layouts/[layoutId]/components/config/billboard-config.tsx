"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { ImagePlus } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

interface BillboardConfigProps {
  form: UseFormReturn<any>;
}

export const BillboardConfig: React.FC<BillboardConfigProps> = ({
  form
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="config.label"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Label</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.imageUrl"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Image URL</FormLabel>
            <FormControl>
              <div className="flex gap-x-2">
                <Input {...field} />
                <Button
                  type="button"
                  onClick={() => {
                    // TODO: Implement image upload
                  }}
                >
                  <ImagePlus className="h-4 w-4" />
                </Button>
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.callToAction.text"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call to Action Text</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.callToAction.link"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Call to Action Link</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}