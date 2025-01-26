"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { toast } from "react-hot-toast"
import axios from "axios"
import { useParams } from "next/navigation"

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

const formSchema = z.object({
  weight: z.coerce.number().min(0).nullable().optional(),
  height: z.coerce.number().min(0).nullable().optional(),
  width: z.coerce.number().min(0).nullable().optional(),
  depth: z.coerce.number().min(0).nullable().optional(),
  shippingCategory: z.string().optional(),
})

interface ShippingData {
  weight?: number | null;
  height?: number | null;
  width?: number | null;
  depth?: number | null;
  shippingCategory?: string | null;
}

interface ShippingManagerProps {
  initialData: ShippingData;
}

export const ShippingManager: React.FC<ShippingManagerProps> = ({
  initialData
}) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      weight: initialData.weight || null,
      height: initialData.height || null,
      width: initialData.width || null,
      depth: initialData.depth || null,
      shippingCategory: initialData.shippingCategory || undefined,
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      await axios.patch(`/api/${params.storeId}/products/${params.productId}/shipping`, data)
      toast.success("Shipping details updated")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-2 gap-8">
          <FormField
            control={form.control}
            name="weight"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Weight</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Product weight in kg</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="height"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Height</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Product height in cm</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="width"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Width</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Product width in cm</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="depth"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Depth</FormLabel>
                <FormControl>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    disabled={loading}
                    {...field}
                    value={field.value || ""}
                  />
                </FormControl>
                <FormDescription>Product depth in cm</FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="shippingCategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Shipping Category</FormLabel>
                <Select
                  disabled={loading}
                  onValueChange={field.onChange}
                  value={field.value}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a shipping category" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="default">Default</SelectItem>
                    <SelectItem value="oversized">Oversized</SelectItem>
                    <SelectItem value="fragile">Fragile</SelectItem>
                    <SelectItem value="special">Special Handling</SelectItem>
                  </SelectContent>
                </Select>
                <FormDescription>
                  Select the appropriate shipping category for this product
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <Button type="submit" disabled={loading}>
          Save shipping details
        </Button>
      </form>
    </Form>
  )
}