"use client";

import * as z from "zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Taxonomy, Taxon } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Plus } from "lucide-react"; // Add this import

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

const formSchema = z.object({
  name: z.string().min(1),
});

type TaxonomyFormValues = z.infer<typeof formSchema>;

interface TaxonomyWithTaxons extends Taxonomy {
  taxons: (Taxon & {
    children?: Taxon[];
  })[];
}

interface TaxonomyFormProps {
  initialData: TaxonomyWithTaxons | null;
}

export const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit taxonomy' : 'Create taxonomy';
  const description = initialData ? 'Edit a taxonomy.' : 'Add a new taxonomy';
  const toastMessage = initialData ? 'Taxonomy updated.' : 'Taxonomy created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<TaxonomyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || ''
    }
  });

  const onSubmit = async (data: TaxonomyFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/taxonomies/${params.taxonomyId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/taxonomies`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/taxonomies`);
      toast.success(toastMessage);
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${params.storeId}/taxonomies/${params.taxonomyId}`);
      router.refresh();
      router.push(`/${params.storeId}/taxonomies`);
      toast.success('Taxonomy deleted.');
    } catch (error: any) {
      toast.error('Make sure you removed all products using this taxonomy first.');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

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
                    <Input disabled={loading} placeholder="Taxonomy name" {...field} />
                  </FormControl>
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
