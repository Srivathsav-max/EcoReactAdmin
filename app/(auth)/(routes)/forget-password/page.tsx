"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function ForgetPassword() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState("");

  const generateOTP = () => {
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    return otp;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      const otp = generateOTP();
      sessionStorage.setItem('tempOTP', otp);
      sessionStorage.setItem('otpEmail', email);

      const response = await fetch('/api/auth/forget-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          email,
          otp
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to send reset email');
      }

      if (data.devMode) {
        toast.success('Reset code sent! Check console for OTP (Development Mode)');
      } else {
        toast.success('Reset code sent! Please check your email');
      }

      router.push(`/verify-otp?email=${encodeURIComponent(email)}`);
      
    } catch (error: any) {
      toast.error(error.message);
      sessionStorage.removeItem('tempOTP');
      sessionStorage.removeItem('otpEmail');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center">
            <Button
              variant="ghost"
              className="p-0 hover:bg-transparent"
              onClick={() => router.back()}
            >
              <ArrowLeft className="h-5 w-5 text-gray-500" />
            </Button>
            <CardTitle className="text-2xl font-bold text-center flex-1">
              Forgot Password
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter your email address and we&apos;ll send you a code to reset your password
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="name@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Sending...
                </>
              ) : (
                'Send Reset Code'
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
