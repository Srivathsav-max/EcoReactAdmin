import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCustomerSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // Get domain from query params
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    // Get store by domain
    const store = await prismadb.store.findFirst({
      where: {
        domain
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const session = await getCustomerSession();

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const customer = await prismadb.customer.findFirst({
      where: {
        storeId: store.id,
        email: session.email,
      },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        addresses: {
          where: {
            isDefault: true,
          },
          take: 1,
        },
      }
    });

    if (!customer) {
      return new NextResponse("Not found", { status: 404 });
    }

    // Format response
    return NextResponse.json({
      ...customer,
      address: customer.addresses[0]?.street || "",
      city: customer.addresses[0]?.city || "",
      state: customer.addresses[0]?.state || "",
      postalCode: customer.addresses[0]?.postalCode || "",
      country: customer.addresses[0]?.country || "",
    });

  } catch (error) {
    console.log('[CUSTOMER_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    // Get domain from query params
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    // Get store by domain
    const store = await prismadb.store.findFirst({
      where: {
        domain
      }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const session = await getCustomerSession();
    const body = await req.json();

    const { name, phone, address, city, state, postalCode, country } = body;

    if (!session) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const customer = await prismadb.customer.update({
      where: {
        email_storeId: {
          email: session.email,
          storeId: store.id,
        },
      },
      data: {
        name,
        phone,
        addresses: {
          upsert: {
            where: {
              id: await prismadb.address.findFirst({
                where: {
                  customerId: session.customerId,
                  type: 'shipping',
                  isDefault: true
                }
              }).then(addr => addr?.id || '0')
            },
            create: {
              type: 'shipping',
              street: address,
              city,
              state,
              postalCode,
              country,
              isDefault: true,
            },
            update: {
              street: address,
              city,
              state,
              postalCode,
              country,
            },
          },
        },
      },
      include: {
        addresses: {
          where: {
            isDefault: true,
          },
        },
      },
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.log('[CUSTOMER_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
