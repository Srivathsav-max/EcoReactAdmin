import { NextResponse } from "next/server";
import { CartItem } from "@/hooks/use-cart";
import prismadb from "@/lib/prismadb";
import { stripe } from "@/lib/stripe";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

export async function OPTIONS() {
  return NextResponse.json({}, { headers: corsHeaders });
}

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { items } = await req.json();

    if (!items?.length) {
      return new NextResponse("Cart items are required", { status: 400 });
    }

    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const line_items = await Promise.all(
      items.map(async (item: CartItem) => {
        return {
          quantity: item.quantity,
          price_data: {
            currency: 'USD',
            product_data: {
              name: item.name,
              images: [item.image],
            },
            unit_amount: Math.round(item.price * 100)
          }
        };
      })
    );

    const order = await prismadb.order.create({
      data: {
        storeId: params.storeId,
        isPaid: false,
        orderItems: {
          create: items.map((item: CartItem) => ({
            productId: item.id,
            quantity: item.quantity
          }))
        }
      }
    });

    const session = await stripe.checkout.sessions.create({
      line_items,
      mode: 'payment',
      billing_address_collection: 'required',
      phone_number_collection: {
        enabled: true
      },
      success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
      cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
      metadata: {
        orderId: order.id,
        storeId: params.storeId,
      },
    });

    return NextResponse.json({ url: session.url }, {
      headers: corsHeaders
    });

  } catch (error) {
    console.log('[CHECKOUT_ERROR]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
