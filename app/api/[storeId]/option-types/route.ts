import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { 
      name,
      presentation,
      position,
      productId,
    } = body;

    if (!name || !productId) {
      return new NextResponse("Name and Product ID are required", { status: 400 });
    }

    const optionType = await prismadb.productOptionType.create({
      data: {
        name,
        presentation,
        position: position || 0,
        productId,
      },
      include: {
        optionValues: true,
      }
    });
  
    return NextResponse.json(optionType);
  } catch (error) {
    console.log('[OPTION_TYPES_POST]', error);
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

    const optionTypes = await prismadb.productOptionType.findMany({
      where: {
        product: {
          storeId: params.storeId,
        },
        ...(productId && { productId }),
      },
      include: {
        optionValues: true,
        product: true,
      },
      orderBy: {
        position: 'asc',
      }
    });
  
    return NextResponse.json(optionTypes);
  } catch (error) {
    console.log('[OPTION_TYPES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 