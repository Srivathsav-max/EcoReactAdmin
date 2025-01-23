"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";
import { Product } from "@/types/models";

interface ProductsConfigProps {
  form: UseFormReturn<any>;
  type: 'featured-products' | 'products-grid' | 'products-carousel';
  products: Product[];
}

export const ProductsConfig: React.FC<ProductsConfigProps> = ({
  form,
  type,
  products
}) => {
  return (
    <>
      <FormField
        control={form.control}
        name="config.title"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Title</FormLabel>
            <FormControl>
              <Input {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="config.productIds"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Products</FormLabel>
            <FormControl>
              <Select
                value=""
                onValueChange={(value) => field.onChange([...field.value || [], value])}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select products" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </FormControl>
            <div className="mt-2">
              {field.value?.map((productId: string) => {
                const product = products.find(p => p.id === productId);
                return product ? (
                  <div key={productId} className="flex items-center gap-2 mt-1">
                    <span>{product.name}</span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        field.onChange(field.value?.filter((id: string) => id !== productId));
                      }}
                    >
                      <Trash className="h-4 w-4" />
                    </Button>
                  </div>
                ) : null;
              })}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
      {type !== 'products-carousel' && (
        <FormField
          control={form.control}
          name="config.itemsPerRow"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Items per Row</FormLabel>
              <FormControl>
                <Input 
                  type="number" 
                  min={1} 
                  max={6} 
                  {...field} 
                  onChange={e => field.onChange(parseInt(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
      )}
      <FormField
        control={form.control}
        name="config.maxItems"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Maximum Items</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                min={1} 
                {...field}
                onChange={e => field.onChange(parseInt(e.target.value))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
    </>
  );
}