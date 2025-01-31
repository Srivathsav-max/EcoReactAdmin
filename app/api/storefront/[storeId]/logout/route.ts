import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = cookies();
    
    // Clear customer token cookie
    cookieStore.delete('customer_token');

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[CUSTOMER_LOGOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
