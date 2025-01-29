"use client";

import * as z from "zod";
import {
  Product,
  Brand,
  Color,
  Size,
  NavigationTaxonomy,
  Variant
} from "@/types/models";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
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
import { ProductTabs } from "./product-tabs";

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

type ProductWithMetadata = Product & {
  brandId?: string;
  colorId?: string;
  sizeId?: string;
  sku?: string;
  barcode?: string;
  tags?: string[];
  taxRate: number;
  weight?: number;
  height?: number;
  width?: number;
  depth?: number;
  minimumQuantity: number;
  maximumQuantity?: number;
  variants: Array<Variant & { size: Size | null; color: Color | null }>;
  optionTypes?: Array<{ name: string; presentation: string; position: number }>;
};

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

  const onSubmit = async (data: ProductFormType) => {
    try {
      setIsSaving(true);
      
      const formattedData = {
        ...data,
        price: parseFloat(data.price.toString()),
        taxRate: data.taxRate ? Number((data.taxRate / 100).toFixed(4)) : undefined,
        images: data.images.map(img => ({
          url: img.url,
          fileId: img.fileId,
        })),
      };

      const response = initialData
        ? await fetch(`/api/${params.storeId}/products/${params.productId}`, {
            method: 'PATCH',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData)
          })
        : await fetch(`/api/${params.storeId}/products`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(formattedData)
          });

      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save product');
      }

      router.refresh();
      toast.success(toastMessage);
      return result.data;
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsSaving(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/products/${params.productId}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete product');
      }

      await router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success("Product deleted successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "An unexpected error occurred while deleting the product");
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
        title="Are you sure?"
        description="This action cannot be undone."
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
        <form 
          onSubmit={async (e) => {
            e.preventDefault();
            const target = e.currentTarget;
            const submitButton = document.activeElement as HTMLButtonElement;
            if (submitButton?.type === 'submit' && submitButton.form === target) {
              await form.handleSubmit(onSubmit)(e);
            }
          }} 
          className="space-y-6"
        >
          <ProductTabs
            form={form}
            loading={loading}
            isSaving={isSaving}
            brands={brands}
            colors={colors}
            sizes={sizes}
            taxonomies={taxonomies}
            storeCurrency={storeCurrency}
            action={action}
          />
        </form>
      </Form>
    </>
  );
};
