import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findFirst({
      where: {
        id: params.productId,
        storeId: params.storeId,
        isArchived: false,
      },
      include: {
        images: true,
        color: true,
        size: true,
        taxons: {
          include: {
            taxonomy: true
          }
        }
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
