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
      className="group w-full cursor-pointer space-y-4 rounded-xl border p-3 bg-white transition hover:shadow-lg"
    >
      {/* Image */}
      <div className="aspect-square relative bg-gray-100 rounded-xl overflow-hidden">
        <Image
          src={displayImage?.url || "/placeholder.png"}
          alt={data.name}
          fill
          className="aspect-square object-cover rounded-md transition group-hover:scale-105"
        />
      </div>
      {/* Details */}
      <div className="space-y-1">
        <p className="font-semibold text-lg truncate">{data.name}</p>
        {data.brand && (
          <p className="text-sm text-gray-500 truncate">
            {data.brand.name}
          </p>
        )}
      </div>
      {/* Price */}
      <div className="flex items-end justify-between">
        <div className="text-lg font-semibold">
          <Currency value={price} />
          {compareAtPrice && compareAtPrice > price && (
            <span className="text-sm text-gray-500 line-through ml-2">
              <Currency value={compareAtPrice} />
            </span>
          )}
        </div>
      </div>
    </button>
  );
};