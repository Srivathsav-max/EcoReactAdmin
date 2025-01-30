"use client";

import { useState } from "react";
import type { Product, Variant } from "@/types/models";
import { Gallery } from "./gallery";
import { ProductInfo } from "./product-info";

interface ProductDisplayProps {
  product: Product;
}

export const ProductDisplay: React.FC<ProductDisplayProps> = ({
  product
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );

  return (
    <>
      <div className="md:sticky md:top-24">
        <Gallery 
          images={product.images}
          variantImages={selectedVariant?.images || []}
        />
      </div>
      <div className="mt-10 px-4 sm:mt-16 sm:px-0 lg:mt-0">
        <ProductInfo 
          product={product}
          onVariantChange={setSelectedVariant}
        />
      </div>
    </>
  );
};
