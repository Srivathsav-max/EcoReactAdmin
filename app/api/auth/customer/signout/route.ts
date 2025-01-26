import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
) {
  try {
    const { searchParams } = new URL(req.url);
    const domain = searchParams.get('domain');

    if (!domain) {
      return new NextResponse("Domain is required", { status: 400 });
    }

    // Clear customer token with proper domain settings
    cookies().delete('customer_token', {
      // Use the store's domain in production
      domain: process.env.NODE_ENV === 'production' ? domain : undefined,
      path: '/'
    });

    return NextResponse.json({
      message: "Logged out successfully"
    });
  } catch (error) {
    console.log('[CUSTOMER_SIGNOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}