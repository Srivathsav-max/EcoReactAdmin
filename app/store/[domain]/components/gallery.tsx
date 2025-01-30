"use client";

import Image from "next/image";
import type { Image as ImageType } from "@/types/models";
import { cn } from "@/lib/utils";
import { useState } from "react";

interface GalleryProps {
  images: ImageType[];
  variantImages?: ImageType[];
}

export const Gallery: React.FC<GalleryProps> = ({
  images = [],
  variantImages = []
}) => {
  const [selectedIndex, setSelectedIndex] = useState(0);
  
  if (images.length === 0 && variantImages.length === 0) {
    return (
      <div className="relative aspect-square w-full h-full rounded-lg overflow-hidden bg-gray-100">
        <Image
          fill
          src="/placeholder.png"
          alt="Product placeholder"
          className="object-cover object-center"
        />
      </div>
    );
  }

  // Combine and deduplicate images, prioritizing variant images
  const uniqueImages = [...variantImages, ...images].filter((image, index, self) =>
    index === self.findIndex((t) => t.url === image.url)
  );

  // Sort images by position
  const sortedImages = uniqueImages.sort((a, b) => a.position - b.position);
  const selectedImage = sortedImages[selectedIndex];

  return (
    <div className="flex flex-col-reverse">
      {/* Main Image */}
      <div className="relative aspect-square w-full overflow-hidden rounded-lg bg-gray-100">
        <Image
          src={selectedImage.url}
          alt={selectedImage.alt || "Product image"}
          fill
          priority
          className="object-cover object-center"
        />
      </div>

      {/* Thumbnail Grid */}
      <div className="mx-auto mt-6 hidden w-full max-w-2xl sm:block lg:max-w-none">
        <div className="grid grid-cols-4 gap-6">
          {sortedImages.map((image, index) => (
            <button
              key={image.id}
              onClick={() => setSelectedIndex(index)}
              className={cn(
                "relative flex h-24 cursor-pointer items-center justify-center rounded-md bg-white text-sm font-medium uppercase hover:bg-gray-50",
                selectedIndex === index ? "ring-2 ring-black ring-offset-2" : "ring-1 ring-gray-200"
              )}
            >
              <span className="sr-only">
                View Image {index + 1}
              </span>
              <span className="absolute inset-0 overflow-hidden rounded-md">
                <Image
                  src={image.url}
                  alt={image.alt || `Product image ${index + 1}`}
                  fill
                  className="object-cover object-center"
                />
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Mobile Image Slider Dots */}
      <div className="flex items-center justify-center gap-2 mt-4 sm:hidden">
        {sortedImages.map((_, index) => (
          <button
            key={index}
            onClick={() => setSelectedIndex(index)}
            className={cn(
              "h-2 w-2 rounded-full transition-colors",
              selectedIndex === index ? "bg-black" : "bg-gray-300"
            )}
          />
        ))}
      </div>
    </div>
  );
};
