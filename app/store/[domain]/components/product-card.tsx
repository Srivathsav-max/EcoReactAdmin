"use client";

import Image from "next/image";
import { useRouter, useParams } from "next/navigation";
import type { Product, Variant, StockItem } from "@/types/models";
import { Currency } from "@/components/ui/currency";

interface ProductCardProps {
  data: Product;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain as string;

  const handleClick = () => {
    router.push(`/store/${domain}/product/${data.slug}`);
  };

  // Get the first available variant with a price, or use the product's price
  const displayVariant = data.variants.find((variant: Variant) => 
    variant.isVisible && 
    variant.price && 
    variant.stockItems.some((stock: StockItem) => stock.count > 0)
  );
  const price = displayVariant?.price || data.price;
  const compareAtPrice = displayVariant?.compareAtPrice;

  // Get the first available image from either the product or its variants
  const displayImage = data.images[0] || data.variants.flatMap((variant: Variant) => variant.images)[0];

  return (
    <button 
      onClick={handleClick}
      className="group w-full text-left bg-white rounded-lg overflow-hidden border hover:shadow-lg transition duration-300"
    >
      {/* Image Container */}
      <div className="relative aspect-[3/4] bg-gray-100 overflow-hidden">
        <Image
          src={displayImage?.url || "/placeholder.png"}
          alt={data.name}
          fill
          className="object-cover object-center transition duration-300 group-hover:scale-105"
        />
        {compareAtPrice && compareAtPrice > price && (
          <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 text-xs font-medium rounded">
            SALE
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="p-4">
        {/* Brand */}
        {data.brand && (
          <p className="text-sm text-gray-500 mb-1">
            {data.brand.name}
          </p>
        )}
        
        {/* Product Name */}
        <h3 className="font-medium text-gray-900 mb-2 line-clamp-2">
          {data.name}
        </h3>
        
        {/* Price */}
        <div className="flex items-baseline gap-2">
          <span className="text-lg font-semibold text-gray-900">
            <Currency value={price} />
          </span>
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-gray-500 line-through">
              <Currency value={compareAtPrice} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
};
