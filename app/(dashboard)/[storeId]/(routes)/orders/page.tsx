import { format } from "date-fns";
import prismadb from "@/lib/prismadb";
import { getFormatter } from "@/lib/utils";
import { OrderColumn } from "./components/columns";
import { OrderClient } from "./components/client";
import { formatDecimalPrice } from "@/lib/utils";

const OrdersPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  // Fetch store settings first
  const store = await prismadb.store.findFirst({
    where: {
      id: params.storeId
    }
  });

  if (!store) {
    throw new Error("Store not found");
  }

  const formatter = getFormatter({
    currency: store.currency || 'USD',
    locale: store.locale || 'en-US'
  });

  const orders = await prismadb.order.findMany({
    where: {
      storeId: params.storeId
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedOrders: OrderColumn[] = orders.map((item) => ({
    id: item.id,
    phone: item.phone,
    address: item.address,
    products: item.orderItems.map((orderItem) => orderItem.product.name).join(', '),
    totalPrice: formatter.format(
      item.orderItems.reduce((total, item) => {
        return total + formatDecimalPrice(item.product.price)
      }, 0)
    ),
    isPaid: item.isPaid,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <OrderClient data={formattedOrders} />
      </div>
    </div>
  );
};

export default OrdersPage;
