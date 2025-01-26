"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";

import { ProductsTableShell } from "./components/products-table-shell";

export default function ProductsPage() {
  const router = useRouter();
  const params = useParams();

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <div className="flex items-center justify-between">
          <Heading
            title="Products"
            description="Manage your product catalog"
          />
          <Button
            onClick={() => router.push(`/${params.storeId}/products/new`)}
          >
            <Plus className="mr-2 h-4 w-4" />
            Add Product
          </Button>
        </div>
        <Separator />
        <ProductsTableShell />
      </div>
    </div>
  );
}
