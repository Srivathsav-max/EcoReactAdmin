"use client";

import { useEffect, useState, useCallback } from 'react';
import useEmblaCarousel from 'embla-carousel-react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

import { Product } from "@/types/models";
import { ProductCard } from "./product-card";
import NoResults from "@/components/ui/no-results";
import { Button } from '@/components/ui/button';

interface ProductsCarouselProps {
  title: string;
  items: Product[];
}

export const ProductsCarousel: React.FC<ProductsCarouselProps> = ({
  title,
  items
}) => {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    skipSnaps: false,
    dragFree: true,
  });

  const [canScrollPrev, setCanScrollPrev] = useState(false);
  const [canScrollNext, setCanScrollNext] = useState(false);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;

    setCanScrollPrev(emblaApi.canScrollPrev());
    setCanScrollNext(emblaApi.canScrollNext());
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    onSelect();
    emblaApi.on('select', onSelect);
    emblaApi.on('reInit', onSelect);
  }, [emblaApi, onSelect]);

  return (
    <div className="space-y-4 py-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-3xl">{title}</h3>
        <div className="flex items-center gap-x-2">
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollPrev()}
            disabled={!canScrollPrev}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => emblaApi?.scrollNext()}
            disabled={!canScrollNext}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
      <div className="relative">
        {items.length === 0 && <NoResults />}
        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-4">
            {items.map((item) => (
              <div key={item.id} className="min-w-[260px] max-w-[260px] sm:min-w-[280px] sm:max-w-[280px]">
                <ProductCard data={item} />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
