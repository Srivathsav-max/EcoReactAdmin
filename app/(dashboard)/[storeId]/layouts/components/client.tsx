"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { ApiList } from "@/components/ui/api-list";

import { columns } from "./columns";

interface HomeLayoutColumn {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

interface LayoutClientProps {
  data: HomeLayoutColumn[];
}

export const LayoutClient: React.FC<LayoutClientProps> = ({
  data
}) => {
  const params = useParams();
  const router = useRouter();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Home Layouts (${data.length})`}
          description="Manage your storefront home page layouts"
        />
        <Button onClick={() => router.push(`/${params.storeId}/layouts/new`)}>
          <Plus className="mr-2 h-4 w-4" /> Add New
        </Button>
      </div>
      <Separator />
      <DataTable searchKey="name" columns={columns} data={data} />
      <Heading title="API" description="API Calls for Layouts" />
      <Separator />
      <ApiList entityName="layouts" entityIdName="layoutId" />
    </>
  );
};