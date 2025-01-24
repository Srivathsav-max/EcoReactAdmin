"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

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
        const fetchPromises = [
          // Fetch brands
          fetch(`/api/${params.storeId}/brands`),
          // Fetch colors
          fetch(`/api/${params.storeId}/colors`),
          // Fetch sizes
          fetch(`/api/${params.storeId}/sizes`),
          // Fetch taxonomies
          fetch(`/api/${params.storeId}/taxonomies`),
          // Fetch store settings
          fetch(`/api/${params.storeId}/store`),
        ];

        // Add product fetch if we're editing
        if (params.productId !== "new") {
          fetchPromises.push(fetch(`/api/${params.storeId}/products/${params.productId}`));
        }

        const responses = await Promise.all(fetchPromises);
        const [
          brandsRes,
          colorsRes,
          sizesRes,
          taxonomiesRes,
          storeRes,
          ...rest
        ] = responses;

        const [
          brands,
          colors,
          sizes,
          taxonomies,
          store,
          ...others
        ] = await Promise.all([
          brandsRes.json(),
          colorsRes.json(),
          sizesRes.json(),
          taxonomiesRes.json(),
          storeRes.json(),
          ...rest.map(r => r?.json())
        ]);

        // Validate and extract data from responses
        const brandData = brands.success ? brands.data : [];
        const colorData = colors.success ? colors.data : [];
        const sizeData = sizes.success ? sizes.data : [];
        const taxonomyData = taxonomies.success ? taxonomies.data : [];
        const storeData = store.success ? store.data : null;
        const productData = others[0]?.success ? others[0].data : null;

        // Transform product data to match form's expected structure
        // Transform PrismaProduct to FormProduct
        const transformedProduct = productData ? {
          id: productData.id,
          name: productData.name,
          description: productData.description || "",
          slug: productData.slug,
          price: Number(productData.price || 0),
          status: productData.status || "draft",
          isVisible: productData.isVisible ?? true,
          hasVariants: productData.hasVariants ?? false,
          brand: productData.brand,
          brandId: productData.brand?.id,
          colorId: productData.variants?.[0]?.color?.id,
          sizeId: productData.variants?.[0]?.size?.id,
          sku: productData.sku || "",
          barcode: productData.barcode || "",
          tags: productData.tags || [],
          taxRate: Number(productData.taxRate || 0),
          minimumQuantity: productData.minimumQuantity || 1,
          maximumQuantity: productData.maximumQuantity,
          createdAt: productData.createdAt,
          updatedAt: productData.updatedAt,
          images: productData.images || [],
          optionTypes: (productData.optionTypes || []).map((ot: PrismaOptionType) => ({
            id: ot.id,
            name: ot.name,
            presentation: ot.presentation,
            position: ot.position,
            optionValues: ot.optionValues || []
          })) as OptionType[],
          taxons: productData.taxons.map((taxon: PrismaTaxon) => ({
            id: taxon.id,
            name: taxon.name,
            permalink: taxon.permalink || taxon.id,
            description: taxon.description || "",
            position: taxon.position,
            billboard: taxon.billboard
          })) as Taxon[],
          variants: (productData.variants || []).map((variant: PrismaVariant) => ({
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
            createdAt: variant.createdAt,
            updatedAt: variant.updatedAt,
            images: variant.images || []
          })) as Array<Variant & { size: Size | null; color: Color | null; }>
        } as FormProduct : null;

        setData({
          product: transformedProduct,
          brands: brands.success ? brands.data : [],
          colors: colors.success ? colors.data : [],
          sizes: sizes.success ? sizes.data : [],
          taxonomies: taxonomies.success ? taxonomies.data : [],
          store: store.success ? store.data : null
        });
      } catch (error) {
        console.error('Error fetching data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [params.productId, params.storeId]);

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
