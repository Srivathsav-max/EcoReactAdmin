import * as z from "zod";
import { useState, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
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
  price: z.coerce.number().min(0, "Price must be a non-negative number").transform(value => parseFloat(value.toFixed(2))),
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
  stockCount: z.coerce
    .number()
    .min(0, "Stock count must be a non-negative number")
    .transform(val => Math.max(0, Math.floor(val)))
    .default(0),
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
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Extract stock count from initial data's stockItems
  const getInitialData = () => {
    if (!initialData) {
      return {
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
      };
    }

    // Get stock count from stockItems if available
    const stockItem = initialData.stockItems?.[0];
    const stockCount = stockItem?.count ?? 0;

    // Remove stockItems from the data we pass to the form
    const { stockItems, ...rest } = initialData;

    return {
      ...rest,
      stockCount,
    };
  };

  const form = useForm<VariantFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: getInitialData()
  });

  const onDelete = async () => {
    try {
      setIsDeleting(true);
      
      if (!initialData?.id) {
        throw new Error("Cannot delete: No variant ID");
      }

      const response = await fetch(`/api/${params.storeId}/variants/${initialData.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to delete variant');
      }

      toast.success("Variant deleted successfully");
      onSubmitCallback(true);
    } catch (error) {
      console.error('Variant delete error:', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleSubmit = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    try {
      setLoading(true);
      const values = form.getValues();
      
      const formattedData = {
        ...values,
        price: Number(values.price),
        costPrice: values.costPrice ? Number(values.costPrice) : null,
        compareAtPrice: values.compareAtPrice ? Number(values.compareAtPrice) : null,
        stockCount: Math.max(0, Math.floor(Number(values.stockCount || 0))),
        minimumQuantity: Number(values.minimumQuantity),
        maximumQuantity: values.maximumQuantity ? Number(values.maximumQuantity) : null,
        weight: values.weight ? Number(values.weight) : null,
        height: values.height ? Number(values.height) : null,
        width: values.width ? Number(values.width) : null,
        depth: values.depth ? Number(values.depth) : null,
        // Only include productId when creating a new variant
        ...(initialData ? {} : { productId }),
      };

      const url = initialData 
        ? `/api/${params.storeId}/variants/${initialData.id}`
        : `/api/${params.storeId}/products/${productId}/variants`;

      const response = await fetch(url, {
        method: initialData ? 'PATCH' : 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-store',
        body: JSON.stringify(formattedData),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to save variant');
      }

      const data = await response.json();
      
      toast.success(initialData ? "Variant updated." : "Variant created.");
      router.refresh();
      onSubmitCallback(true);
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(error instanceof Error ? error.message : "Something went wrong");
      onSubmitCallback(false);
    } finally {
      setLoading(false);
    }
  }, [form, initialData, params.storeId, productId, router, onSubmitCallback]);

  return (
    <Form {...form}>
      <form 
        className="space-y-8 w-full" 
        onSubmit={handleSubmit}
      >
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
                    min="0"
                    step="1"
                    disabled={loading} 
                    {...field}
                    value={field.value ?? 0}
                    onChange={(e) => {
                      const value = e.target.value ? Math.max(0, Math.floor(Number(e.target.value))) : 0;
                      field.onChange(value);
                    }}
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

        <div className="flex items-center justify-end gap-4 mt-6">
          {initialData ? (
            <>
              <Button
                disabled={isDeleting || loading}
                variant="destructive"
                type="button"
                onClick={onDelete}
              >
                {isDeleting ? "Deleting..." : "Delete Variant"}
              </Button>
              <Button 
                disabled={loading}
                type="submit"
                variant="default"
                onClick={(e) => {
                  e.preventDefault();
                  handleSubmit(e);
                }}
              >
                {loading ? "Saving..." : "Save Changes"}
              </Button>
            </>
          ) : (
            <Button 
              disabled={loading}
              type="submit"
              variant="default"
              onClick={(e) => {
                e.preventDefault();
                handleSubmit(e);
              }}
            >
              {loading ? "Creating..." : "Create Variant"}
            </Button>
          )}
        </div>
      </form>
    </Form>
  );
};
