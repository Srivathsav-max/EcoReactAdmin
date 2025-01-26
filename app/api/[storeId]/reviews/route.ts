import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access to this store"
      }, { status: 403 });
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
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    if (!customerId) {
      return NextResponse.json({
        success: false,
        message: "Customer ID is required"
      }, { status: 400 });
    }

    if (!rating) {
      return NextResponse.json({
        success: false,
        message: "Rating is required"
      }, { status: 400 });
    }

    if (!content) {
      return NextResponse.json({
        success: false,
        message: "Content is required"
      }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      data: review
    });
  } catch (error) {
    console.error('[REVIEWS_POST]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to create review"
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access to this store"
      }, { status: 403 });
    }

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

    return NextResponse.json({
      success: true,
      data: reviews
    });
  } catch (error) {
    console.error('[REVIEWS_GET]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch reviews"
    }, { status: 500 });
  }
}