import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { authenticateCustomer } from "@/lib/auth-middleware";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const auth = await authenticateCustomer(req);
    if ('error' in auth) {
      return new NextResponse(auth.error, { status: auth.status });
    }

    const body = await req.json();
    const { name, phone } = body;

    const customer = await prismadb.customer.update({
      where: {
        id: auth.customer.id
      },
      data: {
        name,
        phone,
      },
      include: {
        addresses: {
          where: {
            isDefault: true
          }
        }
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.log('[CUSTOMER_PROFILE_UPDATE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const auth = await authenticateCustomer(req);
    if ('error' in auth) {
      return new NextResponse(auth.error, { status: auth.status });
    }

    const customer = await prismadb.customer.findUnique({
      where: {
        id: auth.customer.id
      },
      include: {
        addresses: true
      }
    });

    return NextResponse.json(customer);
  } catch (error) {
    console.log('[CUSTOMER_PROFILE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
