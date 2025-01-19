'use client';

import { useEffect } from "react";
import { AlertTriangle } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center h-full">
      <AlertTriangle className="h-8 w-8 text-red-500" />
      <h2 className="text-xl font-semibold mt-4">Something went wrong!</h2>
      <button
        className="mt-4 px-4 py-2 bg-black text-white rounded-md"
        onClick={() => reset()}
      >
        Try again
      </button>
    </div>
  );
}
