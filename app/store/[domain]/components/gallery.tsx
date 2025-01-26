"use client";

import Image from "next/image";
import type { Image as ImageType } from "@/types/models";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface GalleryProps {
  images: ImageType[];
}

export const Gallery: React.FC<GalleryProps> = ({
  images = []
}) => {
  if (images.length === 0) {
    return (
      <div className="relative aspect-square w-full h-full rounded-lg overflow-hidden">
        <Image
          fill
          src="/placeholder.png"
          alt="Product placeholder"
          className="object-cover object-center"
        />
      </div>
    );
  }

  // Remove duplicate images based on URL
  const uniqueImages = images.filter((image, index, self) =>
    index === self.findIndex((t) => t.url === image.url)
  );

  // Sort images by position
  const sortedImages = [...uniqueImages].sort((a, b) => a.position - b.position);

  return (
    <Tabs defaultValue={sortedImages[0].id} className="flex flex-col-reverse">
      <div className="mx-auto mt-6 w-full max-w-2xl sm:block lg:max-w-none">
        <TabsList className="grid grid-cols-4 gap-6">
          {sortedImages.map((image) => (
            <TabsTrigger
              key={image.id}
              value={image.id}
              className="relative flex aspect-square cursor-pointer items-center justify-center rounded-md bg-white"
            >
              <div className="absolute h-full w-full aspect-square inset-0 overflow-hidden rounded-md">
                <Image
                  fill
                  src={image.url}
                  alt={image.alt || "Product image"}
                  className="object-cover object-center"
                />
              </div>
            </TabsTrigger>
          ))}
        </TabsList>
      </div>
      {sortedImages.map((image) => (
        <TabsContent key={image.id} value={image.id} className="aspect-square">
          <div className="relative h-full w-full sm:rounded-lg overflow-hidden">
            <Image
              fill
              priority
              src={image.url}
              alt={image.alt || "Product image"}
              className="object-cover object-center"
            />
          </div>
        </TabsContent>
      ))}
    </Tabs>
  );
};