"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Billboard, Taxon, Taxonomy } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Trash } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
  billboardId: z.string().optional(),
  taxonomyId: z.string().min(1, "Taxonomy is required"),
  parentId: z.string().optional(),
});

const isDescendant = (taxon: any, targetId: string | undefined): boolean => {
  if (!targetId) return false;
  if (taxon.id === targetId) return true;
  return taxon.children?.some((child: any) => isDescendant(child, targetId)) || false;
};

interface TaxonFormProps {
  initialData: (Taxon & {
    parent?: Taxon | null;
    children?: Taxon[];
    taxonomy?: Taxonomy | null;
  }) | null;
  billboards: Billboard[];
  taxonomies: Taxonomy[];
  availableTaxons: Taxon[];
}

export const TaxonForm: React.FC<TaxonFormProps> = ({
  initialData,
  billboards,
  taxonomies,
  availableTaxons,
}) => {
  const params = useParams();
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit taxon' : 'Create taxon';
  const description = initialData ? 'Edit a taxon.' : 'Add a new taxon';
  const toastMessage = initialData ? 'Taxon updated.' : 'Taxon created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      billboardId: initialData?.billboardId || undefined,
      taxonomyId: initialData?.taxonomy?.id || '',
      parentId: initialData?.parentId || undefined,
    }
  });

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/taxons/${params.taxonId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/taxons`, data);
      }
      router.push(`/${params.storeId}/taxons`);
      router.refresh();
      toast.success(toastMessage);
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/taxons/${params.taxonId}`);
      router.push(`/${params.storeId}/taxons`);
      router.refresh();
      toast.success('Taxon deleted.');
    } catch (error) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const filteredAvailableTaxons = availableTaxons.filter(taxon => 
    // Prevent selecting self as parent
    taxon.id !== initialData?.id &&
    // Prevent selecting children as parent (avoid circular references)
    !isDescendant(taxon, initialData?.id)
  );

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
            size="icon"
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
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Taxon name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="taxonomyId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Taxonomy</FormLabel>
                  <Select disabled={loading || !!initialData} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a taxonomy" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {taxonomies.map((taxonomy) => (
                        <SelectItem key={taxonomy.id} value={taxonomy.id}>
                          {taxonomy.name}
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
              name="billboardId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Billboard (Optional)</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select a billboard" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None</SelectItem>
                      {billboards.map((billboard) => (
                        <SelectItem key={billboard.id} value={billboard.id}>
                          {billboard.label}
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
              name="parentId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Parent Taxon (Optional)</FormLabel>
                  <Select disabled={loading} onValueChange={field.onChange} value={field.value || ""}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select parent taxon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="">None (Root Level)</SelectItem>
                      {filteredAvailableTaxons.map((taxon) => (
                        <SelectItem key={taxon.id} value={taxon.id}>
                          {taxon.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
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