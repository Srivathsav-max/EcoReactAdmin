"use client";

import { ColumnDef } from "@tanstack/react-table";
import { Badge } from "@/components/ui/badge";

export type StockMovementType = "increment" | "decrement" | "adjustment";

export type StockMovementColumn = {
  id: string;
  productName: string;
  variantName: string;
  color: string;
  size: string;
  quantity: number;
  type: StockMovementType;
  reason: string;
  createdAt: string;
};

export const columns: ColumnDef<StockMovementColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "variantName",
    header: "Variant",
  },
  {
    accessorKey: "color",
    header: "Color",
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "quantity",
    header: "Quantity",
  },
  {
    accessorKey: "type",
    header: "Type",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.type === "increment"
            ? "default"
            : row.original.type === "decrement"
            ? "destructive"
            : "secondary"
        }
      >
        {row.original.type}
      </Badge>
    ),
  },
  {
    accessorKey: "reason",
    header: "Reason",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
];