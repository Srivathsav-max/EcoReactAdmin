import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string; variantId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    const body = await req.json();

    // Update variant
    const updatedVariant = await prismadb.variant.update({
      where: {
        id: params.variantId
      },
      data: {
        name: body.name,
        sku: body.sku,
        price: body.price,
        costPrice: body.costPrice,
        compareAtPrice: body.compareAtPrice,
        colorId: body.colorId,
        sizeId: body.sizeId,
        isVisible: body.isVisible,
        trackInventory: body.trackInventory,
        minimumQuantity: body.minimumQuantity,
        maximumQuantity: body.maximumQuantity,
        weight: body.weight,
        height: body.height,
        width: body.width,
        depth: body.depth,
        allowBackorder: body.allowBackorder,
      }
    });

    // Update stock if provided
    if (body.stockCount !== undefined) {
      await prismadb.stockItem.upsert({
        where: {
          variantId_storeId: {
            variantId: params.variantId,
            storeId: params.storeId
          }
        },
        create: {
          variantId: params.variantId,
          storeId: params.storeId,
          count: body.stockCount,
          stockStatus: body.stockCount > 0 ? 'in_stock' : 'out_of_stock'
        },
        update: {
          count: body.stockCount,
          stockStatus: body.stockCount > 0 ? 'in_stock' : 'out_of_stock'
        }
      });

      // Create stock movement record
      await prismadb.stockMovement.create({
        data: {
          variantId: params.variantId,
          stockItemId: (await prismadb.stockItem.findUnique({
            where: {
              variantId_storeId: {
                variantId: params.variantId,
                storeId: params.storeId
              }
            }
          }))!.id,
          quantity: body.stockCount,
          type: 'adjustment',
          reason: 'Manual stock update'
        }
      });
    }

    return NextResponse.json({
      success: true,
      data: updatedVariant
    });
  } catch (error) {
    console.error('[VARIANT_PATCH]', error);
    return NextResponse.json({
      success: false,
      message: "Internal error"
    }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { variantId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized"
      }, { status: 401 });
    }

    // Delete variant (this will cascade delete related stock items and movements)
    await prismadb.variant.delete({
      where: {
        id: params.variantId
      }
    });

    return NextResponse.json({
      success: true,
      message: "Variant deleted"
    });
  } catch (error) {
    console.error('[VARIANT_DELETE]', error);
    return NextResponse.json({
      success: false,
      message: "Internal error"
    }, { status: 500 });
  }
}