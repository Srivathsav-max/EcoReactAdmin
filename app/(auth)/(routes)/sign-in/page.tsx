"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { EyeIcon, EyeOffIcon, Loader2 } from "lucide-react";
import Link from "next/link";
import { useSignIn, useValidateEmail } from "@/lib/graphql/hooks/useAuth";

const SignInPage = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  
  const [fieldErrors, setFieldErrors] = useState({
    email: '',
    password: ''
  });

  const { checkEmail, loading: emailChecking } = useValidateEmail();
  const { handleSignIn, loading: signingIn } = useSignIn();
  const [isEmailValid, setIsEmailValid] = useState(false);
  const [emailExists, setEmailExists] = useState(false);

  const redirectUrl = searchParams?.get("redirect") || "/";

  // Email validation function
  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  // Handle email validation
  const handleEmailValidation = async (email: string) => {
    // Clear previous validation states
    setEmailExists(false);
    setIsEmailValid(false);
    setFieldErrors(prev => ({ ...prev, email: '' }));

    // Basic format validation
    if (!email) {
      setFieldErrors(prev => ({ ...prev, email: 'Email is required' }));
      return;
    }

    if (!validateEmail(email)) {
      setFieldErrors(prev => ({ ...prev, email: 'Please enter a valid email' }));
      return;
    }

    // Check email existence
    const result = await checkEmail(email);
    if (result.error) {
      setFieldErrors(prev => ({ ...prev, email: result.error }));
    } else {
      setIsEmailValid(true);
      setEmailExists(result.exists);
      if (result.exists) {
        // Clear any email errors if the email exists
        setFieldErrors(prev => ({ ...prev, email: '' }));
      }
    }
  };

  // Handle email input change
  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const email = e.target.value;
    setFormData(prev => ({ ...prev, email }));
    
    // Clear password when email changes
    setFormData(prev => ({ ...prev, password: '' }));
    setFieldErrors(prev => ({ ...prev, password: '' }));
    
    // Debounce email validation
    const timer = setTimeout(() => {
      if (email) {
        handleEmailValidation(email);
      }
    }, 500);

    return () => clearTimeout(timer);
  };

  // Handle password change
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const password = e.target.value;
    setFormData(prev => ({ ...prev, password }));
    setFieldErrors(prev => ({ 
      ...prev, 
      password: password ? '' : 'Password is required' 
    }));
  };

  // Handle form submission
  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailExists || !formData.password) return;

    const result = await handleSignIn(formData.email, formData.password);
    if (result?.success) {
      toast.success('Signed in successfully!');
      router.push(redirectUrl);
      router.refresh();
    } else if (result?.error) {
      setFieldErrors(prev => ({
        ...prev,
        password: result.error === 'Invalid password' ? 'Invalid password' : ''
      }));
      if (result.error !== 'Invalid password') {
        toast.error(result.error);
      }
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
                  className={`w-full ${
                    fieldErrors.email ? 'border-red-500' : 
                    emailExists ? 'border-green-500' : ''
                  }`}
                  disabled={signingIn}
                  required
                />
                {emailChecking && (
                  <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-gray-500" />
                )}
              </div>
              {fieldErrors.email && (
                <p className="text-sm text-red-500">{fieldErrors.email}</p>
              )}
            </div>

            {emailExists && (
              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handlePasswordChange}
                    className={`w-full pr-10 ${
                      fieldErrors.password ? 'border-red-500' : ''
                    }`}
                    disabled={signingIn}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2"
                    disabled={signingIn}
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

            {emailExists && (
              <Button
                type="submit"
                disabled={signingIn || !formData.password}
                className="w-full"
              >
                {signingIn ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  'Sign in'
                )}
              </Button>
            )}
          </form>
        </CardContent>
        <CardFooter>
          <div className="space-y-2 w-full">
            {emailExists && (
              <div className="flex justify-center">
                <Link
                  href={`/forget-password?email=${encodeURIComponent(formData.email)}`}
                  className="text-sm text-blue-600 hover:text-blue-500 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
            )}
            <div className="flex justify-center">
              <p className="text-sm text-gray-600">
                Don&apos;t have an account?{' '}
                <Link
                  href="/sign-up"
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
};

export default SignInPage;