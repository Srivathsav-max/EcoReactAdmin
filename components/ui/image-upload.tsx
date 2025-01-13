"use client";

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { ImagePlus, Trash } from 'lucide-react';
import { storage, ID } from '@/lib/appwrite-config';

interface ImageUploadProps {
  disabled?: boolean;
  onChange: (value: string) => void;
  onRemove: (value: string) => void;
  value: string[];
}

const ImageUpload: React.FC<ImageUploadProps> = ({
  disabled,
  onChange,
  onRemove,
  value
}) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const onUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || !e.target.files[0]) return;

    try {
      const file = e.target.files[0];
      const fileId = ID.unique();
      
      await storage.createFile(
        '678491cc0018813ad930',
        fileId,
        file
      );

      // Construct the direct file URL
      const fileUrl = `https://cloud.appwrite.io/v1/storage/buckets/678491cc0018813ad930/files/${fileId}/view`;

      onChange(fileUrl);
    } catch (error) {
      console.error('Error uploading file:', error);
    }
  };

  if (!isMounted) {
    return null;
  }

  return ( 
    <div>
      <div className="mb-4 flex items-center gap-4">
        {value.map((url) => (
          <div key={url} className="relative w-[200px] h-[200px] rounded-md overflow-hidden">
            <div className="z-10 absolute top-2 right-2">
              <Button type="button" onClick={() => onRemove(url)} variant="destructive" size="sm">
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
      <Button 
        type="button" 
        disabled={disabled} 
        variant="secondary" 
        onClick={() => document.getElementById('file-upload')?.click()}
      >
        <ImagePlus className="h-4 w-4 mr-2" />
        Upload an Image
      </Button>
      <input
        id="file-upload"
        type="file"
        accept="image/*"
        onChange={onUpload}
        style={{ display: 'none' }}
      />
    </div>
  );
}
 
export default ImageUpload;
    