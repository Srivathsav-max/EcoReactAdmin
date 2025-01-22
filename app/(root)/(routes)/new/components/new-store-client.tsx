"use client";

import { useEffect } from "react";
import { useStoreModal } from "@/hooks/use-store-modal";

export default function NewStoreClient() {
  const storeModal = useStoreModal();

  useEffect(() => {
    storeModal.onOpen();
  }, [storeModal]);

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <div className="p-6 bg-white rounded-lg shadow-lg w-full max-w-3xl">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold mb-2">Welcome to Your Store Management Dashboard</h1>
          <p className="text-gray-600">Create your first store to get started</p>
        </div>
      </div>
    </div>
  );
}