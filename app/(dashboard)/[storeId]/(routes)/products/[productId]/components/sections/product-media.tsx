"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import ImageUpload from "@/components/ui/image-upload";
import { ProductMediaProps } from "./types";
import { deleteFile } from "@/lib/appwrite-config";

export const ProductMedia: React.FC<ProductMediaProps> = ({
  loading,
  form,
}) => {
  return (
    <FormField
      control={form.control}
      name="images"
      render={({ field }) => (
        <FormItem>
          <FormLabel>Product Images</FormLabel>
          <FormControl>
            <div className="mb-4">
              <ImageUpload 
                value={field.value.map(image => image.url)} 
                disabled={loading} 
                onChange={async (url) => {
                  // API response includes both url and fileId
                  const urlParts = url.split('/');
                  const fileId = urlParts[urlParts.length - 1];
                  
                  const newImage = {
                    url: `/api/image-proxy/${fileId}`,
                    fileId,
                  };
                  field.onChange([...field.value, newImage]);
                }}
                onRemove={async (url) => {
                  // Extract fileId from URL for deletion
                  const urlParts = url.split('/');
                  const fileId = urlParts[urlParts.length - 1];
                  
                  try {
                    // Delete from Appwrite storage
                    await deleteFile(fileId);
                    
                    // Remove from form state
                    const filteredImages = field.value.filter(
                      current => current.url !== url
                    );
                    field.onChange(filteredImages);
                  } catch (error) {
                    console.error('Error removing image:', error);
                    // Keep the image in the form state if deletion fails
                  }
                }}
              />
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
};