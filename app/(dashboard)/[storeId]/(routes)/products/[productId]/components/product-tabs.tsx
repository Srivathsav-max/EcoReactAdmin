"use client"

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { ProductForm } from "./product-form"
import ImageUpload from "@/components/ui/image-upload"
import { useState } from "react"
import { Product, Image, Color, Size, Taxonomy, Taxon } from "@prisma/client"
import { type Property } from "./properties-manager"
import { ShippingManager } from "./shipping-manager"
import { SeoManager } from "./seo-manager"
import { StockManager } from "./stock-manager"
import { PropertiesManager } from "./properties-manager"

interface ProductTabsProps {
  stockItems?: any[];
  properties?: Property[];
  initialData: {
    id: string;
    name: string;
    description?: string | null;
    images: Image[];
    price: number;
    costPrice?: number | null;
    compareAtPrice?: number | null;
    taxRate?: number | null;
    weight?: number | null;
    height?: number | null;
    width?: number | null;
    depth?: number | null;
    status: string;
    taxons: Taxon[];
    variants?: any[];
    properties?: Property[];
    shippingCategory?: string | null;
    slug?: string | null;
    metaTitle?: string | null;
    metaDescription?: string | null;
    metaKeywords?: string | null;
  } | null;
  colors: Color[];
  sizes: Size[];
  taxonomies: (Taxonomy & {
    taxons: (Taxon & {
      children?: Taxon[];
    })[];
  })[];
  initialTaxons?: Taxon[];
  storeCurrency: string;
  storeLocale: string;
  brands?: { id: string; name: string }[];
}

export const ProductTabs: React.FC<ProductTabsProps> = ({
  initialData,
  colors,
  sizes,
  taxonomies,
  initialTaxons,
  storeCurrency,
  storeLocale,
  brands
}) => {
  const [activeTab, setActiveTab] = useState("details")

  return (
    <Tabs defaultValue="details" className="w-full" value={activeTab} onValueChange={setActiveTab}>
      <TabsList className="grid w-full grid-cols-7">
        <TabsTrigger value="details">Details</TabsTrigger>
        <TabsTrigger value="images">Images</TabsTrigger>
        <TabsTrigger value="variants">Variants</TabsTrigger>
        <TabsTrigger value="stock">Stock</TabsTrigger>
        <TabsTrigger value="properties">Properties</TabsTrigger>
        <TabsTrigger value="shipping">Shipping</TabsTrigger>
        <TabsTrigger value="seo">SEO</TabsTrigger>
      </TabsList>
      
      <TabsContent value="details">
        <ProductForm
          initialData={initialData}
          colors={colors}
          sizes={sizes}
          taxonomies={taxonomies}
          initialTaxons={initialTaxons}
          storeCurrency={storeCurrency}
          storeLocale={storeLocale}
          brands={brands}
        />
      </TabsContent>

      <TabsContent value="images">
        <div className="space-y-4">
          <div className="grid gap-4">
            <ImageUpload
              value={initialData?.images?.map(img => img.url) || []}
              onChange={(url: string) => {
                // TODO: Implement image upload handling
                console.log("Image upload:", url);
              }}
              onRemove={() => {
                // TODO: Implement image removal
                console.log("Remove image");
              }}
            />
          </div>
        </div>
      </TabsContent>

      <TabsContent value="variants">
        <div className="space-y-4">
          {/* Variant management will be implemented here */}
        </div>
      </TabsContent>

      <TabsContent value="stock">
        <div className="space-y-4">
          {initialData?.variants && (
            <StockManager variants={initialData.variants} />
          )}
        </div>
      </TabsContent>

      <TabsContent value="properties">
        <div className="space-y-4">
          <PropertiesManager
            properties={initialData?.properties || []}
          />
        </div>
      </TabsContent>

      <TabsContent value="shipping">
        <div className="space-y-4">
          {initialData && (
            <ShippingManager
              initialData={{
                weight: initialData.weight,
                height: initialData.height,
                width: initialData.width,
                depth: initialData.depth,
                shippingCategory: initialData.shippingCategory
              }}
            />
          )}
        </div>
      </TabsContent>

      <TabsContent value="seo">
        <div className="space-y-4">
          {initialData && (
            <SeoManager
              initialData={{
                slug: initialData.slug,
                metaTitle: initialData.metaTitle,
                metaDescription: initialData.metaDescription,
                metaKeywords: initialData.metaKeywords
              }}
            />
          )}
        </div>
      </TabsContent>
    </Tabs>
  )
}