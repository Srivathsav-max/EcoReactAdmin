import { useEffect, useState } from 'react';
import { graphqlClient, GET_PRODUCTS } from '@/lib/graphql-client';

export type ProductColumn = {
  id: string;
  name: string;
  description: string;
  price: string;
  sku: string;
  stock: number;
  category: string;
  isArchived: boolean;
  createdAt: string;
  images: Array<{ url: string; fileId: string }>;
};

export const useProducts = (storeId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [products, setProducts] = useState<ProductColumn[]>([]);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const data = await graphqlClient.request(GET_PRODUCTS, { storeId });
        
        const formattedProducts = data.products.map((item: any) => ({
          id: item.id,
          name: item.name,
          description: item.description || "",
          price: new Intl.NumberFormat('en-US', {
            style: 'currency',
            currency: 'USD'
          }).format(item.price || 0),
          sku: item.sku || "",
          stock: item.variants?.reduce((total: number, variant: any) => {
            return total + (variant.stockItems?.[0]?.count || 0);
          }, 0) || 0,
          category: item.taxons?.[0]?.name || "Uncategorized",
          isArchived: !item.isVisible,
          createdAt: new Date(item.createdAt).toLocaleDateString(),
          images: item.images || [],
        }));

        setProducts(formattedProducts);
        setError(null);
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'Failed to fetch products');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [storeId]);

  return { products, loading, error };
};