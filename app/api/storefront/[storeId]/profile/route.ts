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

    console.log('[PROFILE_DEBUG] Session:', session);
    console.log('[PROFILE_DEBUG] StoreId from params:', storeId);

    if (!session) {
      return new NextResponse("No session found", { status: 401 });
    }

    if (!session.customerId) {
      return new NextResponse("No customer ID in session", { status: 401 });
    }

    if (session.storeId !== storeId) {
      console.log('[PROFILE_DEBUG] Store ID mismatch:', { 
        sessionStoreId: session.storeId, 
        paramsStoreId: storeId 
      });
      return new NextResponse("Store ID mismatch", { status: 401 });
    }

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Get customer profile with orders
    const customer = await prismadb.customer.findUnique({
      where: {
        id: session.customerId,
      },
      include: {
        orders: {
          where: {
            status: {
              not: "cart"
            }
          },
          orderBy: {
            createdAt: "desc"
          },
          include: {
            orderItems: {
              include: {
                variant: {
                  include: {
                    product: true
                  }
                }
              }
            }
          }
        }
      }
    });

    if (!customer) {
      return new NextResponse("Customer not found", { status: 404 });
    }

    // Remove sensitive data
    const { password, ...safeCustomer } = customer;

    return NextResponse.json(safeCustomer);
  } catch (error) {
    console.error('[CUSTOMER_PROFILE_GET]', error);
    return new NextResponse("Failed to load profile", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getCustomerSession();
    const storeId = params.storeId;
    const body = await req.json();

    if (!session?.customerId || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    // Validate fields
    const { name, phone, address } = body;
    const updateData: any = {};

    if (name) updateData.name = name;
    if (phone) updateData.phone = phone;
    if (address) updateData.address = address;

    // Update customer profile
    const customer = await prismadb.customer.update({
      where: {
        id: session.customerId,
      },
      data: updateData
    });

    // Remove sensitive data
    const { password, ...safeCustomer } = customer;

    return NextResponse.json(safeCustomer);
  } catch (error) {
    console.log('[CUSTOMER_PROFILE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
