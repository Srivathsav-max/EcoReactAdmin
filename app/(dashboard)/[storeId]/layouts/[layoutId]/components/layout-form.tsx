"use client";

import * as z from "zod";
import axios from "axios";
import { useState, useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import type { LayoutComponent } from "@/types/models";

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  isActive: z.boolean().default(false),
});

type FormValues = z.infer<typeof formSchema>;

interface Props {
  initialData: {
    id: string;
    name: string;
    isActive: boolean;
    components: LayoutComponent[];
  } | null;
  storeId: string;
  layoutId: string;
  onUpdate?: () => void;
}

export const LayoutForm = ({
  initialData,
  storeId,
  layoutId,
  onUpdate
}: Props) => {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const isNew = layoutId === 'new';

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: initialData?.name || "",
      isActive: initialData?.isActive || false,
    },
  });

  // Reset form when initialData changes
  useEffect(() => {
    if (initialData) {
      form.reset({
        name: initialData.name,
        isActive: initialData.isActive
      });
    }
  }, [initialData, form]);

  const onSubmit = async (data: FormValues) => {
    try {
      setLoading(true);
      
      if (isNew) {
        const response = await axios.post(`/api/${storeId}/layouts`, data);
        if (!response.data?.id) throw new Error("Failed to create layout");
        toast.success("Layout created");
        router.replace(`/${storeId}/layouts/${response.data.id}`);
      } else {
        await axios.patch(`/api/${storeId}/layouts/${layoutId}`, data);
        toast.success("Layout updated");
        onUpdate?.();
      }
    } catch (error) {
      console.error('Form submission error:', error);
      toast.error(isNew ? "Failed to create layout" : "Failed to update layout");
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async () => {
    try {
      setLoading(true);
      await axios.delete(`/api/${storeId}/layouts/${layoutId}`);
      router.push(`/${storeId}/layouts`);
      toast.success("Layout deleted");
    } catch (error) {
      console.error('Delete error:', error);
      toast.error("Make sure you removed all components first");
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  return (
    <div className="space-y-4">
      <AlertModal
        isOpen={open}
        onClose={() => setOpen(false)}
        onConfirm={onDelete}
        loading={loading}
      />
      <div className="flex items-center justify-between">
        <Heading 
          title={isNew ? "Create Layout" : "Edit Layout"}
          description={isNew ? "Add a new storefront layout" : "Manage your storefront layout"} 
        />
        {!isNew && (
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
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 grid-cols-3">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Layout name" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isActive"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Active</FormLabel>
                    <p className="text-sm text-muted-foreground">
                      Make this the active layout for your storefront
                    </p>
                  </div>
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} type="submit">
            {isNew ? "Create layout" : "Save changes"}
          </Button>
        </form>
      </Form>
    </div>
  );
};