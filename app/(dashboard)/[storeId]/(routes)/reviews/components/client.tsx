"use client";

import { Plus } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { ProductReview } from "@prisma/client";

import { Button } from "@/components/ui/button";
import { Heading } from "@/components/ui/heading";
import { Separator } from "@/components/ui/separator";
import { DataTable } from "@/components/ui/data-table";
import { columns } from "./columns";

interface ReviewsClientProps {
  data: (ProductReview & {
    product: { name: string };
    customer: { name: string };
  })[];
}

export const ReviewsClient: React.FC<ReviewsClientProps> = ({
  data
}) => {
  const router = useRouter();
  const params = useParams();

  return (
    <>
      <div className="flex items-center justify-between">
        <Heading
          title={`Reviews (${data.length})`}
          description="Manage product reviews"
        />
      </div>
      <Separator />
      <DataTable searchKey="content" columns={columns} data={data} />
    </>
  );
}; 