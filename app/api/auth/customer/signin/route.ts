import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import prismadb from "@/lib/prismadb";
import { getCustomerByEmail, generateCustomerToken } from "@/lib/auth";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { email, password } = body;
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!email || !password || !domain) {
      return NextResponse.json({
        success: false,
        message: "Missing credentials or domain"
      }, { status: 400 });
    }

    // Find store by domain
    const store = await prismadb.store.findFirst({
      where: {
        domain: {
          in: [domain, domain.replace('www.', '')]
        }
      }
    });

    if (!store) {
      return NextResponse.json({
        success: false,
        message: "Store not found"
      }, { status: 404 });
    }

    // Find customer
    const customer = await getCustomerByEmail(email, store.id);

    if (!customer) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials"
      }, { status: 401 });
    }

    const isPasswordValid = await bcrypt.compare(password, customer.password);

    if (!isPasswordValid) {
      return NextResponse.json({
        success: false,
        message: "Invalid credentials"
      }, { status: 401 });
    }

    // Generate customer token
    const token = generateCustomerToken({
      id: customer.id,
      email: customer.email,
      storeId: store.id
    });

    // Set cookie
    const cookieStore = await cookies();
    cookieStore.set('customer_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      // Use the store's domain in production
      domain: process.env.NODE_ENV === 'production' ? domain : undefined,
      expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    });

    return NextResponse.json({ 
      success: true,
      data: { 
        id: customer.id, 
        email: customer.email,
        name: customer.name,
        role: 'customer',
        storeId: store.id
      } 
    });
  } catch (error) {
    console.error('[CUSTOMER_SIGNIN]', error);
    return NextResponse.json({
      success: false,
      message: error instanceof Error ? error.message : "Internal error"
    }, { status: 500 });
  }
}
