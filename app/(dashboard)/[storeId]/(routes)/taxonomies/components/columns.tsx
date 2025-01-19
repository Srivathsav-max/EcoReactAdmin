"use client";

import { ColumnDef } from "@tanstack/react-table";
import { CellAction } from "./cell-action";

export type TaxonomyColumn = {
  id: string;
  name: string;
  taxonsCount: number;
  createdAt: string;
};

export const columns: ColumnDef<TaxonomyColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "taxonsCount",
    header: "Taxons",
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
