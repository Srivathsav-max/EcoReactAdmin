"use client";

import { useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SignOutPage() {
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain;

  useEffect(() => {
    const signOut = async () => {
      try {
        // Simple POST to storefront logout
        const response = await fetch(`/api/storefront/${domain}/logout`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          }
        });

        if (!response.ok) {
          throw new Error("Failed to sign out");
        }

        toast.success("Successfully signed out");
        router.refresh();
        router.push(`/store/${domain}/signin`);
      } catch (error) {
        console.error('Signout error:', error);
        toast.error("Something went wrong");
        router.push(`/store/${domain}/signin`);
      }
    };

    signOut();
  }, [router, domain]);

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4" />
        <p className="text-lg">Signing out...</p>
      </div>
    </div>
  );
}
