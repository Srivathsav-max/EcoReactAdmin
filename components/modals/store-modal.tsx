"use client";

import * as z from "zod"
import axios from "axios";
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form";
import { toast } from "react-hot-toast";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { signOut } from "next-auth/react";

import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Button } from "@/components/ui/button";
import { useStoreModal } from "@/hooks/use-store-modal";

const formSchema = z.object({
  name: z.string().min(1, 'Store name is required'),
});

export const StoreModal = () => {
  const storeModal = useStoreModal();
  const router = useRouter();
  const pathname = usePathname();
  const [loading, setLoading] = useState(false);
  
  const isNewStorePage = pathname === '/new';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setLoading(true);
      const response = await axios.post('/api/stores', values);
      
      // Check if the request was successful
      if (!response.data.success) {
        throw new Error(response.data.message || 'Failed to create store');
      }

      const store = response.data.data;
      
      if (isNewStorePage) {
        // If on /new page, do a hard refresh to the new store
        window.location.href = `/${store.id}`;
      } else {
        // If creating from store switcher, use router
        toast.success('Store created successfully');
        router.refresh();
        router.push(`/${store.id}`);
        storeModal.onClose();
      }
      
    } catch (error: any) {
      if (error.response?.status === 401) {
        toast.error('Please sign in as admin to create a store');
        // Optionally redirect to sign in page
        signOut({ callbackUrl: '/signin' });
      } else {
        toast.error(error.response?.data?.message || 'Failed to create store');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    if (isNewStorePage) {
      signOut({ callbackUrl: '/signin' });
    } else {
      storeModal.onClose();
    }
  };

  return (
    <Modal
      title="Create store"
      description="Add a new store to manage products and categories."
      isOpen={storeModal.isOpen}
      onClose={handleClose}
    >
      <div className="space-y-4 py-2 pb-4">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)}>
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Store Name</FormLabel>
                  <FormControl>
                    <Input 
                      disabled={loading} 
                      placeholder="E-Commerce" 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="pt-6 space-x-2 flex items-center justify-end w-full">
              <Button 
                disabled={loading} 
                variant="outline" 
                onClick={handleClose}
                type="button"
              >
                Cancel
              </Button>
              <Button disabled={loading} type="submit">
                {loading ? "Creating..." : "Create Store"}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </Modal>
  );
};
