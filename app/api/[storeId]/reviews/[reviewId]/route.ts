import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { reviewId: string, storeId: string } }
) {
  try {
    if (!params.reviewId) {
      return new NextResponse("Review ID is required", { status: 400 });
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
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await verifyAuth(token);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const { 
      rating,
      title,
      content,
      status
    } = body;

    if (!rating) {
      return new NextResponse("Rating is required", { status: 400 });
    }

    if (!content) {
      return new NextResponse("Content is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUser = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUser) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const review = await prismadb.productReview.update({
      where: {
        id: params.reviewId
      },
      data: {
        rating,
        title,
        content,
        status
      },
      include: {
        product: true,
        customer: true
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
  { params }: { params: { reviewId: string, storeId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const session = await verifyAuth(token);
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Verify store ownership
    const storeByUser = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUser) {
      return new NextResponse("Unauthorized", { status: 403 });
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