import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { validatePrice } from "@/lib/utils";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();

    const { 
      name,
      description,
      price,
      images,
      colorId,
      sizeId,
      isFeatured,
      isArchived,
      taxonIds,
      // New fields
      slug,
      metaTitle,
      metaDescription,
      metaKeywords,
      sku,
      costPrice,
      compareAtPrice,
      status,
      availableOn,
      discontinueOn,
      taxCategory,
      shippingCategory,
      weight,
      height,
      width,
      depth,
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    // Generate slug if not provided
    const finalSlug = slug || name.toLowerCase().replace(/\s+/g, '-');

    const product = await prismadb.product.create({
      data: {
        name,
        slug: finalSlug,
        description,
        storeId: params.storeId,
        price: price ? parseFloat(price) : null,
        costPrice: costPrice ? parseFloat(costPrice) : null,
        compareAtPrice: compareAtPrice ? parseFloat(compareAtPrice) : null,
        status: status || 'draft',
        metaTitle,
        metaDescription,
        metaKeywords,
        sku,
        availableOn,
        discontinueOn,
        taxCategory,
        shippingCategory,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        width: width ? parseFloat(width) : null,
        depth: depth ? parseFloat(depth) : null,
        isMaster: true,
        colorId,
        sizeId,
        isFeatured,
        isArchived,
        images: {
          createMany: {
            data: images.map((image: { url: string, fileId: string }) => ({
              url: image.url,
              fileId: image.fileId
            }))
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
        status: isFeatured ? 'active' : undefined,
        variants: {
          some: {
            AND: [
              colorId ? { colorId } : {},
              sizeId ? { sizeId } : {},
            ]
          }
        }
      },
      include: {
        images: true,
        taxons: {
          include: {
            taxonomy: true
          }
        },
        variants: {
          include: {
            size: true,
            color: true,
            stockItems: true
          }
        }
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
