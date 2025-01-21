import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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
      productId,
      customerId,
      rating,
      title,
      content,
      status = "pending"
    } = body;

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    if (!customerId) {
      return new NextResponse("Customer ID is required", { status: 400 });
    }

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

    const review = await prismadb.productReview.create({
      data: {
        productId,
        customerId,
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
    console.log('[REVIEWS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const productId = searchParams.get('productId');
    const status = searchParams.get('status');
    const customerId = searchParams.get('customerId');

    const reviews = await prismadb.productReview.findMany({
      where: {
        product: {
          storeId: params.storeId
        },
        ...(productId && { productId }),
        ...(status && { status }),
        ...(customerId && { customerId })
      },
      include: {
        product: true,
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(reviews);
  } catch (error) {
    console.log('[REVIEWS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 