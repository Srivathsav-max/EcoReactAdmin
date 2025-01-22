import { NextResponse } from "next/server";

import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, productId: string } }
) {
  try {
    const body = await req.json();
    const { metaTitle, metaDescription, metaKeywords, slug } = body;

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!params.productId) {
      return new NextResponse("Product ID is required", { status: 400 });
    }

    // Validate slug format if provided
    if (slug) {
      const slugRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
      if (!slugRegex.test(slug)) {
        return new NextResponse("Invalid slug format. Use lowercase letters, numbers, and hyphens only.", { status: 400 });
      }

      // Check if slug is already in use by another product
      const existingProduct = await prismadb.product.findFirst({
        where: {
          AND: [
            { slug },
            { storeId: params.storeId },
            { id: { not: params.productId } }
          ]
        }
      });

      if (existingProduct) {
        return new NextResponse("Slug is already in use", { status: 400 });
      }
    }

    const product = await prismadb.product.update({
      where: {
        AND: [
          { id: params.productId },
          { storeId: params.storeId }
        ]
      },
      data: {
        metaTitle,
        metaDescription,
        metaKeywords,
        slug
      }
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_SEO_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}