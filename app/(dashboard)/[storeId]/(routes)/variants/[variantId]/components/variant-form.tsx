"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { Product, Variant, Size, Color } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1),
  productId: z.string().min(1),
  colorId: z.string().nullable().optional().transform(val => val || null),
  sizeId: z.string().nullable().optional().transform(val => val || null),
  price: z.coerce.number().min(0),
  sku: z.string().optional(),
  stockCount: z.coerce.number().min(0).default(0),
  compareAtPrice: z.coerce.number().min(0).optional(),
  costPrice: z.coerce.number().min(0).optional(),
  allowBackorder: z.boolean().default(false),
  lowStockAlert: z.coerce.number().min(0).optional(),
});

type VariantFormValues = z.infer<typeof formSchema>;

interface VariantFormProps {
  initialData: {
    id: string;
    name: string;
    productId: string;
    colorId?: string | null;
    sizeId?: string | null;
    price: number;
    sku?: string | null;
    stockCount: number;
    compareAtPrice?: number | null;
    costPrice?: number | null;
    allowBackorder: boolean;
    lowStockAlert?: number | null;
  } | null;
  products: Product[];
  colors: Color[];
  sizes: Size[];
}

export const VariantForm: React.FC<VariantFormProps> = ({
  initialData,
  products,
  colors,
  sizes,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit variant' : 'Create variant';
  const description = initialData ? 'Edit a variant.' : 'Add a new variant';
  const toastMessage = initialData ? 'Variant updated.' : 'Variant created.';
  const action = initialData ? 'Save changes' : 'Create';

  const allColors = [
    { id: "example-1", name: "Example - Red" },
    { id: "example-2", name: "Example - Blue" },
    ...colors
  ];

  const allSizes = [
    { id: "example-1", name: "Example - Small" },
    { id: "example-2", name: "Example - Medium" },
    ...sizes
  ];

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      productId: '',
      colorId: null,
      sizeId: null,
      price: 0,
      sku: '',
      stockCount: 0,
      compareAtPrice: undefined,
      costPrice: undefined,
      allowBackorder: false,
      lowStockAlert: undefined,
    }
  });

  const onSubmit = async (data: VariantFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/variants/${params.variantId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/variants`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/variants`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/variants/${params.variantId}`);
      router.refresh();
      router.push(`/${params.storeId}/variants`);
      toast.success('Variant deleted.');
    } catch (error: any) {
      toast.error('Something went wrong.');
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
        <Heading title={title} description={description} />
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Variant name" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Product</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a product" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {products.map((product) => (
                        <SelectItem key={product.id} value={product.id}>
                          {product.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="colorId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color (Optional)</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select color (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Color</SelectItem>
                      {allColors.map((color) => (
                        <SelectItem key={color.id} value={color.id}>
                          {color.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sizeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Size (Optional)</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value || ""}
                    defaultValue={field.value || ""}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select size (optional)" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">No Size</SelectItem>
                      {allSizes.map((size) => (
                        <SelectItem key={size.id} value={size.id}>
                          {size.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="price"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Price</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={loading} 
                      placeholder="9.99" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="sku"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>SKU (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="SKU" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockCount"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Count</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={loading} 
                      placeholder="0" 
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                      value={field.value}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
}; 