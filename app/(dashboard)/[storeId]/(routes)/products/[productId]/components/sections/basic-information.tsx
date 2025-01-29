"use client";

import { FormField, FormItem, FormLabel, FormControl, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { BasicInformationProps } from "./types";

export const BasicInformation: React.FC<BasicInformationProps> = ({
  loading,
  form,
  brands,
  colors,
  sizes,
  storeCurrency,
}) => {
  const safeColors = Array.isArray(colors) ? colors : [];
  const safeBrands = Array.isArray(brands) ? brands : [];
  const safeSizes = Array.isArray(sizes) ? sizes : [];

  const selectedBrand = form.watch("brandId");
  const selectedColor = form.watch("colorId");
  const selectedSize = form.watch("sizeId");

  return (
    <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
      <FormField
        control={form.control}
        name="name"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Name</FormLabel>
            <FormControl>
              <Input disabled={loading} placeholder="Product name" {...field} />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Description</FormLabel>
            <FormControl>
              <Textarea 
                disabled={loading} 
                placeholder="Product description" 
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
        name="price"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Price ({storeCurrency})</FormLabel>
            <FormControl>
              <Input 
                type="number" 
                step="0.01" 
                disabled={loading} 
                placeholder="9.99" 
                {...field} 
                onChange={(e) => field.onChange(parseFloat(e.target.value || "0"))}
              />
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
      <FormField
        control={form.control}
        name="brandId"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Brand</FormLabel>
            <div>
              <Select 
                disabled={loading} 
                onValueChange={field.onChange} 
                value={field.value?.toString() || ""} 
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={loading ? "Loading brands..." : !safeBrands.length ? "No brands available" : "Select a brand"}
                    >
                      {selectedBrand && safeBrands.find(b => b.id.toString() === selectedBrand.toString())?.name}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
                  ) : !safeBrands.length ? (
                    <SelectItem value="" disabled>No brands available</SelectItem>
                  ) : (
                    safeBrands.map((brand) => (
                      <SelectItem key={brand.id} value={brand.id.toString()}>
                        {brand.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!loading && !safeBrands.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  No brands are available for this store. Please add brands first.
                </p>
              )}
            </div>
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
              <Input 
                disabled={loading} 
                placeholder="WIN001" 
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
        name="barcode"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Barcode</FormLabel>
            <FormControl>
              <Input 
                disabled={loading} 
                placeholder="Optional" 
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
        name="status"
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
                  <SelectValue defaultValue="draft" placeholder="Select status" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
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
            <FormLabel>Color</FormLabel>
            <div>
              <Select 
                disabled={loading} 
                onValueChange={field.onChange} 
                value={field.value?.toString() || ""} 
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={loading ? "Loading colors..." : !safeColors.length ? "No colors available" : "Select a color"}
                    >
                      {selectedColor && safeColors.find(c => c.id.toString() === selectedColor.toString())?.name}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
                  ) : !safeColors.length ? (
                    <SelectItem value="" disabled>No colors available</SelectItem>
                  ) : (
                    safeColors.map((color) => (
                      <SelectItem key={color.id} value={color.id.toString()}>
                        {color.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!loading && !colors?.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  No colors are available for this store. Please add colors first.
                </p>
              )}
            </div>
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
            <div>
              <Select 
                disabled={loading} 
                onValueChange={field.onChange} 
                value={field.value?.toString() || ""} 
                defaultValue={field.value?.toString() || ""}
              >
                <FormControl>
                  <SelectTrigger>
                    <SelectValue 
                      placeholder={loading ? "Loading sizes..." : !safeSizes.length ? "No sizes available" : "Select a size"}
                    >
                      {selectedSize && safeSizes.find(s => s.id.toString() === selectedSize.toString())?.name}
                    </SelectValue>
                  </SelectTrigger>
                </FormControl>
                <SelectContent>
                  {loading ? (
                    <SelectItem value="" disabled>Loading...</SelectItem>
                  ) : !safeSizes.length ? (
                    <SelectItem value="" disabled>No sizes available</SelectItem>
                  ) : (
                    safeSizes.map((size) => (
                      <SelectItem key={size.id} value={size.id.toString()}>
                        {size.name}
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
              {!loading && !sizes?.length && (
                <p className="text-sm text-muted-foreground mt-2">
                  No sizes are available for this store. Please add sizes first.
                </p>
              )}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
};