"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns, StockMovementColumn } from "./columns";

interface StockMovementClientProps {
  data: StockMovementColumn[];
}

export const StockMovementClient: React.FC<StockMovementClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Stock Movements (${data.length})`}
          description="View stock movement history"
        />
        <Button onClick={() => router.push(`/${params.storeId}/stock-movements/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add Movement
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="productName" columns={columns} data={data} />
    </>
  );
}; 