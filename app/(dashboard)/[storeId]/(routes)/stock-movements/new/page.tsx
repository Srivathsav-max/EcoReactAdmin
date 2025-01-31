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
import { Card } from "@/components/ui/card";
import { VariantCommand } from "@/components/ui/variant-command";

const formSchema = z.object({
  variantId: z.string().min(1, "Variant is required"),
  stockItemId: z.string().min(1, "Stock item is required"),
  quantity: z.coerce.number().min(0.01, "Quantity must be greater than 0"),
  type: z.enum([
    "received",
    "shipped",
    "returned",
    "adjustment",
    "transfer_in",
    "transfer_out",
    "damaged",
    "correction"
  ], {
    required_error: "Movement type is required"
  }),
  reason: z.string().min(1, "Reason is required"),
  orderId: z.string().optional(),
  originatorId: z.string().optional(),
  originatorType: z.string().optional()
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
      type: 'received',
      reason: '',
      orderId: '',
      originatorId: '',
      originatorType: '',
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
      <div className="flex items-center justify-between mb-6">
        <Heading title="Create Stock Movement" description="Add a new stock movement" />
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8 w-full max-w-[1200px] mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="-mt-2 mb-4">
                  <Heading title="Movement Details" description="Specify the type and quantity of stock movement" />
                </div>
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Movement Type</FormLabel>
                        <Select 
                          disabled={loading} 
                          onValueChange={field.onChange} 
                          value={field.value} 
                          defaultValue={field.value}
                        >
                          <FormControl>
                            <SelectTrigger className="w-full">
                              <SelectValue placeholder="Select type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="received" className="text-green-600">Received Stock</SelectItem>
                            <SelectItem value="shipped" className="text-red-600">Shipped to Customer</SelectItem>
                            <SelectItem value="returned" className="text-blue-600">Customer Return</SelectItem>
                            <SelectItem value="adjustment" className="text-yellow-600">Manual Adjustment</SelectItem>
                            <SelectItem value="transfer_in" className="text-indigo-600">Transfer In</SelectItem>
                            <SelectItem value="transfer_out" className="text-purple-600">Transfer Out</SelectItem>
                            <SelectItem value="damaged" className="text-orange-600">Damaged/Unsellable</SelectItem>
                            <SelectItem value="correction" className="text-gray-600">Stock Correction</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="quantity"
                    render={({ field }) => (
                      <FormItem className="w-40">
                        <FormLabel>Quantity</FormLabel>
                        <div className="relative">
                          <FormControl>
                            <Input 
                              type="number"
                              min={0} 
                              disabled={loading} 
                              placeholder="0" 
                              className="pl-8 pr-4 text-lg font-medium"
                              {...field}
                              onChange={(e) => {
                                const value = Math.abs(parseFloat(e.target.value));
                                const type = form.getValues("type");
                                if (["shipped", "transfer_out", "damaged"].includes(type)) {
                                  field.onChange(-value);
                                } else {
                                  field.onChange(value);
                                }
                              }}
                              value={Math.abs(field.value)}
                            />
                          </FormControl>
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                            #
                          </span>
                        </div>
                        <div className={`text-sm mt-1.5 flex items-center gap-1.5 ${
                          ["shipped", "transfer_out", "damaged"].includes(form.watch("type"))
                            ? "text-red-500"
                            : "text-green-500"
                        }`}>
                          <div className={`w-2 h-2 rounded-full ${
                            ["shipped", "transfer_out", "damaged"].includes(form.watch("type"))
                              ? "bg-red-500"
                              : "bg-green-500"
                          }`} />
                          {["shipped", "transfer_out", "damaged"].includes(form.watch("type"))
                            ? "Will decrease stock"
                            : "Will increase stock"}
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="reason"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Reason for Movement</FormLabel>
                      <FormControl>
                        <Input 
                          disabled={loading} 
                          placeholder="Enter reason for this stock movement" 
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </Card>

            <Card className="p-6 shadow-md hover:shadow-lg transition-shadow">
              <div className="space-y-6">
                <div className="-mt-2 mb-4">
                  <Heading title="Product Selection" description="Select product variant to adjust" />
                </div>

                <FormField
                  control={form.control}
                  name="variantId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Select Product Variant</FormLabel>
                      <FormControl>
                        <VariantCommand
                          value={field.value}
                          onChange={async (value) => {
                            field.onChange(value);
                            try {
                              const response = await axios.get(`/api/${params.storeId}/stock-items?variantId=${value}`);
                              const stockItem = response.data[0];
                              if (stockItem) {
                                form.setValue('stockItemId', stockItem.id);
                              }
                            } catch (error) {
                              console.error('Error fetching stock item:', error);
                            }
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch("type") === "shipped" || form.watch("type") === "returned" ? (
                  <FormField
                    control={form.control}
                    name="orderId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Order Reference</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="Enter order ID" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                ) : null}

                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  <FormField
                    control={form.control}
                    name="originatorType"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Created By</FormLabel>
                        <Select 
                          disabled={loading} 
                          onValueChange={field.onChange} 
                          value={field.value || ""} 
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Select originator type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="system">System</SelectItem>
                            <SelectItem value="api">API</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="originatorId"
                    render={({ field }) => (
                      <FormItem className="flex-1">
                        <FormLabel>Originator ID</FormLabel>
                        <FormControl>
                          <Input 
                            disabled={loading} 
                            placeholder="ID" 
                            {...field}
                            value={field.value || ""}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>
            </Card>

            <div className="col-span-1 md:col-span-2 flex justify-end gap-4 mt-6">
              <Button 
                disabled={loading} 
                variant="outline" 
                onClick={() => router.push(`/${params.storeId}/stock-movements`)}
                className="min-w-[100px]"
              >
                Cancel
              </Button>
              <Button 
                disabled={loading} 
                type="submit"
                className="min-w-[150px] relative"
              >
                {loading ? (
                  <>
                    <span className="opacity-0">Create Movement</span>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="h-5 w-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    </div>
                  </>
                ) : (
                  "Create Movement"
                )}
              </Button>
            </div>
          </div>
        </form>
      </Form>
    </>
  );
};

export default StockMovementForm;
