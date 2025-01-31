import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { 
  getAuthCookie, 
  generateCustomerToken, 
  getCustomerByEmail, 
  createCustomer 
} from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { email, password, name } = await req.json();
    const storeId = params.storeId;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Verify store exists
    const store = await prismadb.store.findUnique({
      where: { id: storeId }
    });

    if (!store) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Check if customer already exists
    const existingCustomer = await getCustomerByEmail(email, storeId);

    if (existingCustomer) {
      return new NextResponse("Email already in use", { status: 400 });
    }

    // Create new customer
    const customer = await createCustomer(email, password, storeId, name);

    // Generate token
    const token = generateCustomerToken(customer);

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

    // Create initial cart for customer
    await prismadb.order.create({
      data: {
        customerId: customer.id,
        storeId: storeId,
        status: "cart"
      }
    });

    const { password: _, ...safeCustomer } = customer;

    return NextResponse.json({
      customer: safeCustomer
    });
  } catch (error) {
    console.log('[CUSTOMER_REGISTER]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
