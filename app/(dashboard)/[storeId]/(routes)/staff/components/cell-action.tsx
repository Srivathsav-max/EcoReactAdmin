"use client";

import { useState } from "react";
import { Copy, Edit, MoreHorizontal, Trash } from "lucide-react";
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

import { StaffColumn } from "./columns";
import { useRBAC, Permissions } from "@/hooks/use-rbac";

interface CellActionProps {
  data: StaffColumn;
}

export const CellAction: React.FC<CellActionProps> = ({
  data,
}) => {
  const router = useRouter();
  const params = useParams();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { hasPermission } = useRBAC(params.storeId as string);

  const onCopy = (id: string) => {
    navigator.clipboard.writeText(id);
    toast.success('Staff ID copied to clipboard.');
  };

  const onRemove = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/${params.storeId}/staff/${data.id}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error('Failed to remove staff member');
      }

      router.refresh();
      toast.success('Staff member removed.');
    } catch (error) {
      toast.error('Something went wrong');
    } finally {
      setLoading(false);
      setOpen(false);
    }
  };

  const canManageStaff = hasPermission(Permissions.MANAGE_ROLES);

  return (
    <>
      <AlertModal 
        isOpen={open} 
        onClose={() => setOpen(false)}
        onConfirm={onRemove}
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
          <DropdownMenuItem onClick={() => onCopy(data.id)}>
            <Copy className="mr-2 h-4 w-4" /> Copy Id
          </DropdownMenuItem>
          {canManageStaff && (
            <>
              <DropdownMenuItem onClick={() => router.push(`/${params.storeId}/staff/${data.id}`)}>
                <Edit className="mr-2 h-4 w-4" /> Change Role
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setOpen(true)}>
                <Trash className="mr-2 h-4 w-4" /> Remove
              </DropdownMenuItem>
            </>
          )}
        </DropdownMenuContent>
      </DropdownMenu>
    </>
  );
};
