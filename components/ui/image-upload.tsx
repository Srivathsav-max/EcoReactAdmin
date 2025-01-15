"use client";

import React, { useState } from 'react';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ImagePlus, Trash } from 'lucide-react';
import { toast } from "react-hot-toast";
import { getFilePreviewUrl } from '@/lib/appwrite-config';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
  onChangeUrl: (url: string, fileId: string) => void;
}

export const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value,
  onChangeUrl
}) => {
  const [isUploading, setIsUploading] = useState(false);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    try {
      setIsUploading(true);
      const file = e.target.files?.[0];
      if (!file) return;

      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Upload failed');
      }

      const data = await response.json();
      
      if (data.success && data.url && data.fileId) {
        onChangeUrl(data.url, data.fileId);
        toast.success('Image uploaded successfully');
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to upload image');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <div className="mb-4 flex items-center gap-4 flex-wrap">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button
                type="button"
                onClick={() => onRemove(url)}
                variant="destructive"
                size="sm"
              >
                <Trash className="h-4 w-4" />
              </Button>
            </div>
            <Image
              fill
              className="object-cover"
              alt="Image"
              src={url}
              unoptimized
              priority
            />
          </div>
        ))}
      </div>
      <Button
        type="button"
        disabled={disabled || isUploading}
        variant="secondary"
        onClick={() => document.getElementById('image-upload')?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        {isUploading ? 'Uploading...' : 'Upload an Image'}
      </Button>
      <input
        id="image-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={onUpload}
      />
    </div>
  );
};

export default ImageUpload;