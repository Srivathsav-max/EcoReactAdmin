import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, stockItemId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.stockItemId) {
      return new NextResponse("Stock Item ID is required", { status: 400 });
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

    const stockItem = await prismadb.stockItem.findFirst({
      where: {
        id: params.stockItemId,
        storeId: params.storeId,
      },
      include: {
        variant: {
          include: {
            product: true
          }
        },
        stockMovements: {
          orderBy: {
            createdAt: 'desc'
          }
        }
      }
    });
  
    return NextResponse.json(stockItem);
  } catch (error) {
    console.log('[STOCK_ITEM_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, stockItemId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { count } = body;

    if (typeof count !== 'number') {
      return new NextResponse("Count must be a number", { status: 400 });
    }

    if (!params.stockItemId) {
      return new NextResponse("Stock Item ID is required", { status: 400 });
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

    const stockItem = await prismadb.stockItem.update({
      where: {
        id: params.stockItemId
      },
      data: {
        count
      }
    });
  
    return NextResponse.json(stockItem);
  } catch (error) {
    console.log('[STOCK_ITEM_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, stockItemId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.stockItemId) {
      return new NextResponse("Stock Item ID is required", { status: 400 });
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

    const stockItem = await prismadb.stockItem.delete({
      where: {
        id: params.stockItemId
      }
    });
  
    return NextResponse.json(stockItem);
  } catch (error) {
    console.log('[STOCK_ITEM_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}