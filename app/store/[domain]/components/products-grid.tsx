"use client";

import type { Product, Size, Color, Brand, FilterParams } from "@/types/models";
import { ProductCard } from "./product-card";
import { MobileFilters } from "./mobile-filters";
import { EmptyState } from "./empty-state";
import { Button } from "@/components/ui/button";
import { useRouter, useSearchParams } from "next/navigation";
import qs from "query-string";

interface ProductsGridProps {
  title: string;
  items: Product[];
  sizes: Size[];
  colors: Color[];
  brands: Brand[];
  searchParams: FilterParams;
}

export const ProductsGrid: React.FC<ProductsGridProps> = ({
  title,
  items,
  sizes,
  colors,
  brands,
  searchParams
}) => {
  const router = useRouter();
  const search = useSearchParams();

  const hasActiveFilters = !!(searchParams.sizeId || searchParams.colorId || searchParams.brandId || searchParams.sort);

  const onFilter = (filterKey: string, value: string) => {
    const current = qs.parse(search.toString());
    
    const query = {
      ...current,
      [filterKey]: current[filterKey] === value ? null : value,
    };

    const url = qs.stringifyUrl({
      url: window.location.href.split("?")[0],
      query,
    }, { skipNull: true });

    router.push(url);
  };

  const onSortChange = (value: string) => {
    const current = qs.parse(search.toString());
    
    const query = {
      ...current,
      sort: value,
    };

    const url = qs.stringifyUrl({
      url: window.location.href.split("?")[0],
      query,
    }, { skipNull: true });

    router.push(url);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-3xl">{title}</h3>
        <div className="flex items-center gap-x-4">
          <MobileFilters 
            sizes={sizes}
            colors={colors}
            brands={brands}
            searchParams={searchParams}
            onFilter={onFilter}
          />
          <select 
            className="p-2 border rounded-md"
            onChange={(e) => onSortChange(e.target.value)}
            value={searchParams.sort || ""}
          >
            <option value="">Sort by</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="newest">Newest First</option>
          </select>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        <div className="hidden lg:block space-y-6">
          {sizes.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Sizes</h4>
              <div className="flex flex-wrap gap-2">
                {sizes.map((size) => (
                  <Button
                    key={size.id}
                    onClick={() => onFilter("sizeId", size.id)}
                    variant={searchParams.sizeId === size.id ? "default" : "outline"}
                  >
                    {size.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {colors.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Colors</h4>
              <div className="flex flex-wrap gap-2">
                {colors.map((color) => (
                  <Button
                    key={color.id}
                    onClick={() => onFilter("colorId", color.id)}
                    variant={searchParams.colorId === color.id ? "default" : "outline"}
                    className="flex items-center gap-x-2"
                  >
                    <div 
                      className="h-4 w-4 rounded-full border"
                      style={{ backgroundColor: color.value }}
                    />
                    {color.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
          
          {brands.length > 0 && (
            <div className="space-y-4">
              <h4 className="font-semibold">Brands</h4>
              <div className="flex flex-wrap gap-2">
                {brands.map((brand) => (
                  <Button
                    key={brand.id}
                    onClick={() => onFilter("brandId", brand.id)}
                    variant={searchParams.brandId === brand.id ? "default" : "outline"}
                  >
                    {brand.name}
                  </Button>
                ))}
              </div>
            </div>
          )}
        </div>
        
        <div className="lg:col-span-4">
          {items.length === 0 ? (
            <EmptyState 
              showReset={hasActiveFilters}
              description={hasActiveFilters 
                ? "No products match your selected filters. Try adjusting or removing them."
                : "This category doesn't have any products yet. Check back later."
              }
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {items.map((item) => (
                <ProductCard key={item.id} data={item} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};