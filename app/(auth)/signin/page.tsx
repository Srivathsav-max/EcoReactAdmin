'use client';

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { toast } from "react-hot-toast";
import Link from "next/link";

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

const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type SignInFormValues = z.infer<typeof formSchema>;

export default function SignInPage() {
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
      const response = await axios.post('/api/auth/signin', data);
      
      if (response.data.role === 'admin') {
        router.push('/');
      }
      
      toast.success('Logged in successfully.');
      router.refresh();
    } catch (error) {
      toast.error('Invalid credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto w-full">
      <div className="flex flex-col space-y-2 text-center">
        <h1 className="text-2xl font-semibold tracking-tight">
          Welcome back
        </h1>
        <p className="text-sm text-muted-foreground">
          Enter your credentials to access your account
        </p>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 mt-4">
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
                    placeholder="admin@example.com"
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
          href="/signup"
          className="underline underline-offset-4 hover:text-primary"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}
