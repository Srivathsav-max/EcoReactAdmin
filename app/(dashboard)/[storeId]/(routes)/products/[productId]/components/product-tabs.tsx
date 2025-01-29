import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ProductFormType } from "./sections";
import { UseFormReturn } from "react-hook-form";
import {
  BasicInformation,
  ProductMedia,
  ProductVariants,
  ProductSpecifications,
  ProductVisibility,
} from "./sections";
import { Brand, Color, Size, NavigationTaxonomy } from "@/types/models";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

interface ProductTabsProps {
  form: UseFormReturn<ProductFormType>;
  loading: boolean;
  isSaving: boolean;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  storeCurrency: string;
  action: string;
}

export const ProductTabs = ({
  form,
  loading,
  isSaving,
  brands,
  colors,
  sizes,
  taxonomies,
  storeCurrency,
  action
}: ProductTabsProps) => {
  // Debug logging for props
  console.log('ProductTabs received props:', {
    colors,
    sizes,
    brandsCount: brands.length,
    taxonomiesCount: taxonomies.length
  });
  
  return (
    <div className={cn("space-y-6", isSaving && "opacity-50 pointer-events-none")}>
      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="bg-muted h-auto p-1 flex flex-wrap gap-1">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="images">Images</TabsTrigger>
          <TabsTrigger value="variants">Variants</TabsTrigger>
          <TabsTrigger value="properties">Properties</TabsTrigger>
          <TabsTrigger value="stock">Stock</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <BasicInformation
              form={form}
              loading={loading}
              brands={brands}
              colors={colors}
              sizes={sizes}
              storeCurrency={storeCurrency}
            />
            <ProductVisibility
              form={form}
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="images" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <ProductMedia
              form={form}
              loading={loading}
            />
          </div>
        </TabsContent>

        <TabsContent value="variants" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <ProductVariants
              form={form}
              loading={loading}
              colors={colors}
              sizes={sizes}
            />
          </div>
        </TabsContent>

        <TabsContent value="properties" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <div className="flex flex-col gap-4">
              {/* Add custom properties fields here */}
              <p className="text-muted-foreground">Product properties and attributes can be managed here.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="stock" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <div className="flex flex-col gap-4">
              {/* Add stock management fields here */}
              <p className="text-muted-foreground">Stock levels and inventory management options.</p>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="categories" className="m-0">
          <div className="rounded-lg border bg-card p-4 space-y-8">
            <ProductSpecifications
              form={form}
              loading={loading}
              taxonomies={taxonomies}
            />
          </div>
        </TabsContent>
      </Tabs>

      <div className="sticky bottom-0 bg-white border-t p-4 mt-6 -mx-6 -mb-6">
        <div className="flex items-center justify-end max-w-7xl mx-auto">
          <Button
            disabled={isSaving}
            type="submit"
            size="lg"
            className="min-w-[150px] bg-primary hover:bg-primary/90"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <Spinner size={16} className="text-white" />
                <span>Saving...</span>
              </div>
            ) : action}
          </Button>
        </div>
      </div>
    </div>
  );
}
