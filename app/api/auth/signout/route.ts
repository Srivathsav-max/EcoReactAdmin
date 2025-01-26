import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST(
  req: Request,
) {
  try {
    const cookieStore = await cookies();
    
    // Clear both tokens to ensure complete signout
    cookieStore.delete('admin_token');
    cookieStore.delete('customer_token');

    return NextResponse.json({
      success: true
    });
  } catch (error) {
    console.log('[SIGNOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
