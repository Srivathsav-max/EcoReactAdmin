import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request
) {
  try {
    const cookieStore = cookies();
    
    // Clear customer token with proper options
    cookieStore.delete({
      name: 'customer_token',
      path: '/',
      secure: process.env.NODE_ENV === 'production',
      httpOnly: true,
      sameSite: 'lax'
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[CUSTOMER_LOGOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
