"use client";

import * as z from "zod";
import {
  Brand,
  Color,
  Size,
  NavigationTaxonomy,
} from "@/types/models";
import { ProductWithMetadata } from "./types";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { useProductForm } from "@/hooks/use-product-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { Spinner } from "@/components/ui/spinner";
import { AlertModal } from "@/components/modals/alert-modal";

import {
  BasicInformation,
  ProductMedia,
  ProductVariants,
  ProductSpecifications,
  ProductVisibility,
  ProductFormType,
  ProductFormProps,
} from "./sections";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  images: z.array(z.object({
    url: z.string(),
    fileId: z.string()
  })).min(1, "At least one image is required"),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  brandId: z.string().optional(),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
  taxons: z.array(z.string()).default([]),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  isVisible: z.boolean().default(true),
  tags: z.array(z.string()).default([]),
  status: z.string().default("draft"),
  hasVariants: z.boolean().default(false),
  taxRate: z.coerce.number().min(0).optional(),
  weight: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  depth: z.coerce.number().min(0).optional(),
  minimumQuantity: z.coerce.number().min(1).default(1),
  maximumQuantity: z.coerce.number().min(1).optional(),
  optionTypes: z.array(z.object({
    name: z.string(),
    presentation: z.string(),
    position: z.number(),
  })).default([]),
});

export const ProductForm: React.FC<{
  initialData: ProductWithMetadata | null;
  brands: Brand[];
  colors: Color[];
  sizes: Size[];
  taxonomies: NavigationTaxonomy[];
  storeCurrency: string;
  storeLocale: string;
}> = ({
  initialData,
  brands,
  colors,
  sizes,
  taxonomies,
  storeCurrency,
  storeLocale
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit product details" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const defaultValues: ProductFormType = initialData ? {
    name: initialData.name,
    description: initialData.description || '',
    images: initialData.images.map((img: { url: string; fileId: string }) => ({
      url: img.url,
      fileId: img.fileId,
    })),
    price: parseFloat(String(initialData.price)),
    brandId: initialData.brandId,
    colorId: initialData.colorId,
    sizeId: initialData.sizeId,
    taxons: initialData.taxons.map(taxon => taxon.id),
    sku: initialData.sku,
    barcode: initialData.barcode,
    isVisible: initialData.isVisible,
    tags: initialData.tags || [],
    status: initialData.status,
    hasVariants: initialData.hasVariants,
    taxRate: initialData.taxRate ? parseFloat(String(initialData.taxRate)) : undefined,
    weight: initialData.weight,
    height: initialData.height,
    width: initialData.width,
    depth: initialData.depth,
    minimumQuantity: initialData.minimumQuantity || 1,
    maximumQuantity: initialData.maximumQuantity,
    optionTypes: initialData.optionTypes?.map((ot: { name: string; presentation: string; position: number }) => ({
      name: ot.name,
      presentation: ot.presentation,
      position: ot.position,
    })) || [],
  } : {
    name: "",
    description: "",
    images: [],
    price: 0,
    brandId: undefined,
    colorId: undefined,
    sizeId: undefined,
    taxons: [],
    sku: "",
    barcode: "",
    isVisible: true,
    tags: [],
    status: "draft",
    hasVariants: false,
    taxRate: 0,
    weight: undefined,
    height: undefined,
    width: undefined,
    depth: undefined,
    minimumQuantity: 1,
    maximumQuantity: undefined,
    optionTypes: [],
  };

  const form = useForm<ProductFormType>({
    resolver: zodResolver(formSchema),
    defaultValues,
  });

  const { onSubmit: handleSubmit, onDelete: handleDelete } = useProductForm(
    params.storeId as string,
    params.productId as string
  );

  const onSubmit = async (data: ProductFormType) => {
    try {
      setIsSaving(true);
      await handleSubmit(data);
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await handleDelete();
    } catch (error) {
      // Error handling is done in the hook
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <Heading
            title={title}
            description={description}
          />
          {initialData && (
            <Button
              disabled={loading}
              variant="destructive"
              size="icon"
              onClick={() => setOpen(true)}
              className="h-8 w-8"
            >
              <Trash className="h-4 w-4" />
            </Button>
          )}
        </div>
        <Separator className="mt-4" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className={cn(
            "space-y-8",
            isSaving && "opacity-50 pointer-events-none"
          )}>
            <div className="space-y-6">
              <div className="rounded-lg border bg-card p-4 space-y-8">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Product Information</h3>
                </div>
                <ProductMedia
                  form={form}
                  loading={loading}
                />
                <Separator />
                <BasicInformation
                  form={form}
                  loading={loading}
                  brands={brands}
                  storeCurrency={storeCurrency}
                />
              </div>

              <div className="rounded-lg border bg-card p-4 space-y-8">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Options & Categories</h3>
                </div>
                <ProductVariants
                  form={form}
                  loading={loading}
                  colors={colors}
                  sizes={sizes}
                />
                <Separator />
                <ProductSpecifications
                  form={form}
                  loading={loading}
                  taxonomies={taxonomies}
                />
              </div>

              <div className="rounded-lg border bg-card p-4 space-y-6">
                <div className="flex items-center gap-2">
                  <div className="h-6 w-1 bg-primary rounded-full" />
                  <h3 className="text-lg font-semibold">Visibility Settings</h3>
                </div>
                <ProductVisibility
                  form={form}
                  loading={loading}
                />
              </div>
            </div>

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
        </form>
      </Form>
    </>
  );
};
