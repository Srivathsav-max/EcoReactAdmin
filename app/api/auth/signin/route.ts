import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import prismadb from "@/lib/prismadb";
import { generateAdminToken } from "@/lib/auth";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Missing credentials", { status: 400 });
    }

    // Get user
    const user = await prismadb.user.findUnique({
      where: {
        email
      }
    });

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Check password
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // Get user's stores
    const stores = await prismadb.store.findMany({
      where: {
        userId: user.id
      },
      select: {
        id: true
      }
    });

    // Generate token
    const token = generateAdminToken({
      id: user.id,
      email: user.email
    });

    // Set cookie
    cookies().set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: 'admin'
      },
      stores: stores.map(store => store.id)
    });
  } catch (error) {
    console.log('[SIGNIN]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
