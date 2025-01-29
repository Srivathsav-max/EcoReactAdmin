"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Taxon } from "@prisma/client";
import { toast } from "react-hot-toast";
import axios from "axios";
import { useRouter } from "next/navigation";
import { ChevronRight, Plus } from "lucide-react";

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

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

interface TaxonWithChildren extends Taxon {
  children?: TaxonWithChildren[];
}

interface TaxonFormProps {
  taxonomyId: string;
  storeId: string;
  parentId?: string;
  initialData?: TaxonWithChildren;
  childTaxons?: TaxonWithChildren[]; 
  onSuccess?: () => void;
}

export const TaxonForm: React.FC<TaxonFormProps> = ({
  taxonomyId,
  storeId,
  parentId,
  initialData,
  childTaxons = [],
  onSuccess
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [showForm, setShowForm] = useState(!initialData);
  const router = useRouter();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsLoading(true);
      if (initialData) {
        // Updated API path
        await axios.patch(`/api/${storeId}/taxons/${initialData.id}`, values);
      } else {
        // Updated API path
        await axios.post(`/api/${storeId}/taxons`, {
          ...values,
          taxonomyId,
          parentId,
        });
      }
      toast.success(initialData ? "Taxon updated." : "Taxon created.");
      router.refresh(); // Force a refresh of the server components
      onSuccess?.();
    } catch (error) {
      toast.error("Something went wrong.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div>
      {initialData ? (
        // Display existing taxon
        <div className="pl-4 border-l">
          <div className="flex items-center gap-2 mb-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              <ChevronRight className={`h-4 w-4 ${isExpanded ? "transform rotate-90" : ""}`} />
            </Button>
            <span className="flex-1">{initialData.name}</span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowForm(true)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </div>

          {showForm && (
            <div className="mb-4">
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name</FormLabel>
                        <FormControl>
                          <Input {...field} disabled={isLoading} placeholder="Enter taxon name" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <div className="flex items-center gap-2">
                    <Button type="submit" disabled={isLoading}>
                      Create Sub-Taxon
                    </Button>
                    <Button type="button" variant="outline" onClick={() => setShowForm(false)}>
                      Cancel
                    </Button>
                  </div>
                </form>
              </Form>
            </div>
          )}

          {isExpanded && childTaxons.length > 0 && (
            <div className="mt-4">
              {childTaxons.map((child) => (
                <TaxonForm
                  key={child.id}
                  taxonomyId={taxonomyId}
                  storeId={storeId}
                  parentId={initialData.id}
                  initialData={child}
                  childTaxons={child.children}
                  onSuccess={onSuccess}
                />
              ))}
            </div>
          )}
        </div>
      ) : (
        // New taxon form
        <div className="p-4 border rounded-lg">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl>
                      <Input {...field} disabled={isLoading} placeholder="Enter taxon name" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div className="flex items-center gap-2">
                <Button type="submit" disabled={isLoading}>
                  Create Taxon
                </Button>
              </div>
            </form>
          </Form>
        </div>
      )}
    </div>
  );
};
