import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validatePrice } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();

    // Validate required fields
    const { 
      name, 
      price,
      images, 
      colorId, 
      sizeId, 
      isFeatured, 
      isArchived,
      taxonIds 
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!price) {
      return new NextResponse("Price is required", { status: 400 });
    }

    if (!colorId) {
      return new NextResponse("Color id is required", { status: 400 });
    }

    if (!sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Format price to always have 2 decimal places
    const formattedPrice = Number(parseFloat(price.toString()).toFixed(2));

    const product = await prismadb.product.create({
      data: {
        name,
        price: formattedPrice,
        storeId: params.storeId,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          createMany: {
            data: images
          }
        },
        ...(taxonIds && taxonIds.length > 0 ? {
          taxons: {
            connect: taxonIds.map((id: string) => ({ id }))
          }
        } : {})
      },
      include: {
        images: true,
        taxons: true
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const colorId = searchParams.get('colorId') || undefined;
    const sizeId = searchParams.get('sizeId') || undefined;
    const isFeatured = searchParams.get('isFeatured');

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        colorId,
        sizeId,
        isFeatured: isFeatured ? true : undefined,
        isArchived: false,
      },
      include: {
        images: true,
        color: true,
        size: true,
        taxons: true,
      },
      orderBy: {
        createdAt: 'desc',
      }
    });
  
    return NextResponse.json(products);
  } catch (error) {
    console.log('[PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
