import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams } from "next/navigation";
import { toast } from "react-hot-toast";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Spinner } from "@/components/ui/spinner";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  sku: z.string().min(1, "SKU is required"),
  price: z.coerce.number().min(0, "Price must be a non-negative number"),
  costPrice: z.coerce.number().min(0, "Cost price must be a non-negative number").optional(),
  compareAtPrice: z.coerce.number().min(0, "Compare at price must be a non-negative number").optional(),
  colorId: z.string().optional(),
  sizeId: z.string().optional(),
  isVisible: z.boolean().default(true),
  trackInventory: z.boolean().default(true),
  minimumQuantity: z.coerce.number().min(1, "Minimum quantity must be at least 1"),
  maximumQuantity: z.coerce.number().min(1, "Maximum quantity must be at least 1").optional(),
  weight: z.coerce.number().min(0).optional(),
  height: z.coerce.number().min(0).optional(),
  width: z.coerce.number().min(0).optional(),
  depth: z.coerce.number().min(0).optional(),
  allowBackorder: z.boolean().default(false),
  stockCount: z.coerce.number().min(0, "Stock count must be a non-negative number").optional(),
});

type VariantFormData = z.infer<typeof formSchema>;

interface VariantFormProps {
  initialData?: any;
  colors: any[];
  sizes: any[];
  productId: string;
  onSubmit: (success: boolean) => void;
}

export const VariantForm: React.FC<VariantFormProps> = ({
  initialData,
  colors,
  sizes,
  productId,
  onSubmit: onSubmitCallback
}) => {
  const params = useParams();
  const [loading, setLoading] = useState(false);

  const form = useForm<VariantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: "",
      sku: "",
      price: 0,
      costPrice: undefined,
      compareAtPrice: undefined,
      colorId: undefined,
      sizeId: undefined,
      isVisible: true,
      trackInventory: true,
      minimumQuantity: 1,
      maximumQuantity: undefined,
      weight: undefined,
      height: undefined,
      width: undefined,
      depth: undefined,
      allowBackorder: false,
      stockCount: 0,
    }
  });

  const onSubmit = async (values: VariantFormData) => {
    try {
      setLoading(true);
      
      const formattedData = {
        ...values,
        price: parseFloat(values.price.toString()),
        costPrice: values.costPrice ? parseFloat(values.costPrice.toString()) : undefined,
        compareAtPrice: values.compareAtPrice ? parseFloat(values.compareAtPrice.toString()) : undefined,
        stockCount: values.stockCount ? parseInt(values.stockCount.toString()) : 0,
      };
      
      const url = initialData 
        ? `/api/${params.storeId}/variants/${initialData.id}`
        : `/api/${params.storeId}/products/${productId}/variants`;

      console.log('Making API call to:', url);
      console.log('With data:', formattedData);

      const response = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formattedData)
      });

      console.log('API Response status:', response.status);

      const result = await response.json();
      
      if (!response.ok) {
        throw new Error(result.message || 'Failed to save variant');
      }

      toast.success(initialData ? "Variant updated." : "Variant created.");
      onSubmitCallback(true);
      
    } catch (error) {
      console.error('Variant save error:', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      onSubmitCallback(false);
    } finally {
      setLoading(false);
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    try {
      e.preventDefault();
      console.log('Form submitted');
      const values = form.getValues();
      console.log('Form values:', values);
      await onSubmit(values);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error('Failed to submit form');
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Name</FormLabel>
                <FormControl>
                  <Input disabled={loading} {...field} />
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
                <FormLabel>SKU</FormLabel>
                <FormControl>
                  <Input disabled={loading} {...field} />
                </FormControl>
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
                  <Input type="number" step="0.01" disabled={loading} {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="costPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Cost Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    disabled={loading} 
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="compareAtPrice"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compare at Price</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    step="0.01" 
                    disabled={loading} 
                    {...field}
                    value={field.value || ''}
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
                    {...field}
                    value={field.value || ''}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="colorId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Color</FormLabel>
                <Select 
                  disabled={loading} 
                  onValueChange={field.onChange} 
                  value={field.value || ""} 
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue defaultValue="" placeholder="Select a color" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {colors.map((color) => (
                      <SelectItem key={color.id} value={color.id}>
                        <div className="flex items-center gap-x-2">
                          <div 
                            className="h-4 w-4 rounded-full border" 
                            style={{ backgroundColor: color.value }}
                          />
                          {color.name}
                        </div>
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
                <FormLabel>Size</FormLabel>
                <Select 
                  disabled={loading} 
                  onValueChange={field.onChange} 
                  value={field.value || ""} 
                  defaultValue={field.value || ""}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue defaultValue="" placeholder="Select a size" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {sizes.map((size) => (
                      <SelectItem key={size.id} value={size.id}>
                        {size.name} ({size.value})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="isVisible"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Visible
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="trackInventory"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Track Inventory
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="allowBackorder"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <FormControl>
                  <Checkbox
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    disabled={loading}
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>
                    Allow Backorder
                  </FormLabel>
                </div>
              </FormItem>
            )}
          />
        </div>

        <Button disabled={loading} type="submit" className="ml-auto">
          {loading ? (
            <div className="flex items-center gap-x-2">
              <Spinner size={16} />
              <span>Saving...</span>
            </div>
          ) : (
            initialData ? "Save changes" : "Create"
          )}
        </Button>
      </form>
    </Form>
  );
};
