import { format } from "date-fns";
import { CustomersClient } from "./components/client";
import prismadb from "@/lib/prismadb";
import { CustomerColumn } from "./components/columns";

const CustomersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const customers = await prismadb.customer.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      addresses: {
        where: {
          isDefault: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedCustomers: CustomerColumn[] = customers.map((item) => ({
    id: item.id,
    name: item.name,
    email: item.email,
    phone: item.phone || 'N/A',
    address: item.addresses[0] ? 
      `${item.addresses[0].street}, ${item.addresses[0].city}` : 
      'No default address',
    createdAt: format(item.createdAt, 'MMMM do, yyyy')
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <CustomersClient data={formattedCustomers} />
      </div>
    </div>
  );
};

export default CustomersPage;
