import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getServerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    let cart;
    
    if (session?.user?.email) {
      // Get customer's cart
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.user.email,
          storeId: storeId,
        }
      });

      cart = await prismadb.order.findFirst({
        where: {
          storeId,
          customerId: customer?.id,
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
    }

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
    const session = await getServerSession();
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

    let cart;
    
    if (session?.user?.email) {
      // Get or create customer's cart
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.user.email,
          storeId: storeId,
        }
      });

      if (!customer) {
        return new NextResponse("Customer not found", { status: 404 });
      }

      cart = await prismadb.order.findFirst({
        where: {
          storeId,
          customerId: customer.id,
          status: "cart",
        }
      });

      if (!cart) {
        cart = await prismadb.order.create({
          data: {
            storeId,
            customerId: customer.id,
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

      const variant = await prismadb.variant.findUnique({
        where: { id: variantId }
      });

      if (!variant) {
        return new NextResponse("Variant not found", { status: 404 });
      }

      if (existingItem) {
        // Update quantity
        await prismadb.orderItem.update({
          where: { id: existingItem.id },
          data: { quantity: existingItem.quantity + quantity }
        });
      } else {
        // Add new item
        await prismadb.orderItem.create({
          data: {
            orderId: cart.id,
            variantId,
            quantity,
            price: variant.price
          }
        });
      }

      cart = await prismadb.order.findFirst({
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
    }

    return NextResponse.json(cart || { orderItems: [] });
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
    const session = await getServerSession();
    const storeId = params.storeId;

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!itemId) {
      return new NextResponse("Item ID is required", { status: 400 });
    }

    let cart;
    
    if (session?.user?.email) {
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.user.email,
          storeId: storeId,
        }
      });

      if (!customer) {
        return new NextResponse("Customer not found", { status: 404 });
      }

      // Delete the item
      await prismadb.orderItem.delete({
        where: {
          id: itemId
        }
      });

      // Get updated cart
      cart = await prismadb.order.findFirst({
        where: {
          storeId,
          customerId: customer.id,
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
    }

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
    const session = await getServerSession();
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

    let cart;
    
    if (session?.user?.email) {
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.user.email,
          storeId: storeId,
        }
      });

      if (!customer) {
        return new NextResponse("Customer not found", { status: 404 });
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
      cart = await prismadb.order.findFirst({
        where: {
          storeId,
          customerId: customer.id,
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
    }

    return NextResponse.json(cart || { orderItems: [] });
  } catch (error) {
    console.log('[CART_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
