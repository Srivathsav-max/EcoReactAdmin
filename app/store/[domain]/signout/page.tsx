"use client";

import { useEffect } from "react";
import { getStorePublicData } from "@/actions/get-store-by-domain";
import { useRouter, useParams } from "next/navigation";
import { toast } from "react-hot-toast";

export default function SignOutPage() {
  const router = useRouter();
  const params = useParams();
  const domain = params?.domain;

  useEffect(() => {
    const signOut = async () => {
      try {
        // Get store details
        const store = await getStorePublicData(domain as string);
        if (!store) {
          throw new Error("Store not found");
        }
        
        // Sign out with store ID
        const response = await fetch(`/api/storefront/${store.id}/logout`, {
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
