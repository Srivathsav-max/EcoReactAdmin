"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "react-hot-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, ArrowLeft } from "lucide-react";

export default function VerifyOTP() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams?.get('email');

  // Add validation for missing email
  if (!email) {
    router.push('/forget-password');
    return null;
  }

  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setLoading(true);
      
      // Get stored OTP and email
      const storedOTP = sessionStorage.getItem('tempOTP');
      const storedEmail = sessionStorage.getItem('otpEmail');

      // Verify OTP matches and email matches
      if (otp !== storedOTP || email !== storedEmail) {
        throw new Error('Invalid OTP');
      }

      // Clear stored OTP after successful verification
      sessionStorage.removeItem('tempOTP');
      sessionStorage.removeItem('otpEmail');

      toast.success('OTP verified successfully');
      router.push(`/reset-password?email=${encodeURIComponent(email!)}`);
    } catch (error: any) {
      toast.error(error.message);
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
              Verify OTP
            </CardTitle>
          </div>
          <CardDescription className="text-center">
            Enter the code we sent to {email}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="otp">OTP Code</Label>
              <Input
                id="otp"
                type="text"
                placeholder="Enter 6-digit OTP"
                value={otp}
                onChange={(e) => setOtp(e.target.value)}
                required
                maxLength={6}
                pattern="\d{6}"
                title="Please enter a 6-digit code"
              />
            </div>
            <div className="space-y-2">
              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Verifying...
                  </>
                ) : (
                  'Verify OTP'
                )}
              </Button>
              <Button
                type="button"
                variant="outline"
                className="w-full"
                onClick={() => {
                  const storedEmail = sessionStorage.getItem('otpEmail');
                  if (storedEmail) {
                    router.push(`/forget-password?email=${encodeURIComponent(storedEmail)}`);
                  } else {
                    router.push('/forget-password');
                  }
                }}
              >
                Resend OTP
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
