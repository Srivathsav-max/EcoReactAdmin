import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // First get the taxons of the current product
    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId,
      },
      include: {
        taxons: true,
      }
    });

    if (!product) {
      return new NextResponse("Product not found", { status: 404 });
    }

    // Then find related products that share the same taxons
    const relatedProducts = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isArchived: false,
        id: {
          not: params.productId, // Exclude current product
        },
        taxons: {
          some: {
            id: {
              in: product.taxons.map(t => t.id)
            }
          }
        }
      },
      include: {
        images: true,
        taxons: true,
      },
      take: 4, // Limit to 4 related products
    });

    return NextResponse.json(relatedProducts);
  } catch (error) {
    console.log('[PUBLIC_RELATED_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
