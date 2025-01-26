"use client";

import { useState } from "react";
import { Edit, MoreHorizontal, Trash } from "lucide-react";
import { toast } from "react-hot-toast";
import { useParams, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { 
  DropdownMenu, 
  DropdownMenuContent, 
  DropdownMenuItem, 
  DropdownMenuLabel, 
  DropdownMenuTrigger
} from "@/components/ui/dropdown-menu";
import { AlertModal } from "@/components/modals/alert-modal";
import { TaxonomyColumn } from "./columns";
import { useTaxonomyMutations } from "@/hooks/use-taxonomy-mutations";
import { useTaxonomies } from "@/hooks/use-taxonomies";

interface CellActionProps {
  data: TaxonomyColumn;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
}) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  
  const { deleteTaxonomy, loading } = useTaxonomyMutations();
  const { refetch } = useTaxonomies(params.storeId as string);

  const onConfirm = async () => {
    try {
      await deleteTaxonomy(params.storeId as string, data.id);
      toast.success('Taxonomy deleted.');
      await refetch();
    } catch (error) {
      toast.error('Make sure you removed all products using this taxonomy first.');
    } finally {
      setOpen(false);
    }
  };

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onConfirm}
        loading={loading}
      />
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="h-8 w-8 p-0">
            <span className="sr-only">Open menu</span>
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuLabel>Actions</DropdownMenuLabel>
          <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/taxonomies/${data.id}`)}>
            <Edit className="mr-2 h-4 w-4" />
            Update
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setOpen(true)}>
            <Trash className="mr-2 h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
