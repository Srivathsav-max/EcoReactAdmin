import prismadb from "@/lib/prismadb";
import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { deleteFile } from "@/lib/appwrite-config";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const body = await req.json();

    const { 
      name,
      description,
      price,
      images,
      brandId,
      isVisible,
      status,
      hasVariants,
      sku,
      barcode,
      tags = [],
      taxons = [],
      taxRate,
      weight,
      height,
      width,
      depth,
      minimumQuantity,
      maximumQuantity,
      optionTypes = [],
    } = body;

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Name is required"
      }, { status: 400 });
    }

    if (!images || !images.length) {
      return NextResponse.json({
        success: false,
        message: "At least one image is required"
      }, { status: 400 });
    }

    if (!price) {
      return NextResponse.json({
        success: false,
        message: "Price is required"
      }, { status: 400 });
    }

    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access to this store"
      }, { status: 403 });
    }

    // Generate slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const product = await prismadb.product.create({
      data: {
        name,
        slug,
        description,
        price: parseFloat(price.toString()),
        brandId,
        sku,
        barcode,
        status,
        isVisible,
        hasVariants,
        tags,
        taxRate: taxRate ? parseFloat(taxRate.toString()) : undefined,
        weight: weight ? parseFloat(weight.toString()) : undefined,
        height: height ? parseFloat(height.toString()) : undefined,
        width: width ? parseFloat(width.toString()) : undefined,
        depth: depth ? parseFloat(depth.toString()) : undefined,
        minimumQuantity: minimumQuantity || 1,
        maximumQuantity,
        storeId: params.storeId,
        images: {
          createMany: {
            data: images.map((image: { url: string; fileId: string }) => ({
              url: image.url,
              fileId: image.fileId,
            })),
          },
        },
        optionTypes: {
          createMany: {
            data: optionTypes.map((ot: any) => ({
              name: ot.name,
              presentation: ot.presentation,
              position: ot.position,
              storeId: params.storeId,
            })),
          },
        },
        taxons: {
          connect: taxons.map((taxonId: string) => ({ id: taxonId })),
        },
      },
      include: {
        images: true,
        brand: true,
        variants: {
          include: {
            stockItems: true,
          }
        },
        taxons: true,
      }
    });

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[PRODUCTS_POST]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to create product"
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const brandId = searchParams.get("brandId") || undefined;
    const isVisible = searchParams.get("isVisible");

    if (!params.storeId) {
      return NextResponse.json({
        success: false,
        message: "Store ID is required"
      }, { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access to this store"
      }, { status: 403 });
    }

    const products = await prismadb.product.findMany({
      where: {
        storeId: params.storeId,
        brandId: brandId || undefined,
        isVisible: isVisible ? isVisible === 'true' : undefined,
      },
      include: {
        images: true,
        brand: true,
        variants: {
          include: {
            stockItems: true,
          }
        },
        taxons: true,
        optionTypes: {
          include: {
            optionValues: true,
          }
        },
      },
      orderBy: {
        createdAt: 'desc',
      }
    });

    return NextResponse.json({
      success: true,
      data: products
    });
  } catch (error) {
    console.error('[PRODUCTS_GET]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch products"
    }, { status: 500 });
  }
}
