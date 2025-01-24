"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import { ProductForm } from "./components/product-form";
import { Spinner } from "@/components/ui/spinner";
import { 
  PrismaTaxon,
  NavigationTaxonomy,
  convertToNavigationTaxonomy,
  Brand,
  Color,
  Size,
  Product
} from "@/types/models";

interface PageData {
  product: Product | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  store: {
    currency?: string;
    locale?: string;
    [key: string]: any;
  } | null;
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
          fetch(`/api/${params.storeId}/brands`),
          fetch(`/api/${params.storeId}/colors`),
          fetch(`/api/${params.storeId}/sizes`),
          fetch(`/api/${params.storeId}/taxonomies`),
          fetch(`/api/${params.storeId}/store`),
        ];

        if (params.productId !== "new") {
          fetchPromises.push(
            fetch(`/api/${params.storeId}/products/${params.productId}`)
          );
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

        // Process responses with proper typing
        const [
          brands,
          colors,
          sizes,
          rawTaxonomies,
          store,
          ...others
        ] = await Promise.all([
          brandsRes.json() as Promise<Brand[]>,
          colorsRes.json() as Promise<Color[]>,
          sizesRes.json() as Promise<Size[]>,
          taxonomiesRes.json()
            .then(data => (data as Array<PrismaTaxon['taxonomy'] & { taxons: PrismaTaxon[] }>)
            .map(convertToNavigationTaxonomy)),
          storeRes.json() as Promise<{ 
            currency?: string; 
            locale?: string;
            [key: string]: any 
          }>,
          ...rest.map(r => r?.json() as Promise<Product>)
        ]);

        setData({
          product: others[0] || null,
          brands,
          colors,
          sizes,
          taxonomies: rawTaxonomies,
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