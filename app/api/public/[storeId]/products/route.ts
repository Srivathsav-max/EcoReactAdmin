import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const taxonId = searchParams.get('taxonId');
    const isFeatured = searchParams.get('isFeatured');
    const colorId = searchParams.get('colorId');
    const sizeId = searchParams.get('sizeId');

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        isArchived: false,
        ...(taxonId && {
          taxons: {
            some: {
              id: taxonId
            }
          }
        }),
        ...(isFeatured && {
          isFeatured: true
        }),
        ...(colorId && {
          colorId
        }),
        ...(sizeId && {
          sizeId
        })
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
    console.log('[PUBLIC_PRODUCTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
