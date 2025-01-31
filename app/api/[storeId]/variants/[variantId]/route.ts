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
      return NextResponse.json({ success: false, message: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();

    // Extract stock count and clean up the data
    const { 
      stockCount,
      id,
      productId,
      createdAt,
      updatedAt,
      color,
      size,
      images,
      product,
      optionValues,
      stockItems,
      orderItems,
      stockMovements,
      ...variantData 
    } = body;

    try {
      const updatedVariant = await prismadb.$transaction(async (tx) => {
        // Update variant with cleaned data and type validation
        const variant = await tx.variant.update({
          where: { id: params.variantId },
          data: {
            name: String(variantData.name),
            sku: String(variantData.sku),
            price: Number(variantData.price),
            costPrice: variantData.costPrice ? Number(variantData.costPrice) : null,
            compareAtPrice: variantData.compareAtPrice ? Number(variantData.compareAtPrice) : null,
            isVisible: Boolean(variantData.isVisible),
            trackInventory: Boolean(variantData.trackInventory),
            minimumQuantity: Number(variantData.minimumQuantity),
            maximumQuantity: variantData.maximumQuantity ? Number(variantData.maximumQuantity) : null,
            weight: variantData.weight ? Number(variantData.weight) : null,
            height: variantData.height ? Number(variantData.height) : null,
            width: variantData.width ? Number(variantData.width) : null,
            depth: variantData.depth ? Number(variantData.depth) : null,
            allowBackorder: Boolean(variantData.allowBackorder),
            colorId: variantData.colorId || null,
            sizeId: variantData.sizeId || null,
            taxRate: variantData.taxRate ? String(variantData.taxRate) : "0",
            position: variantData.position ? Number(variantData.position) : 0,
            lowStockAlert: variantData.lowStockAlert ? Number(variantData.lowStockAlert) : null,
            barcode: variantData.barcode || null,
            dimensions: variantData.dimensions || null,
            customFields: variantData.customFields || null,
          },
          include: {
            stockItems: true,
            color: true,
            size: true,
            images: true
          }
        });

        // Handle stock update if provided
        if (typeof stockCount === 'number') {
          await tx.stockItem.upsert({
            where: {
              variantId_storeId: {
                variantId: params.variantId,
                storeId: params.storeId
              }
            },
            create: {
              variantId: params.variantId,
              storeId: params.storeId,
              count: stockCount,
              stockStatus: stockCount > 0 ? 'in_stock' : 'out_of_stock'
            },
            update: {
              count: stockCount,
              stockStatus: stockCount > 0 ? 'in_stock' : 'out_of_stock'
            }
          });
        }

        return variant;
      });

      return NextResponse.json({ success: true, data: updatedVariant });
    } catch (error) {
      console.error('[VARIANT_PATCH_TRANSACTION]', error);
      return NextResponse.json({
        success: false,
        message: error instanceof Error ? error.message : "Failed to update variant"
      }, { status: 500 });
    }
  } catch (error) {
    console.error('[VARIANT_PATCH]', error);
    return NextResponse.json({ success: false, message: "Internal error" }, { status: 500 });
  }
}

export async function DELETE(
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
