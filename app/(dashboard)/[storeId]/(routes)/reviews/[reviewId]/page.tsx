import prismadb from "@/lib/prismadb";
import { ReviewForm } from "./components/review-form";

const ReviewPage = async ({
  params
}: {
  params: { reviewId: string }
}) => {
  const review = await prismadb.productReview.findUnique({
    where: {
      id: params.reviewId
    }
  });

  return ( 
    <div className="flex-col">
      <div className="flex-1 space-y-4 p-8 pt-6">
        <ReviewForm initialData={review} />
      </div>
    </div>
  );
}

export default ReviewPage; 