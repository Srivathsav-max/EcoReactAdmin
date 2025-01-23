"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function Loading() {
  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-10 w-[150px]" />
        </div>
        <div className="grid gap-4">
          {/* Form skeleton */}
          <div className="grid gap-8 grid-cols-3">
            <div className="space-y-2">
              <Skeleton className="h-4 w-[100px]" />
              <Skeleton className="h-10 w-full" />
            </div>
            <div className="space-y-2">
              <div className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                <Skeleton className="h-4 w-4" />
                <div className="space-y-1">
                  <Skeleton className="h-4 w-[100px]" />
                  <Skeleton className="h-3 w-[200px]" />
                </div>
              </div>
            </div>
          </div>

          {/* Component Library skeleton */}
          <div className="flex gap-8 mt-8">
            <div className="w-1/3">
              <Skeleton className="h-8 w-[200px] mb-4" />
              <div className="border rounded-lg p-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="mb-4">
                    <Skeleton className="h-16 w-full" />
                  </div>
                ))}
              </div>
            </div>

            {/* Page Layout skeleton */}
            <div className="flex-1">
              <Skeleton className="h-8 w-[150px] mb-4" />
              <div className="border rounded-lg p-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="mb-4">
                    <div className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-2">
                        <Skeleton className="h-4 w-[150px]" />
                        <Skeleton className="h-3 w-[100px]" />
                      </div>
                      <Skeleton className="h-8 w-[80px]" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}