"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";

export type VariantColumn = {
  id: string;
  productName: string;
  sku: string;
  price: string;
  size: string;
  color: string;
  stockCount: number;
  createdAt: string;
};

export const columns: ColumnDef<VariantColumn>[] = [
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "price",
    header: "Price",
  },
  {
    accessorKey: "stockCount",
    header: "Stock",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Badge variant={
          row.original.stockCount > 10 ? 'success' :
          row.original.stockCount > 0 ? 'warning' : 'destructive'
        }>
          {row.original.stockCount}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "size",
    header: "Size",
  },
  {
    accessorKey: "color",
    header: "Color",
    cell: ({ row }) => (
      <div className="flex items-center gap-x-2">
        {row.original.color}
        <div 
          className="h-6 w-6 rounded-full border" 
          style={{ backgroundColor: row.original.color }} 
        />
      </div>
    )
  },
  {
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]; 