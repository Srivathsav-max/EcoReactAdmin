import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getCustomerSession } from "@/lib/auth";

export async function GET(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({
        success: false,
        message: "Domain is required"
      }, { status: 400 });
    }

    // Get store by domain
    const store = await prismadb.store.findFirst({
      where: {
        domain
      }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: "Store not found"
      }, { status: 404 });
    }

    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Customer session not found"
      }, { status: 401 });
    }

    if (!session.storeId || session.storeId !== store.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Invalid store access"
      }, { status: 401 });
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
        storeId: true,
        addresses: {
          where: {
            isDefault: true,
          },
          take: 1,
        },
      },
    });

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: "Customer not found"
      }, { status: 404 });
    }

    console.log('Found customer:', customer); // Debug log
    
    // Format response
    return NextResponse.json({
      success: true,
      data: {
        ...customer,
        address: customer.addresses[0]?.street || "",
        storeId: customer.storeId,
        city: customer.addresses[0]?.city || "",
        state: customer.addresses[0]?.state || "",
        postalCode: customer.addresses[0]?.postalCode || "",
        country: customer.addresses[0]?.country || "",
      }
    });

  } catch (error) {
    console.error('[CUSTOMER_PROFILE_GET]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal error"
    }, { status: 500 });
  }
}

export async function PATCH(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return NextResponse.json({
        success: false,
        message: "Domain is required"
      }, { status: 400 });
    }

    // Get store by domain
    const store = await prismadb.store.findFirst({
      where: {
        domain
      }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: "Store not found"
      }, { status: 404 });
    }

    const session = await getCustomerSession();
    const body = await req.json();

    const { name, phone, address, city, state, postalCode, country } = body;

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Customer session not found"
      }, { status: 401 });
    }

    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Name is required"
      }, { status: 400 });
    }

    if (!session.storeId || session.storeId !== store.id) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized: Invalid store access"
      }, { status: 401 });
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

    return NextResponse.json({
      success: true,
      data: customer
    });
  } catch (error) {
    console.error('[CUSTOMER_PROFILE_PATCH]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal error"
    }, { status: 500 });
  }
}
