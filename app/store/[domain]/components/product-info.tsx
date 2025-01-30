"use client";

import { useState } from "react";
import { ShoppingCart, Minus, Plus } from "lucide-react";
import { type Product, type Variant } from "@/types/models";
import { Currency } from "@/components/ui/currency";
import { Button } from "@/components/ui/button";

interface ProductInfoProps {
  product: Product;
  onVariantChange?: (variant: Variant | null) => void;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({
  product,
  onVariantChange
}) => {
  const [selectedVariant, setSelectedVariant] = useState<Variant | null>(
    product.variants.length > 0 ? product.variants[0] : null
  );
  const [quantity, setQuantity] = useState(1);

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
      onVariantChange?.(newVariant);
    }
  };

  const handleQuantityChange = (newQuantity: number) => {
    const max = selectedVariant 
      ? Math.max(...selectedVariant.stockItems.map(item => item.count))
      : 99;
    
    setQuantity(Math.min(Math.max(1, newQuantity), max));
  };

  const currentPrice = selectedVariant?.price || product.price;
  const compareAtPrice = selectedVariant?.compareAtPrice || null;
  const inStock = selectedVariant 
    ? selectedVariant.stockItems.some(item => item.count > 0)
    : product.variants.length === 0;

  const discount = compareAtPrice && currentPrice 
    ? Math.round((1 - currentPrice / compareAtPrice) * 100)
    : null;

  return (
    <div className="flex flex-col">
      {/* Brand name */}
      {product.brand && (
        <div className="text-lg text-gray-500 mb-2">
          {product.brand.name}
        </div>
      )}
      
      {/* Product name and price */}
      <h1 className="text-3xl font-bold text-gray-900">{product.name}</h1>
      <div className="mt-3 flex items-end gap-4">
        <div className="flex items-baseline gap-2">
          <span className="text-2xl font-semibold text-gray-900">
            <Currency value={currentPrice} />
          </span>
          {compareAtPrice && (
            <span className="text-lg text-gray-500 line-through">
              <Currency value={compareAtPrice} />
            </span>
          )}
        </div>
        {discount && (
          <span className="bg-red-100 text-red-800 px-2 py-1 rounded text-sm font-medium">
            {discount}% OFF
          </span>
        )}
      </div>
      
      {/* Variant options */}
      {optionGroups.map(group => (
        <div key={group.type.id} className="mt-8">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-medium text-gray-900">
              {group.type.presentation}
            </h3>
            {inStock && (
              <span className="text-sm text-gray-500">
                Select {group.type.presentation.toLowerCase()}
              </span>
            )}
          </div>
          <div className="mt-4">
            <div className="flex flex-wrap gap-3">
              {group.type.optionValues.map(optionValue => {
                const isSelected = group.values.some(v => 
                  v.optionValue.id === optionValue.id
                );
                const isAvailable = product.variants.some(variant =>
                  variant.optionValues.some(ov => 
                    ov.optionValue.id === optionValue.id
                  ) &&
                  variant.stockItems.some(item => item.count > 0)
                );
                
                return (
                  <button
                    key={optionValue.id}
                    onClick={() => handleOptionChange(group.type.id, optionValue.id)}
                    disabled={!isAvailable}
                    className={`
                      relative px-4 py-2 rounded-md border text-sm font-medium
                      transition-all duration-200
                      ${isSelected 
                        ? 'border-black bg-black text-white' 
                        : isAvailable
                          ? 'border-gray-300 hover:border-gray-900'
                          : 'border-gray-200 bg-gray-100 text-gray-400 cursor-not-allowed'
                      }
                    `}
                  >
                    {optionValue.presentation}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      ))}

      {/* Quantity and add to cart */}
      <div className="mt-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-medium text-gray-900">Quantity</h3>
          {inStock ? (
            <span className="text-sm text-green-600 font-medium">In Stock</span>
          ) : (
            <span className="text-sm text-red-600 font-medium">Out of Stock</span>
          )}
        </div>
        <div className="flex items-center gap-6">
          <div className="flex items-center border rounded-md">
            <button
              onClick={() => handleQuantityChange(quantity - 1)}
              disabled={!inStock || quantity <= 1}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Minus size={16} />
            </button>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => handleQuantityChange(parseInt(e.target.value))}
              className="w-16 text-center border-x py-2 text-sm"
            />
            <button
              onClick={() => handleQuantityChange(quantity + 1)}
              disabled={!inStock}
              className="p-2 hover:bg-gray-100 disabled:opacity-50"
            >
              <Plus size={16} />
            </button>
          </div>
          <Button
            disabled={!inStock || !selectedVariant}
            className="flex-1 flex items-center justify-center gap-2"
            size="lg"
          >
            <ShoppingCart size={20} />
            Add to Cart
          </Button>
        </div>
      </div>

      {/* Description */}
      {product.description && (
        <div className="mt-10 pt-10 border-t">
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
