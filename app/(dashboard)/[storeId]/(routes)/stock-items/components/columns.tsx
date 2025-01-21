"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";

export type StockItemColumn = {
  id: string;
  productName: string;
  variantName: string;
  color: string;
  size: string;
  count: number;
  reserved: number;
  backorderedQty: number;
  stockStatus: string;
  createdAt: string;
};

export const columns: ColumnDef<StockItemColumn>[] = [
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
    accessorKey: "count",
    header: "Stock Count",
  },
  {
    accessorKey: "reserved",
    header: "Reserved",
  },
  {
    accessorKey: "backorderedQty",
    header: "Backordered",
  },
  {
    accessorKey: "stockStatus",
    header: "Status",
    cell: ({ row }) => (
      <Badge
        variant={
          row.original.stockStatus === "in_stock"
            ? "success"
            : row.original.stockStatus === "low_stock"
            ? "warning"
            : "destructive"
        }
      >
        {row.original.stockStatus}
      </Badge>
    ),
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />,
  },
]; 