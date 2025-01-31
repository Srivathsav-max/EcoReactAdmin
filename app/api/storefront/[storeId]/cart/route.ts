import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCustomerSession } from "@/lib/auth";

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

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

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

    if (!variantId) {
      return new NextResponse("Variant ID is required", { status: 400 });
    }

    if (quantity < 1) {
      return new NextResponse("Quantity must be greater than 0", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const cart = await prismadb.$transaction(async (tx) => {
      // Find variant first
      const variant = await tx.variant.findUnique({
        where: { 
          id: typeof variantId === 'object' ? variantId.id : variantId 
        },
        include: {
          product: true,
          images: true
        }
      });

      if (!variant) {
        throw new Error("Variant not found");
      }

      let currentCart = await tx.order.findFirst({
        where: {
          storeId,
          customerId: session.customerId,
          status: "cart",
        },
        include: {
          orderItems: true
        }
      });

      if (!currentCart) {
        currentCart = await tx.order.create({
          data: {
            storeId,
            customerId: session.customerId,
            status: "cart",
          },
          include: {
            orderItems: true
          }
        });
      }

      // Handle item addition
      const variantIdToUse = typeof variantId === 'object' ? variantId.id : variantId;
      const existingItem = currentCart.orderItems.find(item => item.variantId === variantIdToUse);

      if (existingItem) {
        await tx.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        await tx.orderItem.create({
          data: {
            orderId: currentCart.id,
            variantId: variantIdToUse,
            quantity,
            price: variant.price
          }
        });
      }

      // Return updated cart
      return await tx.order.findFirst({
        where: {
          id: currentCart.id
        },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  images: true,
                  product: {
                    select: {
                      id: true,
                      name: true
                    }
                  }
                }
              }
            }
          }
        }
      });
    });

    if (!cart?.id) {
      throw new Error("Cart not found after transaction");
    }

    return NextResponse.json(cart);
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

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Delete the item
    await prismadb.orderItem.delete({
      where: {
        id: itemId
      }
    });

    // Get updated cart
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

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    if (quantity < 1) {
      return new NextResponse("Quantity must be greater than 0", { status: 400 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Update item quantity
    await prismadb.orderItem.update({
      where: {
        id: itemId
      },
      data: {
        quantity
      }
    });

    // Get updated cart
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
    console.log('[CART_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
