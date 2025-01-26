"use client";

import { useParams } from "next/navigation";
import { ProductForm } from "./components/product-form";
import { Spinner } from "@/components/ui/spinner";
import { useProductDetails } from "@/hooks/use-product-details";

const ProductPage = () => {
  const params = useParams();
  const {
    product,
    brands,
    colors,
    sizes,
    taxonomies,
    store,
    loading,
    error
  } = useProductDetails(params.storeId as string, params.productId as string);

  if (loading) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="flex flex-col items-center gap-4">
          <Spinner size={32} className="text-primary" />
          <p className="text-sm text-muted-foreground animate-pulse">
            Loading product information...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="h-full flex items-center justify-center bg-muted/10">
        <div className="text-sm text-red-500">
          Error: {error}
        </div>
      </div>
    );
  }

  return (
    <div className="flex-col h-full bg-muted/5">
      <div className="flex-1 space-y-8 p-8 pt-6 container max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-8">
            <ProductForm
              initialData={product}
              brands={brands}
              colors={colors}
              sizes={sizes}
              taxonomies={taxonomies}
              storeCurrency={store?.currency || "USD"}
              storeLocale={store?.locale || "en-US"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
