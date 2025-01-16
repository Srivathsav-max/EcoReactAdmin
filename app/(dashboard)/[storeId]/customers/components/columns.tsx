"use client";

import { ColumnDef } from "@tanstack/react-table";

export type CustomerColumn = {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  createdAt: string;
};

export const columns: ColumnDef<CustomerColumn>[] = [
  {
    accessorKey: "name",
    header: "Name",
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
    accessorKey: "address",
    header: "Address",
  },
  {
    accessorKey: "createdAt",
    header: "Created At",
  },
];
