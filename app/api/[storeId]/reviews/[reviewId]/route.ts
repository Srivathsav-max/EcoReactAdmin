import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, reviewId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const review = await prismadb.productReview.findUnique({
      where: {
        id: params.reviewId
      },
      include: {
        product: true,
        customer: true
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log('[REVIEW_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, reviewId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    const { status } = body;

    if (!status) {
      return new NextResponse("Status is required", { status: 400 });
    }

    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const review = await prismadb.productReview.update({
      where: {
        id: params.reviewId
      },
      data: {
        status
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log('[REVIEW_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, reviewId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const review = await prismadb.productReview.delete({
      where: {
        id: params.reviewId
      }
    });

    return NextResponse.json(review);
  } catch (error) {
    console.log('[REVIEW_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}