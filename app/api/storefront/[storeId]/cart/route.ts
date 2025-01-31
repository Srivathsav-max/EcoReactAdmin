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

    // Verify store exists
    const store = await prismadb.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    let cart;
    
    if (session?.email) {
      console.log('Looking up customer with email:', session.email, 'and storeId:', storeId);
      // Get customer's cart
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.email,
          storeId: storeId,
        }
      });

      console.log('Found customer:', customer);
      
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

    let cart;
    
    if (session?.email) {
      // Get or create customer's cart
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.email,
          storeId: storeId,
        }
      });

      if (!customer || customer.storeId !== storeId) {
        console.log('Customer not found or store mismatch:', { customer, storeId });
        return new NextResponse("Customer not found", { status: 404 });
      }

      console.log('Looking for existing cart...');
      cart = await prismadb.order.findFirst({
        where: {
          storeId,
          customerId: customer.id,
          status: "cart",
        },
        include: {
          orderItems: true
        }
      });

      // Ensure variantId is a string and use a transaction to ensure cart creation and item addition succeed together
      const variant = await prismadb.variant.findUnique({
        where: { 
          id: typeof variantId === 'object' ? variantId.id : variantId 
        },
        include: {
          product: true,
          images: true
        }
      });

      if (!variant) {
        return new NextResponse("Variant not found", { status: 404 });
      }

      cart = await prismadb.$transaction(async (tx) => {
        let currentCart = await tx.order.findFirst({
          where: {
            storeId,
            customerId: customer.id,
            status: "cart",
          },
          include: {
            orderItems: true
          }
        });

        if (!currentCart) {
          console.log('Creating new cart...');
          currentCart = await tx.order.create({
            data: {
              storeId,
              customerId: customer.id,
              status: "cart",
            },
            include: {
              orderItems: true
            }
          });
          console.log('Created new cart:', currentCart);
        }

        if (!currentCart) {
          throw new Error('Failed to create cart');
        }

        const variantIdToUse = typeof variantId === 'object' ? variantId.id : variantId;
        const existingItem = currentCart.orderItems.find(item => item.variantId === variantIdToUse);

        if (existingItem && currentCart.id) {
          console.log('Updating existing item quantity');
          await tx.orderItem.update({
            where: { id: existingItem.id },
            data: { quantity: existingItem.quantity + quantity }
          });
        } else if (currentCart.id) {
          console.log('Creating new order item');
          await tx.orderItem.create({
            data: {
              orderId: currentCart.id,
              variantId: variantIdToUse,
              quantity,
              price: variant.price
            }
          });
        }

        // Get the final cart state within the transaction
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

      // Get final cart state with all items
      cart = await prismadb.order.findUnique({
        where: {
          id: cart.id
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

      if (cart?.orderItems) {
        console.log(`Final cart state: ${cart.orderItems.length} items`);
        cart.orderItems.forEach((item, index) => {
          console.log(`Item ${index + 1}:`, {
            id: item.id,
            variantId: item.variantId,
            quantity: item.quantity,
            variant: item.variant?.product?.name
          });
        });
      }
    }

    if (!cart) {
      console.log('No cart found after operations');
      return NextResponse.json({ orderItems: [] });
    }

    console.log('Returning cart with items:', cart.orderItems);
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

    let cart;
    
    if (session?.email) {
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.email,
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

    let cart;
    
    if (session?.email) {
      const customer = await prismadb.customer.findFirst({
        where: {
          email: session.email,
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
