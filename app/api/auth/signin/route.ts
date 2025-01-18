import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { sign } from 'jsonwebtoken';
import { verifyPassword } from "@/lib/auth"; // Updated import

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return new NextResponse("Email and password are required", { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        password: true
      }
    });

    if (!user) {
      console.log("User not found:", email);
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    console.log("Found user:", { email: user.email, hashedPasswordLength: user.password.length });
    const isValid = await verifyPassword(password, user.password);
    console.log("Password verification result:", isValid);

    if (!isValid) {
      return new NextResponse("Invalid password", { status: 401 });
    }

    if (!process.env.JWT_SECRET) {
      console.error("JWT_SECRET is not defined");
      return new NextResponse("Server configuration error", { status: 500 });
    }

    const token = sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json(
      { success: true, redirectUrl: '/dashboard' },
      { status: 200 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 24 // 1 day
    });

    return response;
  } catch (error) {
    console.error("Sign-in error:", error);
    return NextResponse.json({ 
      error: 'Authentication failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
