import { useEffect, useState } from 'react';
import { graphqlClient, GET_PRODUCT_DETAILS } from '@/lib/graphql-client';
import { FormProduct, Brand, Color, Size, NavigationTaxonomy, Store } from '@/types/models';

interface PageData {
  product: FormProduct | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  store: Store | null;
}

export const useProductDetails = (storeId: string, productId: string | null) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
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
        const response = await graphqlClient.request(GET_PRODUCT_DETAILS, {
          storeId,
          productId: productId === "new" ? undefined : productId,
          includeProduct: productId !== "new" && productId !== null && productId !== undefined
        });
        
        // Transform product data if it exists
        const transformedProduct = response.product ? {
          id: response.product.id,
          name: response.product.name,
          description: response.product.description || "",
          slug: response.product.slug,
          price: Number(response.product.price || 0),
          status: response.product.status || "draft",
          isVisible: response.product.isVisible ?? true,
          hasVariants: response.product.hasVariants ?? false,
          brand: response.product.brand,
          brandId: response.product.brand?.id,
          colorId: response.product.variants?.[0]?.color?.id,
          sizeId: response.product.variants?.[0]?.size?.id,
          sku: response.product.sku || "",
          barcode: response.product.barcode || "",
          tags: response.product.tags || [],
          taxRate: Number(response.product.taxRate || 0),
          minimumQuantity: response.product.minimumQuantity || 1,
          maximumQuantity: response.product.maximumQuantity,
          images: response.product.images || [],
          optionTypes: response.product.optionTypes || [],
          taxons: response.product.taxons || [],
          variants: response.product.variants || [],
          createdAt: new Date(response.product.createdAt),
          updatedAt: new Date(response.product.updatedAt)
        } as FormProduct : null;
        
        setData({
          product: transformedProduct,
          brands: response.brands || [],
          colors: response.colors || [],
          sizes: response.sizes || [],
          taxonomies: response.taxonomies || [],
          store: response.store || null
        });
        
        setError(null);
      } catch (err) {
        console.error('Error fetching product details:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch product details');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [storeId, productId]);

  return { ...data, loading, error };
};