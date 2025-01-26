'use client';

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
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
import { Input } from "@/components/ui/input";
import { Heading } from "@/components/ui/heading";
import Link from "next/link";

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

interface CustomerSignInPageProps {
  params: {
    domain: string;
  };
}

type SignInFormValues = z.infer<typeof formSchema>;

export default function CustomerSignInPage({ params }: CustomerSignInPageProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<SignInFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: SignInFormValues) => {
    try {
      setLoading(true);
      // Pass domain to identify the store
      const response = await axios.post(`/api/auth/customer/signin?domain=${params.domain}`, data, {
        withCredentials: true
      });
      
      if (response.data) {
        toast.success('Logged in successfully.');
        // Force re-fetch of auth state
        await fetch(`/api/auth/customer/profile?domain=${params.domain}`, {
          credentials: 'include',
          headers: {
            'Cache-Control': 'no-cache'
          }
        });
        router.refresh(); // Refresh server components
        router.replace(`/store/${params.domain}`);
      }
    } catch (error) {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <Heading
        title="Sign In"
        description="Sign in to your account"
      />
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 mt-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="you@example.com"
                    type="email"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <Input 
                    {...field}
                    disabled={loading}
                    placeholder="Enter your password"
                    type="password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button
            type="submit"
            className="w-full"
            disabled={loading}
          >
            Sign In
          </Button>
        </form>
      </Form>
      <div className="mt-4 text-center text-sm text-muted-foreground">
      Don&apos;t have an account?{' '}
        <Link 
          href={`/store/${params.domain}/signup`}
          className="text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}