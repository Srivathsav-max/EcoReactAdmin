import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getAuthCookie, generateCustomerToken, verifyPassword, getCustomerByEmail } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, password } = await req.json();
    const storeId = params.storeId;

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // Get customer
    const customer = await getCustomerByEmail(email, storeId);

    if (!customer) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, customer.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Generate token with correct payload structure
    const token = generateCustomerToken({
      id: customer.id,
      email: customer.email,
      storeId: storeId // Using storeId from params
    });

    console.log('[AUTH_DEBUG] Generated token payload:', {
      customerId: customer.id,
      email: customer.email,
      storeId: storeId
    });

    // Set cookie
    const cookieStore = cookies();
    const cookieConfig = getAuthCookie(token, 'customer');
    cookieStore.set(cookieConfig.name, cookieConfig.value, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite as 'lax',
      path: cookieConfig.path,
      expires: cookieConfig.expires
    });

    return NextResponse.json({
      customer: {
        id: customer.id,
        name: customer.name,
        email: customer.email
      }
    });
  } catch (error) {
    console.log('[CUSTOMER_AUTH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
