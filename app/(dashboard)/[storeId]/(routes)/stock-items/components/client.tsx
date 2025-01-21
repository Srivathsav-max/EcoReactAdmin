"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns, StockItemColumn } from "./columns";

interface StockItemClientProps {
  data: StockItemColumn[];
}

export const StockItemClient: React.FC<StockItemClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Stock Items (${data.length})`}
          description="Manage your inventory stock items"
        />
        <Button onClick={() => router.push(`/${params.storeId}/stock-items/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="productName" columns={columns} data={data} />
    </>
  );
}; 