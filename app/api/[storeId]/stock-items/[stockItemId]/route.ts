import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { cookies } from "next/headers";

export async function GET(
  req: Request,
  { params }: { params: { stockItemId: string } }
) {
  try {
    if (!params.stockItemId) {
      return new NextResponse("Stock item id is required", { status: 400 });
    }

    const stockItem = await prismadb.stockItem.findUnique({
      where: {
        id: params.stockItemId
      },
      include: {
        variant: {
          include: {
            product: true,
            color: true,
            size: true
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
      count,
      stockStatus,
      reserved,
      backorderedQty
    } = body;

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

    const stockItem = await prismadb.stockItem.update({
      where: {
        id: params.stockItemId
      },
      data: {
        count,
        stockStatus,
        reserved,
        backorderedQty
      },
      include: {
        variant: {
          include: {
            product: true
          }
        }
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
  { params }: { params: { stockItemId: string, storeId: string } }
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