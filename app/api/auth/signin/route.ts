import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import prismadb from "@/lib/prismadb";
import { getAuthCookie } from "@/lib/auth";

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
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: 'admin' },
      process.env.JWT_SECRET!,
      { expiresIn: '7d' }
    );

    // Set cookie with proper configuration
    const cookieStore = await cookies();
    const cookieConfig = getAuthCookie(token, 'admin');
    cookieStore.set(cookieConfig.name, cookieConfig.value, {
      httpOnly: cookieConfig.httpOnly,
      secure: cookieConfig.secure,
      sameSite: cookieConfig.sameSite as 'lax',
      path: cookieConfig.path,
      expires: cookieConfig.expires
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
