export const dynamic = 'force-dynamic';

import { NextResponse } from "next/server";
import { getCustomerSession } from "@/lib/auth";

export async function GET() {
  try {
    const session = await getCustomerSession();

    if (!session) {
      return NextResponse.json(null);
    }

    return NextResponse.json({
      ...session,
      authenticated: true
    });
  } catch (error) {
    console.error('[CUSTOMER_SESSION_GET]', error);
    return NextResponse.json(null);
  }
}