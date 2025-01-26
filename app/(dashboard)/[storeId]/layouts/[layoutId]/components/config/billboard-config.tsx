"use client";

import { FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { UseFormReturn } from "react-hook-form";
import ImageUpload from "@/components/ui/image-upload";
import { useState } from "react";
import { toast } from "react-hot-toast";

interface BillboardConfigProps {
  form: UseFormReturn<any>;
}

export const BillboardConfig = ({
  form
}: BillboardConfigProps) => {
  const [uploading, setUploading] = useState(false);

  const handleImageChange = (url: string) => {
    form.setValue("config.imageUrl", url);
    // Extract fileId from the Appwrite URL
    const urlParts = url.split('/');
    const newFileId = urlParts[urlParts.length - 1];
    form.setValue("config.fileId", newFileId);
  };

  const handleImageRemove = (url: string) => {
    form.setValue("config.imageUrl", "");
    form.setValue("config.fileId", "");
  };

  // Get current image URL from form
  const currentImageUrl = form.watch("config.imageUrl") || "";

  return (
    <div className="space-y-4">
      <Card className="p-4">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="config.label"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Label</FormLabel>
                <FormControl>
                  <Input placeholder="New Collection" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div>
            <FormLabel>Background Image</FormLabel>
            <div className="mt-2">
              <ImageUpload 
                value={currentImageUrl ? [currentImageUrl] : []}
                disabled={uploading}
                onChange={handleImageChange}
                onRemove={handleImageRemove}
              />
            </div>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <h3 className="text-sm font-medium mb-4">Call to Action</h3>
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="config.callToAction.text"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Button Text</FormLabel>
                <FormControl>
                  <Input placeholder="Shop Now" {...field} />
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
                <FormLabel>Button Link</FormLabel>
                <FormControl>
                  <Input placeholder="/collections/new-arrivals" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </Card>
    </div>
  );
};