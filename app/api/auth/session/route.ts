import { NextResponse } from "next/server";
import { getAuthSession } from "@/lib/session";

export async function GET() {
  try {
    const session = await getAuthSession();

    if (!session) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...session,
      authenticated: true
    });
  } catch (error) {
    console.error('[AUTH_SESSION_GET]', error);
    return NextResponse.json(null);
  }
}