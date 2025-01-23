"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { uploadFile, getFilePreviewUrl, deleteFile } from "@/lib/appwrite-config";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (url: string) => void;
  value: string[];
}

const ImageUpload = ({
  disabled,
  onChange,
  onRemove,
  value
}: ImageUploadProps) => {
  const [isMounted, setIsMounted] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      if (!e.target.files || !e.target.files[0]) return;

      setIsUploading(true);
      const file = e.target.files[0];
      
      // Upload file and get file ID
      const fileId = await uploadFile(file);
      
      // Get preview URL
      const fileUrl = await getFilePreviewUrl(fileId);

      onChange(fileUrl);
      toast.success("Image uploaded successfully");
    } catch (error) {
      console.error('Error uploading image:', error);
      toast.error("Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = async (url: string) => {
    try {
      // Extract fileId from URL
      const urlParts = url.split('/');
      const fileId = urlParts[urlParts.length - 1];
      
      await deleteFile(fileId);
      onRemove(url);
      toast.success("Image removed successfully");
    } catch (error) {
      console.error('Error removing image:', error);
      toast.error("Failed to remove image. Please try again.");
    }
  };

  if (!isMounted) {
    return <div />;
  }

  return (
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-lg overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => handleRemove(url)}
                variant="destructive"
                size="sm"
                disabled={disabled || isUploading}
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
            />
          </div>
        ))}
      </div>
      <div>
        <input
          type="file"
          accept="image/*"
          className="hidden"
          id="image-upload"
          onChange={onUpload}
          disabled={disabled || isUploading}
        />
        <label 
          htmlFor="image-upload"
          className="cursor-pointer"
        >
          <Button 
            type="button" 
            disabled={disabled || isUploading} 
            variant="secondary"
            className="w-full"
          >
            <ImagePlus className="h-4 w-4 mr-2" />
            {isUploading ? "Uploading..." : "Upload an Image"}
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;