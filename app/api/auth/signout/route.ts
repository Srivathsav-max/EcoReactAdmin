import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  try {
    // Clear admin token
    cookies().delete('token');

    return NextResponse.json({
      message: "Logged out successfully"
    });
  } catch (error) {
    console.log('[SIGNOUT]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
