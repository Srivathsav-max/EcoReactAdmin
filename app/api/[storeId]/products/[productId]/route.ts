import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { deleteFile } from "@/lib/appwrite-config";
import { getAdminSession } from "@/lib/auth";
import type { Image, Size, Color } from "@prisma/client";

export async function GET(
  _req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    if (!params.productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
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

    const product = await prismadb.product.findUnique({
      where: {
        id: params.productId
      },
      include: {
        images: true,
        brand: true,
        variants: {
          include: {
            images: true,
            optionValues: {
              include: {
                optionValue: {
                  include: {
                    optionType: true
                  }
                }
              }
            },
            stockItems: true,
            size: true,
            color: true,
          }
        },
        taxons: true,
        optionTypes: {
          include: {
            optionValues: true
          }
        }
      }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    return NextResponse.json({
      success: true,
      data: product
    });
  } catch (error) {
    console.error('[PRODUCT_GET]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch product"
    }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
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

    if (!params.productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
      }, { status: 400 });
    }

    const currentProduct = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: { images: true }
    });

    if (!currentProduct) {
      return NextResponse.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Delete removed images from Appwrite
    const newImageFileIds = new Set(images.map((img: { fileId: string }) => img.fileId));
    for (const oldImage of currentProduct.images) {
      if (!newImageFileIds.has(oldImage.fileId)) {
        try {
          await deleteFile(oldImage.fileId);
        } catch (error) {
          console.error(`Failed to delete image ${oldImage.fileId}:`, error);
        }
      }
    }

    // Generate slug from name if name is being updated
    const slug = name ? name.toLowerCase().replace(/[^a-z0-9]/g, '-') : undefined;

    const updatedProduct = await prismadb.product.update({
      where: {
        id: params.productId
      },
      data: {
        name,
        slug,
        description,
        price: price ? parseFloat(price.toString()) : undefined,
        brandId,
        status,
        isVisible,
        hasVariants,
        sku,
        barcode,
        tags,
        taxRate: taxRate ? parseFloat(taxRate.toString()) : undefined,
        weight: weight ? parseFloat(weight.toString()) : undefined,
        height: height ? parseFloat(height.toString()) : undefined,
        width: width ? parseFloat(width.toString()) : undefined,
        depth: depth ? parseFloat(depth.toString()) : undefined,
        minimumQuantity,
        maximumQuantity,
        ...(images && {
          images: {
            deleteMany: {},
            createMany: {
              data: images.map((image: { url: string; fileId: string }) => ({
                url: image.url,
                fileId: image.fileId,
              })),
            },
          },
        }),
        ...(optionTypes && {
          optionTypes: {
            deleteMany: {},
            createMany: {
              data: optionTypes.map((ot: any) => ({
                name: ot.name,
                presentation: ot.presentation,
                position: ot.position,
                storeId: params.storeId,
              })),
            },
          },
        }),
        ...(taxons && {
          taxons: {
            set: taxons.map((taxonId: string) => ({ id: taxonId })),
          },
        }),
      }
    });

    return NextResponse.json({
      success: true,
      data: updatedProduct
    });
  } catch (error) {
    console.error('[PRODUCT_PATCH]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to update product"
    }, { status: 500 });
  }
}

export async function DELETE(
  _req: Request,
  { params }: { params: { storeId: string; productId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    if (!params.productId) {
      return NextResponse.json({
        success: false,
        message: "Product ID is required"
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

    const product = await prismadb.product.findUnique({
      where: { id: params.productId },
      include: { images: true }
    });

    if (!product) {
      return NextResponse.json({
        success: false,
        message: "Product not found"
      }, { status: 404 });
    }

    // Delete images from Appwrite
    for (const image of product.images) {
      try {
        await deleteFile(image.fileId);
      } catch (error) {
        console.error(`Failed to delete image ${image.fileId}:`, error);
      }
    }

    // Delete the product
    await prismadb.product.delete({
      where: {
        id: params.productId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Product deleted successfully"
    });
  } catch (error) {
    console.error('[PRODUCT_DELETE]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to delete product"
    }, { status: 500 });
  }
}
