"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useParams } from "next/navigation";
import { FormField, FormItem, FormLabel, FormControl, FormMessage, FormDescription } from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox";
import { ProductVariantsProps } from "./types";
import { VariantTable } from "./variant-table";
import { toast } from "react-hot-toast";

export const ProductVariants: React.FC<ProductVariantsProps> = ({
  loading,
  form,
  colors = [],
  sizes = [],
}) => {
  console.log('ProductVariants props:', { colors, sizes }); // Debug logging
  const params = useParams();
  const [variants, setVariants] = useState([]);
  const [isLoadingVariants, setIsLoadingVariants] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasLoadedVariants = useRef(false);
  
  const fetchVariants = useCallback(async (force = false) => {
    if (!params.productId || params.productId === "new") {
      setVariants([]);
      return;
    }

    // Skip fetching if we already have variants loaded and it's not a forced refresh
    if (hasLoadedVariants.current && !force) {
      return;
    }
    
    try {
      setIsLoadingVariants(true);
      setError(null);
      const response = await fetch(`/api/${params.storeId}/products/${params.productId}/variants`);
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Failed to fetch variants');
      }

      if (data.success) {
        // Ensure we're dealing with an array
        const variantData = Array.isArray(data.data) ? data.data : [];
        setVariants(variantData);
        hasLoadedVariants.current = true;
      } else {
        throw new Error(data.message || 'Failed to fetch variants');
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Error fetching variants";
      console.error(errorMessage);
      setError(errorMessage);
      toast.error(errorMessage);
      setVariants([]); // Reset variants on error
    } finally {
      setIsLoadingVariants(false);
    }
  }, [params.storeId, params.productId]);

  useEffect(() => {
    const hasVariants = form.watch("hasVariants");
    if (hasVariants && params.productId !== "new") {
      fetchVariants(true);
    } else {
      // Reset variants when hasVariants is false or it's a new product
      setVariants([]);
    }
  }, [fetchVariants, form, params.productId]);

  // Debug logging
  console.log('Colors received:', colors);
  console.log('Sizes received:', sizes);

  // Safely check if colors and sizes are available
  const safeColors = Array.isArray(colors) ? colors : [];
  const safeSizes = Array.isArray(sizes) ? sizes : [];

  console.log('Safe Colors:', safeColors);
  console.log('Safe Sizes:', safeSizes);

  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="hasVariants"
        render={({ field }) => (
          <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4 mb-8">
            <FormControl>
              <Checkbox
                checked={field.value}
                onCheckedChange={field.onChange}
                disabled={loading}
              />
            </FormControl>
            <div className="space-y-1 leading-none">
              <FormLabel>Has Variants</FormLabel>
              <FormDescription>
                Enable this if the product comes in different variations
              </FormDescription>
              {(safeColors.length === 0 || safeSizes.length === 0) && (
                <p className="text-sm text-yellow-600 mt-2">
                  Note: You need to add both colors and sizes before creating variants.
                </p>
              )}
            </div>
          </FormItem>
        )}
      />

      {form.watch("hasVariants") && (
        <>
          {error && (
            <div className="text-sm text-red-500 mb-4">
              Error: {error}
            </div>
          )}
      <VariantTable
        variants={variants}
        onUpdate={() => fetchVariants(true)}
            colors={safeColors}
            sizes={safeSizes}
            isLoading={isLoadingVariants}
          />
        </>
      )}
    </div>
  );
};
