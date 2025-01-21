"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type OptionTypeColumn = {
  id: string;
  name: string;
  presentation: string;
  productName: string;
  position: number;
  valuesCount: number;
  createdAt: string;
};

export const columns: ColumnDef<OptionTypeColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "presentation",
    header: "Presentation",
  },
  {
    accessorKey: "productName",
    header: "Product",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "valuesCount",
    header: "Values",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]; 