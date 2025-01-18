"use client";

import { useState, useEffect } from "react";
import { AuthCard } from "@/components/auth/auth-card";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";

export default function SignInPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [isEmailChecking, setIsEmailChecking] = useState(false);
  const [isEmailExists, setIsEmailExists] = useState(false);

  const getRedirectQuery = () => {
    return redirectUrl !== "/" ? `?redirect=${redirectUrl}` : "";
  };

  const redirectUrl = searchParams?.get("redirect") || "/";

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email validation including database check
  const validateEmailWithServer = async (email: string) => {
    if (!validateEmail(email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      setIsEmailValid(false);
      setIsEmailExists(false);
      return;
    }

    try {
      setIsEmailChecking(true);
      const response = await fetch('/api/auth/validate-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      const data = await response.json();
      
      if (data.exists) {
        setFieldErrors(prev => ({ ...prev, email: '' }));
        setIsEmailValid(true);
        setIsEmailExists(true);
      } else {
        setFieldErrors(prev => ({ ...prev, email: 'Email not found' }));
        setIsEmailValid(false);
        setIsEmailExists(false);
      }
    } catch (error) {
      setFieldErrors(prev => ({ ...prev, email: 'Error validating email' }));
      setIsEmailValid(false);
      setIsEmailExists(false);
    } finally {
      setIsEmailChecking(false);
    }
  };

  // Debounced email validation
  useEffect(() => {
    const timer = setTimeout(() => {
      if (formData.email && validateEmail(formData.email)) {
        validateEmailWithServer(formData.email);
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.email]);

  // Handle email change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData({ ...formData, email });
    
    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
      setIsEmailValid(false);
      setIsEmailExists(false);
    }
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData({ ...formData, password });
    
    if (!password) {
      setFieldErrors(prev => ({ ...prev, password: 'Password is required' }));
    } else if (password.length < 6) {
      setFieldErrors(prev => ({ ...prev, password: 'Password must be at least 6 characters' }));
    } else {
      setFieldErrors(prev => ({ ...prev, password: '' }));
    }
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEmailValid || !formData.password) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch('/api/auth/signin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
        credentials: 'include',
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setFieldErrors(prev => ({ ...prev, password: 'Invalid password' }));
        } else if (data.error) {
          toast.error(data.error);
        }
        return;
      }

      toast.success('Welcome back!');
      router.push(redirectUrl);
      router.refresh();
    } catch (error: any) {
      toast.error('An error occurred during sign in');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold text-center">Welcome back</CardTitle>
          <CardDescription className="text-center text-gray-500">
            Enter your email to sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={onSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Input
                  id="email"
                  type="email"
                  placeholder="name@example.com"
                  value={formData.email}
                  onChange={handleEmailChange}
                  required
                  className={`w-full ${
                    fieldErrors.email ? 'border-red-500' : 
                    isEmailExists ? 'border-green-500' : ''
                  }`}
                />
                {isEmailChecking && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {isEmailExists && (
              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label htmlFor="password">Password</Label>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    required
                    className={`w-full pr-10 ${
                      fieldErrors.password ? 'border-red-500' : 
                      formData.password.length >= 6 ? 'border-green-500' : ''
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                  >
                    {showPassword ? (
                      <EyeOffIcon className="h-4 w-4 text-gray-500" />
                    ) : (
                      <EyeIcon className="h-4 w-4 text-gray-500" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="text-sm text-red-500">{fieldErrors.password}</p>
                )}
              </div>
            )}
            <Button
              type="submit"
              disabled={loading || !isEmailValid || !formData.password}
              className="w-full"
            >
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  <span>Signing in...</span>
                </>
              ) : (
                'Sign in'
              )}
            </Button>
          </form>
        </CardContent>
        <CardFooter>
          <div className="space-y-2 w-full">
            <div className="flex justify-center">
              <Link
                href={`/forget-password${getRedirectQuery()}`}
                className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
              >
                Forgot password?
              </Link>
            </div>
            <div className="flex justify-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href={`/sign-up${getRedirectQuery()}`}
                  className="font-medium text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}