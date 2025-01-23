"use client";

import { ShoppingBag } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface EmptyStateProps {
  title?: string;
  description?: string;
  showReset?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  title = "No products found",
  description = "Try adjusting your filters or browse other categories.",
  showReset = false,
}) => {
  const router = useRouter();

  return (
    <div className="h-[400px] flex flex-col items-center justify-center px-4 text-center">
      <div className="mx-auto w-full max-w-md">
        <div className="relative mb-4 h-24 w-24 mx-auto">
          <ShoppingBag className="w-full h-full text-neutral-500" />
        </div>
        <h3 className="mt-2 text-2xl font-semibold text-gray-900">
          {title}
        </h3>
        <p className="mt-1 text-sm text-gray-500">
          {description}
        </p>
        {showReset && (
          <Button
            onClick={() => router.push(window.location.pathname)}
            className="mt-6"
          >
            Reset All Filters
          </Button>
        )}
      </div>
    </div>
  );
};