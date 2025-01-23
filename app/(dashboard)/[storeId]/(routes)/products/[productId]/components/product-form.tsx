"use client";

import * as z from "zod";
import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Form } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
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

export const ProductForm: React.FC<ProductFormProps> = ({
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

  const title = initialData ? "Edit product" : "Create product";
  const description = initialData ? "Edit product details" : "Add a new product";
  const toastMessage = initialData ? "Product updated." : "Product created.";
  const action = initialData ? "Save changes" : "Create";

  const defaultValues: ProductFormType = initialData ? {
    name: initialData.name,
    description: initialData.description || '',
    images: initialData.images.map(img => ({
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
    optionTypes: initialData.optionTypes?.map(ot => ({
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
      setLoading(true);
      
      const formattedData = {
        ...data,
        price: data.price * 100, // Convert to cents
        taxRate: data.taxRate ? data.taxRate / 100 : undefined, // Convert from percentage
        // Ensure we send both url and fileId for images
        images: data.images.map(img => ({
          url: img.url,
          fileId: img.fileId,
        })),
      };

      if (initialData) {
        await fetch(`/api/${params.storeId}/products/${params.productId}`, {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
      } else {
        await fetch(`/api/${params.storeId}/products`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(formattedData)
        });
      }

      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await fetch(`/api/${params.storeId}/products/${params.productId}`, {
        method: 'DELETE'
      });
      router.push(`/${params.storeId}/products`);
      router.refresh();
      toast.success("Product deleted.");
    } catch (error) {
      toast.error("Something went wrong.");
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
      <div className="flex items-center justify-between">
        <Heading
          title={title}
          description={description}
        />
        {initialData && (
          <Button
            disabled={loading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            <Trash className="h-4 w-4" />
          </Button>
        )}
      </div>
      <Separator />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
          <Separator />
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
          <Separator />
          <ProductVisibility 
            form={form}
            loading={loading}
          />
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
