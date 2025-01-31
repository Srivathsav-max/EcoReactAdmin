"use client";

import * as React from "react";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import axios from "axios";
import { useParams } from "next/navigation";
import Image from "next/image";

interface Variant {
  id: string;
  name: string;
  sku: string;
  product: {
    name: string;
  };
  color?: {
    name: string;
  };
  size?: {
    name: string;
  };
  stockItems: {
    count: number;
  }[];
  images: {
    url: string;
  }[];
}

interface VariantCommandProps {
  value?: string;
  onChange: (value: string) => void;
}

export function VariantCommand({ value, onChange }: VariantCommandProps) {
  const params = useParams();
  const [open, setOpen] = React.useState(false);
  const [variants, setVariants] = React.useState<Variant[]>([]);
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    const fetchVariants = async () => {
      try {
        setLoading(true);
        const response = await axios.get(`/api/${params.storeId}/variants`);
        setVariants(response.data);
      } catch (error) {
        console.error("Error fetching variants:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchVariants();
  }, [params.storeId]);

  const selectedVariant = variants.find((variant) => variant.id === value);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
        >
          {selectedVariant ? (
            <div className="flex items-center gap-2">
              {selectedVariant.images[0] && (
                <div className="relative w-8 h-8">
                  <Image
                    src={selectedVariant.images[0].url}
                    alt={selectedVariant.name}
                    fill
                    className="object-cover rounded"
                  />
                </div>
              )}
              <div className="flex flex-col items-start">
                <span className="font-medium">{selectedVariant.product.name}</span>
                <span className="text-sm text-muted-foreground">
                  {selectedVariant.name} - SKU: {selectedVariant.sku}
                </span>
              </div>
            </div>
          ) : (
            "Select variant..."
          )}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[400px] p-0">
        <Command>
          <CommandInput placeholder="Search variants..." />
          <CommandEmpty>No variant found.</CommandEmpty>
          <CommandGroup className="max-h-[300px] overflow-auto">
            {variants.map((variant) => (
              <CommandItem
                key={variant.id}
                value={variant.id}
                onSelect={() => {
                  onChange(variant.id);
                  setOpen(false);
                }}
              >
                <div className="flex items-center gap-2 w-full">
                  {variant.images[0] && (
                    <div className="relative w-8 h-8">
                      <Image
                        src={variant.images[0].url}
                        alt={variant.name}
                        fill
                        className="object-cover rounded"
                      />
                    </div>
                  )}
                  <div className="flex flex-col flex-1">
                    <span className="font-medium">{variant.product.name}</span>
                    <span className="text-sm text-muted-foreground">
                      {variant.name} - SKU: {variant.sku}
                    </span>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    Stock: {variant.stockItems[0]?.count || 0}
                  </div>
                  {value === variant.id && (
                    <Check className="ml-auto h-4 w-4 opacity-50" />
                  )}
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
}
