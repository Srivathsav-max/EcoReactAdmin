"use client"

import { ColumnDef } from "@tanstack/react-table"
import { CellAction } from "./cell-action"

export type SupplierColumn = {
  id: string
  name: string
  code: string
  email: string | null
  phone: string | null
  isActive: boolean
  createdAt: string
}

export const columns: ColumnDef<SupplierColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
  },
  {
    accessorKey: "code",
    header: "Code",
  },
  {
    accessorKey: "email",
    header: "Email",
  },
  {
    accessorKey: "phone",
    header: "Phone",
  },
  {
    accessorKey: "isActive",
    header: "Status",
    cell: ({ row }) => (
      <div className="flex items-center">
        <span className={`px-2 py-1 rounded-full text-xs ${
          row.original.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        }`}>
          {row.original.isActive ? 'Active' : 'Inactive'}
        </span>
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
] 