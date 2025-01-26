"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface SlidingBannersProps {
  banners: {
    id: string;
    label: string;
    imageUrl: string;
    link?: string;
  }[];
  interval?: number;
}

export function SlidingBanners({ banners, interval = 5000 }: SlidingBannersProps) {
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    if (banners.length <= 1) return;

    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % banners.length);
    }, interval);

    return () => clearInterval(timer);
  }, [banners.length, interval]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + banners.length) % banners.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % banners.length);
  };

  if (!banners?.length) return null;

  return (
    <div className="relative aspect-[2.4/1] w-full overflow-hidden">
      <div 
        className="flex transition-transform duration-500 ease-out h-full"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
      >
        {banners.map((banner) => (
          <div 
            key={banner.id} 
            className="min-w-full h-full relative"
          >
            <Image
              src={banner.imageUrl}
              alt={banner.label}
              fill
              className="object-cover"
              priority={true}
            />
            {banner.link && (
              <a 
                href={banner.link}
                className="absolute inset-0 bg-black bg-opacity-0 hover:bg-opacity-10 transition-opacity"
                aria-label={banner.label}
              />
            )}
          </div>
        ))}
      </div>

      {banners.length > 1 && (
        <>
          <button
            onClick={prevSlide}
            className="absolute left-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Previous banner"
          >
            <ChevronLeft className="h-6 w-6" />
          </button>
          <button
            onClick={nextSlide}
            className="absolute right-4 top-1/2 -translate-y-1/2 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors"
            aria-label="Next banner"
          >
            <ChevronRight className="h-6 w-6" />
          </button>
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={cn(
                  "w-2.5 h-2.5 rounded-full transition-colors",
                  currentSlide === index
                    ? "bg-white"
                    : "bg-white/50 hover:bg-white/75"
                )}
                aria-label={`Go to banner ${index + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}