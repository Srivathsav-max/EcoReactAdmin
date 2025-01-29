"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { toast } from "react-hot-toast";

import { ProductForm } from "./components/product-form";
import { Spinner } from "@/components/ui/spinner";
import {
  PrismaProduct,
  Brand,
  Color,
  Size,
  NavigationTaxonomy,
  Product,
  PrismaTaxon,
  PrismaOptionType,
  PrismaVariant,
  Taxon,
  Variant,
  OptionType
} from "@/types/models";

type FormProduct = Product & {
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  sku?: string;
  barcode?: string;
  tags?: string[];
  taxRate: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  variants: Array<Variant & {
    size: Size | null;
    color: Color | null;
  }>;
}

interface Store {
  id: string;
  name: string;
  currency?: string;
  locale?: string;
}

interface PageData {
  product: FormProduct | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  store: Store | null;
}

const ProductPage = () => {
  const params = useParams();
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<PageData>({
    product: null,
    brands: [],
    colors: [],
    sizes: [],
    taxonomies: [],
    store: null
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Add current session headers to all requests
        const headers = {
          'Content-Type': 'application/json',
        };

        const fetchPromises = [
          fetch(`/api/${params.storeId}/brands`, { headers }).then(res => res.json()),
          fetch(`/api/${params.storeId}/colors`, { headers }).then(res => res.json()),
          fetch(`/api/${params.storeId}/sizes`, { headers }).then(res => res.json()),
          fetch(`/api/${params.storeId}/taxonomies`, { headers }).then(res => res.json()),
          fetch(`/api/${params.storeId}/store`, { headers }).then(res => res.json()),
        ];

        // Add product fetch if editing existing product
        if (params.productId !== "new") {
          fetchPromises.push(
            fetch(`/api/${params.storeId}/products/${params.productId}`).then(res => res.json())
          );
        }

        const [
          brandsResponse,
          colorsResponse,
          sizesResponse,
          taxonomiesResponse,
          storeResponse,
          ...rest
        ] = await Promise.all(fetchPromises);

        // Debug logging
        console.log('Colors Response:', colorsResponse);
        console.log('Sizes Response:', sizesResponse);

        // Transform product data if it exists
        const productData = rest[0]?.success ? transformProductData(rest[0].data) : null;
        
        setData({
          product: productData,
          brands: brandsResponse?.data || [],
          colors: colorsResponse?.data || [],
          sizes: sizesResponse?.data || [],
          taxonomies: taxonomiesResponse?.data || [],
          store: storeResponse?.data || null
        });
      } catch (error) {
        console.error('Error fetching data:', error);
        toast.error("Error loading product data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.productId, params.storeId]);

  // Helper function to transform product data
  const transformProductData = (data: any): FormProduct | null => {
    if (!data) return null;

    return {
      id: data.id,
      name: data.name,
      description: data.description || "",
      slug: data.slug,
      price: Number(data.price || 0),
      status: data.status || "draft",
      isVisible: data.isVisible ?? true,
      hasVariants: data.hasVariants ?? false,
      brand: data.brand,
      brandId: data.brand?.id,
      colorId: data.variants?.[0]?.color?.id || data.colorId,
      sizeId: data.variants?.[0]?.size?.id || data.sizeId,
      sku: data.sku || "",
      barcode: data.barcode || "",
      tags: data.tags || [],
      taxRate: Number(data.taxRate || 0),
      minimumQuantity: data.minimumQuantity || 1,
      maximumQuantity: data.maximumQuantity,
      createdAt: data.createdAt,
      updatedAt: data.updatedAt,
      images: data.images || [],
      taxons: (data.taxons || []).map((taxon: PrismaTaxon) => ({
        id: taxon.id,
        name: taxon.name,
        permalink: taxon.permalink || taxon.id,
        description: taxon.description || "",
        position: taxon.position,
        billboard: taxon.billboard
      })),
      variants: (data.variants || []).map((variant: PrismaVariant) => ({
        id: variant.id,
        name: variant.name,
        sku: variant.sku || "",
        price: Number(variant.price || 0),
        compareAtPrice: variant.compareAtPrice ? Number(variant.compareAtPrice) : null,
        position: variant.position,
        isVisible: variant.isVisible,
        isDefault: variant.isDefault,
        size: variant.size,
        color: variant.color,
        stockItems: variant.stockItems || [],
        optionValues: variant.optionValues || [],
        images: variant.images || []
      })),
      optionTypes: (data.optionTypes || []).map((optionType: PrismaOptionType) => ({
        id: optionType.id,
        name: optionType.name,
        presentation: optionType.presentation,
        position: optionType.position,
        optionValues: optionType.optionValues || []
      }))
    };
  };

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

  return (
    <div className="flex-col h-full bg-muted/5">
      <div className="flex-1 space-y-8 p-8 pt-6 container max-w-7xl mx-auto">
        <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
          <div className="px-6 py-8">
            <ProductForm
              initialData={data.product}
              brands={data.brands}
              colors={data.colors}
              sizes={data.sizes}
              taxonomies={data.taxonomies}
              storeCurrency={data.store?.currency || "USD"}
              storeLocale={data.store?.locale || "en-US"}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductPage;
