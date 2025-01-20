import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { productId: string } }
) {
  try {
    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        size: true,
        color: true,
        taxons: true // Replace category with taxons
      }
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 403 });
    
    const session = await verifyAuth(token);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 403 });

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const product = await prismadb.product.delete({
      where: {
        id: params.productId
      },
    });
  
    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { productId: string, storeId: string } }
) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 403 });
    
    const session = await verifyAuth(token);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 403 });

    const body = await req.json();
    const { name, price, taxonIds, images, colorId, sizeId, isFeatured, isArchived } = body;

    if (!params.productId) {
      return new NextResponse("Product id is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!images || !images.length) {
      return new NextResponse("Images are required", { status: 400 });
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

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Delete existing images first
    await prismadb.image.deleteMany({
      where: {
        productId: params.productId
      }
    });

    // Update product with new images
    const product = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        price,
        colorId,
        sizeId,
        images: {
          createMany: {
            data: images.map((image: { url: string, fileId: string }) => ({
              url: image.url,
              fileId: image.fileId
            }))
          }
        },
        isFeatured,
        isArchived,
        taxons: {
          set: taxonIds?.map((id: string) => ({ id })) || []
        }
      },
    });

    return NextResponse.json(product);
  } catch (error) {
    console.log('[PRODUCT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
