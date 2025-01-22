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
import { Textarea } from "@/components/ui/textarea"

const formSchema = z.object({
  metaTitle: z.string().optional(),
  metaDescription: z.string().optional(),
  metaKeywords: z.string().optional(),
  slug: z.string().optional(),
})

interface SeoData {
  metaTitle?: string | null;
  metaDescription?: string | null;
  metaKeywords?: string | null;
  slug?: string | null;
}

interface SeoManagerProps {
  initialData: SeoData;
}

export const SeoManager: React.FC<SeoManagerProps> = ({
  initialData
}) => {
  const params = useParams()
  const [loading, setLoading] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      metaTitle: initialData.metaTitle || "",
      metaDescription: initialData.metaDescription || "",
      metaKeywords: initialData.metaKeywords || "",
      slug: initialData.slug || "",
    }
  })

  const onSubmit = async (data: z.infer<typeof formSchema>) => {
    try {
      setLoading(true)
      await axios.patch(`/api/${params.storeId}/products/${params.productId}/seo`, data)
      toast.success("SEO details updated")
    } catch (error) {
      toast.error("Something went wrong")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>URL Slug</FormLabel>
              <FormControl>
                <Input 
                  placeholder="product-url-slug" 
                  disabled={loading} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                The URL-friendly version of the product name
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaTitle"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Title</FormLabel>
              <FormControl>
                <Input 
                  placeholder="Product page title" 
                  disabled={loading} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Title tag for search engine results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaDescription"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description for search results" 
                  disabled={loading}
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                A short description that appears in search engine results
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="metaKeywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Meta Keywords</FormLabel>
              <FormControl>
                <Input 
                  placeholder="keyword1, keyword2, keyword3" 
                  disabled={loading} 
                  {...field} 
                />
              </FormControl>
              <FormDescription>
                Comma-separated list of keywords (optional)
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />
        <Button type="submit" disabled={loading}>
          Save SEO details
        </Button>
      </form>
    </Form>
  )
}