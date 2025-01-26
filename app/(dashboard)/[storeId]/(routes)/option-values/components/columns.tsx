"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type OptionValueColumn = {
  id: string;
  name: string;
  presentation: string;
  optionTypeName: string;
  productName: string;
  position: number;
  createdAt: string;
};

export const columns: ColumnDef<OptionValueColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "presentation",
    header: "Presentation",
  },
  {
    accessorKey: "optionTypeName",
    header: "Option Type",
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
    accessorKey: "createdAt",
    header: "Created",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  },
]; 