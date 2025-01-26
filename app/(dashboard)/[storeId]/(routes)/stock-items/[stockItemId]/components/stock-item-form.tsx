"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { StockItem, Variant } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
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
  variantId: z.string().min(1),
  count: z.coerce.number().min(0),
  stockStatus: z.string().min(1),
  reserved: z.coerce.number().min(0),
  backorderedQty: z.coerce.number().min(0),
});

type StockItemFormValues = z.infer<typeof formSchema>;

interface StockItemFormProps {
  initialData: (StockItem & {
    variant: Variant & {
      product: { name: string };
      color: { name: string } | null;
      size: { name: string } | null;
    }
  }) | null;
  variants: (Variant & {
    product: { name: string };
    color: { name: string } | null;
    size: { name: string } | null;
  })[];
}

export const StockItemForm: React.FC<StockItemFormProps> = ({
  initialData,
  variants
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit stock item' : 'Create stock item';
  const description = initialData ? 'Edit a stock item.' : 'Add a new stock item';
  const toastMessage = initialData ? 'Stock item updated.' : 'Stock item created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<StockItemFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      variantId: '',
      count: 0,
      stockStatus: 'in_stock',
      reserved: 0,
      backorderedQty: 0
    }
  });

  const onSubmit = async (data: StockItemFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/stock-items/${params.stockItemId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/stock-items`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/stock-items`);
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
      await axios.delete(`/api/${params.storeId}/stock-items/${params.stockItemId}`);
      router.refresh();
      router.push(`/${params.storeId}/stock-items`);
      toast.success('Stock item deleted.');
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
              name="variantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a variant" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {variants.map((variant) => (
                        <SelectItem key={variant.id} value={variant.id}>
                          {variant.product.name} - {variant.color?.name || 'N/A'} - {variant.size?.name || 'N/A'}
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
              name="count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Count</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockStatus"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="in_stock">In Stock</SelectItem>
                      <SelectItem value="low_stock">Low Stock</SelectItem>
                      <SelectItem value="out_of_stock">Out of Stock</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reserved"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reserved</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="0"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="backorderedQty"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Backordered Quantity</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      disabled={loading}
                      placeholder="0"
                      {...field}
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