"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";
import { Badge } from "@/components/ui/badge";

export type ProductColumn = {
  id: string;
  name: string;
  price: string;
  priceFormatted: string;
  currencySymbol: string;
  rawPrice: number;
  size: string;
  color: string;
  isFeatured: boolean;
  isArchived: boolean;
  category: string;
  slug: string;
  sku: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  status: string;
  stockCount: number;
  createdAt: string;
  availableOn: string;
  discontinueOn: string;
};

export const columns: ColumnDef<ProductColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "sku",
    header: "SKU",
  },
  {
    accessorKey: "status",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <Badge variant={
          row.original.status === 'active' ? 'success' :
          row.original.status === 'draft' ? 'warning' : 'secondary'
        }>
          {row.original.status}
        </Badge>
      </div>
    )
  },
  {
    accessorKey: "priceFormatted",
    header: "Price",
    cell: ({ row }) => (
      <div className="flex items-center">
        {row.original.currencySymbol}{row.original.priceFormatted}
      </div>
    )
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
    accessorKey: "category",
    header: "Categories",
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
    accessorKey: "availableOn",
    header: "Available",
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
