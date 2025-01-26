"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type AttributeColumn = {
  id: string
  name: string
  code: string
  type: string
  isRequired: boolean
  isVisible: boolean
  position: number
  createdAt: string
}

export const columns: ColumnDef<AttributeColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "type",
    header: "Type",
  },
  {
    accessorKey: "isRequired",
    header: "Required",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isRequired ? 'bg-red-100 text-red-800' : 'bg-slate-100 text-slate-800'
        }`}>
          {row.original.isRequired ? 'Required' : 'Optional'}
        </span>
      </div>
    )
  },
  {
    accessorKey: "isVisible",
    header: "Visible",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isVisible ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isVisible ? 'Visible' : 'Hidden'}
        </span>
      </div>
    )
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