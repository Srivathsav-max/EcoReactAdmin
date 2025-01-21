import { format } from "date-fns";
import { Supplier } from "@prisma/client";

import prismadb from "@/lib/prismadb";
import { SuppliersClient } from "./components/client";
import { SupplierColumn } from "./components/columns";

const SuppliersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const suppliers = await prismadb.supplier.findMany({
    where: {
      storeId: params.storeId
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedSuppliers: SupplierColumn[] = suppliers.map((item: Supplier) => ({
    id: item.id,
    name: item.name,
    code: item.code,
    email: item.email,
    phone: item.phone,
    isActive: item.isActive,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <SuppliersClient data={formattedSuppliers} />
      </div>
    </div>
  );
};

export default SuppliersPage; 