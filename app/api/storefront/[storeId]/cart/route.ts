import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId) {
      return NextResponse.json({ orderItems: [] });
    }

    // Get customer's cart
    const cart = await prismadb.order.findFirst({
      where: {
        storeId,
        customerId: session.customerId,
        status: "cart",
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                images: true,
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(cart || { orderItems: [] });
  } catch (error) {
    console.log('[CART_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { variantId, quantity } = await req.json();
    const session = await getCustomerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    if (quantity < 1) {
      return new NextResponse("Quantity must be greater than 0", { status: 400 });
    }

    // Get or create cart
    let cart = await prismadb.order.findFirst({
      where: {
        storeId,
        customerId: session.customerId,
        status: "cart",
      }
    });

    if (!cart) {
      cart = await prismadb.order.create({
        data: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        }
      });
    }

    // Check if item exists in cart
    const existingItem = await prismadb.orderItem.findFirst({
      where: {
        orderId: cart.id,
        variantId
      }
    });

    // Check stock availability
    const stockItem = await prismadb.stockItem.findUnique({
      where: {
        variantId_storeId: {
          variantId,
          storeId
        }
      },
      include: {
        variant: true
      }
    });

    if (!stockItem || !stockItem.variant) {
      return new NextResponse("Stock not found for variant", { status: 404 });
    }

    const availableStock = stockItem.count - stockItem.reserved;
    const newQuantity = existingItem 
      ? existingItem.quantity + quantity 
      : quantity;

    if (availableStock < newQuantity) {
      return new NextResponse("Insufficient stock available", { status: 400 });
    }

    // Start a transaction for cart operations
    const updatedCart = await prismadb.$transaction(async (tx) => {
      // Reserve stock
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: {
          reserved: {
            increment: quantity
          }
        }
      });

      // Create stock movement for reservation
      await tx.stockMovement.create({
        data: {
          variantId,
          stockItemId: stockItem.id,
          quantity: quantity,
          type: "reserved",
          reason: `Cart reservation`,
          originatorType: "customer"
        }
      });

      if (existingItem) {
        // Update quantity
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // Add new item
        await tx.orderItem.create({
          data: {
            orderId: cart.id,
            variantId,
            quantity,
            price: stockItem.variant.price
          }
        });
      }

      // Return updated cart
      return await tx.order.findFirst({
        where: {
          id: cart.id
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  images: true,
                  product: true
                }
              }
            }
          }
        }
      });
    });

    return NextResponse.json(updatedCart);
  } catch (error) {
    console.log('[CART_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const itemId = searchParams.get('itemId');
    const session = await getCustomerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    // Get the item to be deleted
    const item = await prismadb.orderItem.findUnique({
      where: { id: itemId },
      include: {
        variant: true
      }
    });

    if (!item) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Start a transaction for delete operations
    await prismadb.$transaction(async (tx) => {
      // Find stock item
      const stockItem = await tx.stockItem.findUnique({
        where: {
          variantId_storeId: {
            variantId: item.variantId,
            storeId
          }
        }
      });

      if (stockItem) {
        // Unreserve stock
        await tx.stockItem.update({
          where: { id: stockItem.id },
          data: {
            reserved: {
              decrement: item.quantity
            }
          }
        });

        // Create stock movement for unreservation
        await tx.stockMovement.create({
          data: {
            variantId: item.variantId,
            stockItemId: stockItem.id,
            quantity: item.quantity,
            type: "unreserved",
            reason: "Item removed from cart",
            originatorType: "customer"
          }
        });
      }

      // Delete the item
      await tx.orderItem.delete({
        where: { id: itemId }
      });
    });

    // Get updated cart
    const updatedCart = await prismadb.order.findFirst({
      where: {
        storeId,
        customerId: session.customerId,
        status: "cart",
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                images: true,
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedCart || { orderItems: [] });
  } catch (error) {
    console.log('[CART_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { itemId, quantity } = await req.json();
    const session = await getCustomerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!session?.customerId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    if (quantity < 1) {
      return new NextResponse("Quantity must be greater than 0", { status: 400 });
    }

    // Get current item
    const currentItem = await prismadb.orderItem.findUnique({
      where: { id: itemId }
    });

    if (!currentItem) {
      return new NextResponse("Item not found", { status: 404 });
    }

    // Check stock availability for quantity change
    const stockItem = await prismadb.stockItem.findUnique({
      where: {
        variantId_storeId: {
          variantId: currentItem.variantId,
          storeId
        }
      }
    });

    if (!stockItem) {
      return new NextResponse("Stock not found", { status: 404 });
    }

    const quantityDiff = quantity - currentItem.quantity;
    const availableStock = stockItem.count - stockItem.reserved;

    if (quantityDiff > 0 && availableStock < quantityDiff) {
      return new NextResponse("Insufficient stock available", { status: 400 });
    }

    // Start a transaction for quantity update
    await prismadb.$transaction(async (tx) => {
      // Update stock reservation
      await tx.stockItem.update({
        where: { id: stockItem.id },
        data: {
          reserved: {
            increment: quantityDiff
          }
        }
      });

      // Create stock movement for reservation change
      if (quantityDiff !== 0) {
        await tx.stockMovement.create({
          data: {
            variantId: currentItem.variantId,
            stockItemId: stockItem.id,
            quantity: quantityDiff,
            type: quantityDiff > 0 ? "reserved" : "unreserved",
            reason: "Cart quantity updated",
            originatorType: "customer"
          }
        });
      }

      // Update item quantity
      await tx.orderItem.update({
        where: { id: itemId },
        data: { quantity }
      });
    });

    // Get updated cart
    const updatedCart = await prismadb.order.findFirst({
      where: {
        storeId,
        customerId: session.customerId,
        status: "cart",
      },
      include: {
        orderItems: {
          include: {
            variant: {
              include: {
                images: true,
                product: true
              }
            }
          }
        }
      }
    });

    return NextResponse.json(updatedCart || { orderItems: [] });
  } catch (error) {
    console.log('[CART_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
