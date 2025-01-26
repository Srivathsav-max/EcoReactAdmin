import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { hashPassword } from "@/lib/auth";
import { getStoreByDomain } from "@/actions/get-store-by-domain";

export async function POST(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Store domain is required", { status: 400 });
    }

    const store = await getStoreByDomain(domain);

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if customer already exists for this store
    const existingCustomer = await prismadb.customer.findFirst({
      where: {
        email,
        storeId: store.id
      }
    });

    if (existingCustomer) {
      return new NextResponse("Customer already exists", { status: 409 });
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create customer
    const customer = await prismadb.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        storeId: store.id,
      },
      select: {
        id: true,
        name: true,
        email: true,
      }
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.log('[CUSTOMER_SIGNUP]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}