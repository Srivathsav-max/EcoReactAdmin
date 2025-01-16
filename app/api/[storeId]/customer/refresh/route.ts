import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { generateTokens } from "@/lib/auth-middleware";

const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { refreshToken } = body;

    if (!refreshToken) {
      return new NextResponse("Refresh token required", { status: 400 });
    }

    const decoded = jwt.verify(refreshToken, REFRESH_SECRET) as {
      customerId: string;
      storeId: string;
    };

    const tokens = generateTokens(decoded.customerId, decoded.storeId);

    return NextResponse.json(tokens);
  } catch (error) {
    console.log('[REFRESH_TOKEN]', error);
    return new NextResponse("Invalid refresh token", { status: 401 });
  }
}
