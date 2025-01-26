"use client";

import * as z from "zod";
import { useState } from "react";
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
import { Heading } from "@/components/ui/heading";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { AlertModal } from "@/components/modals/alert-modal";
import { useTaxonomyMutations } from "@/hooks/use-taxonomy-mutations";
import { TaxonomyDetails, Taxon } from "@/hooks/use-taxonomy-details";

const formSchema = z.object({
  name: z.string().min(1),
  description: z.string().optional(),
});

type TaxonomyFormValues = z.infer<typeof formSchema>;

interface TaxonomyFormProps {
  initialData: TaxonomyDetails;
}

export const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const { createTaxonomy, updateTaxonomy, deleteTaxonomy, loading: mutationLoading } = useTaxonomyMutations();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit taxonomy' : 'Create taxonomy';
  const description = initialData ? 'Edit a taxonomy.' : 'Add a new taxonomy';
  const toastMessage = initialData ? 'Taxonomy updated.' : 'Taxonomy created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<TaxonomyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || ''
    }
  });

  const onSubmit = async (data: TaxonomyFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await updateTaxonomy(params.storeId as string, params.taxonomyId as string, {
          name: data.name,
          description: data.description
        });
      } else {
        await createTaxonomy(params.storeId as string, {
          name: data.name,
          description: data.description
        });
      }
      router.push(`/${params.storeId}/taxonomies`);
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
      await deleteTaxonomy(params.storeId as string, params.taxonomyId as string);
      router.push(`/${params.storeId}/taxonomies`);
      toast.success('Taxonomy deleted.');
    } catch (error) {
      toast.error('Make sure you removed all products using this taxonomy first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const isLoading = loading || mutationLoading;

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={isLoading}
      />
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
        {initialData && (
          <Button
            disabled={isLoading}
            variant="destructive"
            size="sm"
            onClick={() => setOpen(true)}
          >
            Delete Taxonomy
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
                    <Input disabled={isLoading} placeholder="Taxonomy name" {...field} />
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
                    <Input 
                      disabled={isLoading} 
                      placeholder="Taxonomy description" 
                      {...field} 
                      value={field.value || ''}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={isLoading} className="ml-auto" type="submit">
            {action}
          </Button>
        </form>
      </Form>
    </>
  );
};
