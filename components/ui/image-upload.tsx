"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ImagePlus, Trash } from "lucide-react";
import { storage } from "@/lib/appwrite-config";
import { ID } from "appwrite";
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
}: ImageUploadProps): React.ReactElement => {
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
      
      const result = await storage.createFile(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        ID.unique(),
        file
      );

      const fileUrl = storage.getFileView(
        process.env.NEXT_PUBLIC_APPWRITE_BUCKET_ID!,
        result.$id
      ).toString();

      onChange(fileUrl);
    } catch (error) {
      console.error('Error uploading image:', error);
    } finally {
      setIsUploading(false);
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
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
                disabled={disabled}
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
            Upload an Image
          </Button>
        </label>
      </div>
    </div>
  );
};

export default ImageUpload;