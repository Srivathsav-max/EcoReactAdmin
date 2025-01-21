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
      name,
      productId, 
      colorId, 
      sizeId, 
      price,
      sku,
      stockCount,
      compareAtPrice,
      costPrice,
      allowBackorder,
      lowStockAlert
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!productId) {
      return new NextResponse("Product ID is required", { status: 400 });
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

    const variant = await prismadb.variant.create({
      data: {
        name,
        productId,
        colorId: colorId || null,
        sizeId: sizeId || null,
        price: price || 0,
        sku: sku || null,
        compareAtPrice: compareAtPrice || null,
        costPrice: costPrice || null,
        allowBackorder: allowBackorder || false,
        lowStockAlert: lowStockAlert || null,
        stockItems: {
          create: stockCount ? [{
            count: stockCount,
            storeId: params.storeId,
          }] : []
        }
      },
      include: {
        stockItems: true,
        color: true,
        size: true,
      }
    });

    return NextResponse.json(variant);
  } catch (error) {
    console.log('[VARIANTS_POST]', error);
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
    const colorId = searchParams.get('colorId');
    const sizeId = searchParams.get('sizeId');

    const variants = await prismadb.variant.findMany({
      where: {
        product: {
          storeId: params.storeId,
        },
        ...(productId && { productId }),
        ...(colorId && { colorId }),
        ...(sizeId && { sizeId }),
      },
      include: {
        product: true,
        color: true,
        size: true,
        stockItems: true,
        images: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(variants);
  } catch (error) {
    console.log('[VARIANTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 