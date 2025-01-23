"use client";

import { useState } from "react";
import { Plus, X } from "lucide-react";
import { Dialog } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Size, Color, Brand, FilterParams } from "@/types/models";

interface MobileFiltersProps {
  sizes: Size[];
  colors: Color[];
  brands: Brand[];
  searchParams: FilterParams;
  onFilter: (key: string, value: string) => void;
}

export const MobileFilters: React.FC<MobileFiltersProps> = ({
  sizes,
  colors,
  brands,
  searchParams,
  onFilter,
}) => {
  const [open, setOpen] = useState(false);

  const onClose = () => setOpen(false);

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        className="flex items-center gap-x-2 lg:hidden"
        variant="outline"
      >
        Filters
        <Plus size={20} />
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <div className="fixed inset-0 bg-black bg-opacity-25" />
        <div className="fixed inset-0 z-40 flex">
          <div className="relative ml-auto flex h-full w-full max-w-xs flex-col overflow-y-auto bg-white py-4 pb-6 shadow-xl">
            <div className="flex items-center justify-between px-4">
              <h2 className="text-lg font-medium">Filters</h2>
              <Button
                onClick={onClose}
                variant="ghost"
                className="p-1"
              >
                <X size={15} />
              </Button>
            </div>

            <div className="p-4 space-y-6">
              {sizes.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">Sizes</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {sizes.map((size) => (
                      <Button
                        key={size.id}
                        onClick={() => {
                          onFilter("sizeId", size.id);
                          onClose();
                        }}
                        variant={searchParams.sizeId === size.id ? "default" : "outline"}
                        size="sm"
                      >
                        {size.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}

              {colors.length > 0 && (
                <div>
                  <h3 className="text-sm font-medium">Colors</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {colors.map((color) => (
                      <Button
                        key={color.id}
                        onClick={() => {
                          onFilter("colorId", color.id);
                          onClose();
                        }}
                        variant={searchParams.colorId === color.id ? "default" : "outline"}
                        size="sm"
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
                <div>
                  <h3 className="text-sm font-medium">Brands</h3>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {brands.map((brand) => (
                      <Button
                        key={brand.id}
                        onClick={() => {
                          onFilter("brandId", brand.id);
                          onClose();
                        }}
                        variant={searchParams.brandId === brand.id ? "default" : "outline"}
                        size="sm"
                      >
                        {brand.name}
                      </Button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </Dialog>
    </>
  );
};