"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { Trash } from "lucide-react";
import { OptionValue, ProductOptionType } from "@prisma/client";
import { useParams, useRouter } from "next/navigation";

import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import { Heading } from "@/components/ui/heading";
import { AlertModal } from "@/components/modals/alert-modal";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  name: z.string().min(1),
  presentation: z.string().min(1),
  position: z.coerce.number().min(0),
  optionTypeId: z.string().min(1),
});

type OptionValueFormValues = z.infer<typeof formSchema>;

interface OptionValueFormProps {
  initialData: OptionValue | null;
  optionTypes: ProductOptionType[];
}

export const OptionValueForm: React.FC<OptionValueFormProps> = ({
  initialData,
  optionTypes,
}) => {
  const params = useParams();
  const router = useRouter();

  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const title = initialData ? 'Edit option value' : 'Create option value';
  const description = initialData ? 'Edit a option value.' : 'Add a new option value';
  const toastMessage = initialData ? 'Option value updated.' : 'Option value created.';
  const action = initialData ? 'Save changes' : 'Create';

  const form = useForm<OptionValueFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: initialData || {
      name: '',
      presentation: '',
      position: 0,
      optionTypeId: '',
    }
  });

  const onSubmit = async (data: OptionValueFormValues) => {
    try {
      setLoading(true);
      if (initialData) {
        await axios.patch(`/api/${params.storeId}/option-values/${params.optionValueId}`, data);
      } else {
        await axios.post(`/api/${params.storeId}/option-values`, data);
      }
      router.refresh();
      router.push(`/${params.storeId}/option-values`);
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
      await axios.delete(`/api/${params.storeId}/option-values/${params.optionValueId}`);
      router.refresh();
      router.push(`/${params.storeId}/option-values`);
      toast.success('Option value deleted.');
    } catch (error: any) {
      toast.error('Make sure you removed all variant associations first.');
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
                    <Input disabled={loading} placeholder="Option value name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="presentation"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Presentation</FormLabel>
                  <FormControl>
                    <Input disabled={loading} placeholder="Display name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="position"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Position</FormLabel>
                  <FormControl>
                    <Input type="number" disabled={loading} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="optionTypeId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Option Type</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue defaultValue={field.value} placeholder="Select an option type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {optionTypes.map((type) => (
                        <SelectItem key={type.id} value={type.id}>
                          {type.name}
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