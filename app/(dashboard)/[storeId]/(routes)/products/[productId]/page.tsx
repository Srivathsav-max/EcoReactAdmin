"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";

import { ProductForm } from "./components/product-form";
import { Spinner } from "@/components/ui/spinner";
import { PageData } from "@/types";

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

        setData({
          product: others[0] || null,
          brands,
          colors,
          sizes,
          taxonomies,
          store
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
      <div className="flex items-center justify-center h-full">
        <Spinner size={32} />
      </div>
    );
  }

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
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
  );
};

export default ProductPage;
