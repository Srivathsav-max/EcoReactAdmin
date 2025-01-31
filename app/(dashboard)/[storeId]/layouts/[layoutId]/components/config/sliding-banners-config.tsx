"use client";

import * as z from "zod";
import { useState } from "react";
import { Trash } from "lucide-react";
import { UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import ImageUpload from "@/components/ui/image-upload";
import { Separator } from "@/components/ui/separator";

interface BannerItem {
  id: string;
  label: string;
  imageUrl: string;
  link?: string;
}

interface SlidingBannersConfigProps {
  form: UseFormReturn<{
    config: {
      banners?: BannerItem[];
      interval?: number;
    };
  }>;
}

export function SlidingBannersConfig({ form }: SlidingBannersConfigProps) {
  const [isLoading, setIsLoading] = useState(false);

  const banners = form.watch("config.banners") || [];

  const generateUniqueId = () => {
    return `banner-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  };

  const addBanner = () => {
    const currentBanners = form.watch("config.banners") || [];
    form.setValue("config.banners", [
      ...currentBanners,
      {
        id: generateUniqueId(),
        label: "",
        imageUrl: "",
        link: ""
      }
    ]);
  };

  const removeBanner = (index: number) => {
    const currentBanners = form.watch("config.banners") || [];
    form.setValue(
      "config.banners",
      currentBanners.filter((_, i: number) => i !== index)
    );
  };

  return (
    <div className="space-y-8">
      <div className="space-y-6">
        <FormField
          control={form.control}
          name="config.interval"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slide Interval (ms)</FormLabel>
              <FormControl>
                <Input
                  type="number"
                  disabled={isLoading}
                  placeholder="5000"
                  {...field}
                  value={field.value || ""}
                  onChange={(e) => field.onChange(Number(e.target.value))}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4">
          {banners.map((_, index: number) => (
            <div key={index} className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-medium">Banner {index + 1}</h3>
                {banners.length > 1 && (
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    onClick={() => removeBanner(index)}
                  >
                    <Trash className="h-4 w-4" />
                  </Button>
                )}
              </div>
              <FormField
                control={form.control}
                name={`config.banners.${index}.label`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Label</FormLabel>
                    <FormControl>
                      <Input disabled={isLoading} placeholder="Banner label" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`config.banners.${index}.imageUrl`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Image</FormLabel>
                    <FormControl>
                      <ImageUpload
                        value={field.value ? [field.value] : []}
                        disabled={isLoading}
                        onChange={(url: string) => field.onChange(url)}
                        onRemove={() => field.onChange("")}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name={`config.banners.${index}.link`}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Link (Optional)</FormLabel>
                    <FormControl>
                      <Input 
                        disabled={isLoading} 
                        placeholder="https://example.com" 
                        {...field} 
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              {index < banners.length - 1 && (
                <Separator className="my-4" />
              )}
            </div>
          ))}
        </div>
      </div>

      <Button
        type="button"
        variant="outline"
        onClick={addBanner}
        disabled={isLoading}
      >
        Add Banner
      </Button>
    </div>
  );
}
