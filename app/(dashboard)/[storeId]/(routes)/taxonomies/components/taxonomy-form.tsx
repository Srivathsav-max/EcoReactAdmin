"use client";

import * as z from "zod";
import { useState } from "react";
import { Taxonomy } from "@prisma/client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import axios from "axios";
import { Spinner } from "@/components/ui/spinner";

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

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
});

type TaxonomyFormValues = z.infer<typeof formSchema>;

interface TaxonomyFormProps {
  initialData?: Taxonomy | null;
}

export const TaxonomyForm: React.FC<TaxonomyFormProps> = ({
  initialData
}) => {
  const params = useParams();
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const title = initialData ? "Edit taxonomy" : "Create taxonomy";
  const description = initialData ? "Edit a taxonomy." : "Add a new taxonomy";
  const toastMessage = initialData ? "Taxonomy updated." : "Taxonomy created.";
  const action = initialData ? "Save changes" : "Create";

  const form = useForm<TaxonomyFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      description: initialData?.description || "",
    }
  });

  const onSubmit = async (data: TaxonomyFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/taxonomies/${initialData.id}`, data);
      } else {
        const response = await axios.post(`/api/${params.storeId}/taxonomies`, {
          ...data,
          storeId: params.storeId
        });
        console.log("Created taxonomy:", response.data);
      }
      router.refresh();
      router.push(`/${params.storeId}/taxonomies`);
      toast.success(toastMessage);
    } catch (error: any) {
      console.error("Error submitting form:", error);
      toast.error(error.response?.data || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title={title} description={description} />
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
                    <Input 
                      disabled={loading} 
                      placeholder="Taxonomy name" 
                      {...field} 
                    />
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
                  <FormLabel>Description (Optional)</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Taxonomy description" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit">
            {loading ? (
              <div className="flex items-center justify-center gap-2">
                <Spinner size={18} />
                <span>{initialData ? "Saving..." : "Creating..."}</span>
              </div>
            ) : (
              action
            )}
          </Button>
        </form>
      </Form>
    </>
  );
};
