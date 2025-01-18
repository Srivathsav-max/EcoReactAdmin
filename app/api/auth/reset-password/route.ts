import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { hashPassword } from "@/lib/auth";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    const hashedPassword = await hashPassword(password);

    await prismadb.user.update({
      where: { email },
      data: { password: hashedPassword }
    });

    return NextResponse.json({
      success: true,
      message: "Password reset successfully"
    });

  } catch (error) {
    console.error('[RESET_PASSWORD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}