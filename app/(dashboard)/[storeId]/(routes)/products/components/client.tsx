"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ColumnDef } from "@tanstack/react-table";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { CellAction } from "./cell-action";

interface ProductClientProps {
  data: {
    id: string;
    name: string;
    price: string;
    priceFormatted: string;
    currencySymbol: string;
    rawPrice: number;  // Add this for editing
    size: string;
    color: string;
    isFeatured: boolean;
    isArchived: boolean;
    category: string;
    createdAt: string;
  }[];
  storeCurrency: string; // Make sure this is required
}

export const ProductClient: React.FC<ProductClientProps> = ({
  data,
  storeCurrency
}) => {
  console.log('ProductClient received data:', {
    count: data.length,
    firstItem: data[0]
  });

  const router = useRouter();
  const params = useParams();

  const columns: ColumnDef<any>[] = [
    {
      accessorKey: "name",
      header: "Name",
    },
    {
      accessorKey: "price",
      header: `Price (${storeCurrency || 'USD'})`, // Add fallback
      cell: ({ row }) => {
        console.log('Rendering price cell:', row.original);
        return (
          <div className="flex items-center">
            <span className="text-muted-foreground mr-1">
              {row.original.currencySymbol}
            </span>
            {row.original.price}
          </div>
        );
      }
    },
    {
      accessorKey: "category",
      header: "Categories",
      cell: ({ row }) => (
        <div className="flex flex-col gap-1">
          {row.original.category.split(", ").map((cat: string, index: number) => (
            <span key={index} className="text-sm">
              {cat}
            </span>
          ))}
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
          <div 
            className="h-6 w-6 rounded-full border" 
            style={{ backgroundColor: row.original.color }}
          />
          {row.original.color}
        </div>
      )
    },
    {
      accessorKey: "isArchived",
      header: "Archived",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.isArchived ? "Yes" : "No"}
        </div>
      )
    },
    {
      accessorKey: "isFeatured",
      header: "Featured",
      cell: ({ row }) => (
        <div className="flex items-center">
          {row.original.isFeatured ? "Yes" : "No"}
        </div>
      )
    },
    {
      accessorKey: "createdAt",
      header: "Date",
    },
    {
      id: "actions",
      cell: ({ row }) => <CellAction data={row.original} />
    }
  ];

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Products (${data.length})`}
          description="Manage products for your store"
        />
        <Button onClick={() => router.push(`/${params.storeId}/products/new`)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
    </>
  );
};
