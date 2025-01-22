import { NextResponse } from "next/server";
import { verifyAuth, isCustomer } from "@/lib/auth";

export async function GET(
  req: Request
) {
  try {
    const { searchParams } = new URL(req.url);
    const storeId = searchParams.get('storeId');

    if (!storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const session = await verifyAuth();

    if (!session || !isCustomer(session) || session.storeId !== storeId) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.customerId,
        email: session.email,
        role: 'customer',
        storeId: session.storeId
      }
    });
  } catch (error) {
    console.log('[CUSTOMER_SESSION]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}