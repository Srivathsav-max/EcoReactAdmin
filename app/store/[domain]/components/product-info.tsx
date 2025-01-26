"use client";

import { useState } from "react";
import { type Product, type Variant } from "@/types/models";
import { Currency } from "@/components/ui/currency";

interface ProductInfoProps {
  product: Product;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );

  // Group option values by option type
  const optionGroups = product.optionTypes.map(optionType => {
    const values = selectedVariant?.optionValues.filter(ov => 
      ov.optionValue.optionType.id === optionType.id
    ) || [];

    return {
      type: optionType,
      values
    };
  });

  const handleOptionChange = (optionTypeId: string, optionValueId: string) => {
    // Find variant that matches all current options plus the new selection
    const newVariant = product.variants.find(variant => {
      return variant.optionValues.every(ov => {
        if (ov.optionValue.optionType.id === optionTypeId) {
          return ov.optionValue.id === optionValueId;
        }
        return selectedVariant?.optionValues.some(selectedOv => 
          selectedOv.optionValue.id === ov.optionValue.id
        );
      });
    });

    if (newVariant) {
      setSelectedVariant(newVariant);
    }
  };

  const currentPrice = selectedVariant?.price || product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice || null;

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="mt-3 flex items-end justify-between">
        <div className="text-2xl text-gray-900">
          <Currency value={currentPrice} />
          {compareAtPrice && (
            <span className="ml-2 line-through text-gray-500">
              <Currency value={compareAtPrice} />
            </span>
          )}
        </div>
      </div>
      
      {optionGroups.map(group => (
        <div key={group.type.id} className="mt-8">
          <h3 className="text-sm font-medium text-gray-900">
            {group.type.presentation}
          </h3>
          <div className="mt-2">
            <div className="flex items-center space-x-3">
              {group.type.optionValues.map(optionValue => (
                <button
                  key={optionValue.id}
                  onClick={() => handleOptionChange(group.type.id, optionValue.id)}
                  className={`
                    relative flex items-center justify-center rounded-full border p-3
                    hover:border-gray-400 focus:outline-none
                    ${group.values.some(v => v.optionValue.id === optionValue.id)
                      ? "border-black"
                      : "border-gray-200"}
                  `}
                >
                  {optionValue.presentation}
                </button>
              ))}
            </div>
          </div>
        </div>
      ))}

      {product.description && (
        <div className="mt-8">
          <h3 className="text-sm font-medium text-gray-900">Description</h3>
          <div 
            className="mt-4 prose prose-sm text-gray-500"
            dangerouslySetInnerHTML={{ __html: product.description }}
          />
        </div>
      )}
    </div>
  );
};