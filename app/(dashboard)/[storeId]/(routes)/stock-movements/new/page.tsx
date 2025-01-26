"use client";

import * as z from "zod";
import axios from "axios";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
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
import { Heading } from "@/components/ui/heading";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const formSchema = z.object({
  variantId: z.string().min(1),
  stockItemId: z.string().min(1),
  quantity: z.coerce.number().min(1),
  type: z.enum(["increment", "decrement", "adjustment"]),
  reason: z.string().min(1),
});

type StockMovementFormValues = z.infer<typeof formSchema>;

export const StockMovementForm: React.FC = () => {
  const params = useParams();
  const router = useRouter();

  const [loading, setLoading] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      variantId: '',
      stockItemId: '',
      quantity: 1,
      type: 'increment',
      reason: '',
    }
  });

  const onSubmit = async (data: StockMovementFormValues) => {
    try {
      setLoading(true);
      await axios.post(`/api/${params.storeId}/stock-movements`, data);
      router.push(`/${params.storeId}/stock-movements`);
      toast.success('Stock movement created.');
    } catch (error: any) {
      toast.error('Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading title="Create Stock Movement" description="Add a new stock movement" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full">
          <div className="grid grid-cols-3 gap-8">
            <FormField
              control={form.control}
              name="variantId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Variant ID</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Variant ID" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="stockItemId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Stock Item ID</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Stock Item ID" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantity</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      disabled={loading} 
                      placeholder="Quantity" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type</FormLabel>
                  <Select 
                    disabled={loading} 
                    onValueChange={field.onChange} 
                    value={field.value} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="increment">Increment</SelectItem>
                      <SelectItem value="decrement">Decrement</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="reason"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reason</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="Reason" 
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <Button disabled={loading} className="ml-auto" type="submit">
            Create
          </Button>
        </form>
      </Form>
    </>
  );
};

export default StockMovementForm;
