"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type TaxonColumn = {
  id: string;
  name: string;
  taxonomy: string;
  parent: string;
  createdAt: string;
};

export const columns: ColumnDef<TaxonColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "taxonomy",
    header: "Taxonomy",
  },
  {
    accessorKey: "parent",
    header: "Parent",
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
