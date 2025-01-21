import { format } from "date-fns";

import prismadb from "@/lib/prismadb";
import { ReviewsClient } from "./components/client";
import { ReviewColumn } from "./components/columns";

const ReviewsPage = async ({
  params
}: {
  params: { storeId: string }
}) => {
  const reviews = await prismadb.productReview.findMany({
    where: {
      product: {
        storeId: params.storeId
      }
    },
    include: {
      product: true,
      customer: true,
    },
    orderBy: {
      createdAt: 'desc'
    }
  });

  const formattedReviews: ReviewColumn[] = reviews.map((item) => ({
    id: item.id,
    productName: item.product.name,
    customerName: item.customer.name,
    rating: item.rating,
    title: item.title || '',
    content: item.content,
    status: item.status,
    createdAt: format(item.createdAt, 'MMMM do, yyyy'),
  }));

  return (
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReviewsClient data={formattedReviews} />
      </div>
    </div>
  );
};

export default ReviewsPage; 