"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus } from "lucide-react";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns, CustomerColumn } from "./columns";
import { CustomerApiList } from "./api-list";
import { CustomerForm } from "./customer-form";

interface CustomersClientProps {
  data: CustomerColumn[];
}

export const CustomersClient: React.FC<CustomersClientProps> = ({
  data
}) => {
  const [open, setOpen] = useState(false);

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Customers (${data.length})`}
          description="Manage customers for your store"
        />
        <Button onClick={() => setOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Customers" />
      <Separator />
      <CustomerApiList />
      <CustomerForm 
        isOpen={open} 
        onClose={() => setOpen(false)} 
      />
    </>
  );
};
