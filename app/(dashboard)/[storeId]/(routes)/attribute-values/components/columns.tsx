"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type AttributeValueColumn = {
  id: string
  value: string
  attributeId: string
  attributeName: string
  position: number
  createdAt: string
}

export const columns: ColumnDef<AttributeValueColumn>[] = [
  {
    accessorKey: "value",
    header: "Value",
  },
  {
    accessorKey: "attributeName",
    header: "Attribute",
  },
  {
    accessorKey: "position",
    header: "Position",
  },
  {
    accessorKey: "createdAt",
    header: "Date",
  },
  {
    id: "actions",
    cell: ({ row }) => <CellAction data={row.original} />
  }
] 