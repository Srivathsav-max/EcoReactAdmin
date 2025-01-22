import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, productId: string } }
) {
  try {
    const body = await req.json();
    const { weight, height, width, depth, shippingCategory } = body;

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    const product = await prismadb.product.update({
      where: {
        AND: [
          { id: params.productId },
          { storeId: params.storeId }
        ]
      },
      data: {
        weight: weight,
        height: height,
        width: width,
        depth: depth,
        shippingCategory: shippingCategory
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_SHIPPING_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}