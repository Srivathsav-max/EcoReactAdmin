"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
  className?: string;
  variant?: "default" | "dots";
}

export const Loader = ({ className, variant = "default" }: LoaderProps) => {
  if (variant === "dots") {
    return (
      <div className={cn("flex space-x-2 items-center justify-center min-h-[100px]", className)}>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.3s]"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce [animation-delay:-0.15s]"></div>
        <div className="w-3 h-3 bg-primary rounded-full animate-bounce"></div>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col items-center justify-center min-h-[200px]", className)}>
      <div className="relative">
        <div className="h-16 w-16 rounded-full border-4 border-primary opacity-20"></div>
        <div className="absolute inset-0">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-spin"></div>
        </div>
        <div className="absolute inset-0 rotate-45">
          <div className="h-16 w-16 rounded-full border-4 border-primary border-t-transparent animate-pulse opacity-40"></div>
        </div>
      </div>
      <div className="mt-6 text-sm text-muted-foreground animate-pulse">Loading...</div>
    </div>
  );
};
