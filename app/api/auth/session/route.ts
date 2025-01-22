import { NextResponse } from "next/server";
import { verifyAuth, isAdmin } from "@/lib/auth";

export async function GET() {
  try {
    const session = await verifyAuth();

    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    return NextResponse.json({
      user: {
        id: session.userId,
        email: session.email,
        role: 'admin'
      }
    });
  } catch (error) {
    console.log('[SESSION]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}