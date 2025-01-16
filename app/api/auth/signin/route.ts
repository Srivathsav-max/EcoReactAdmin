import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { sign } from 'jsonwebtoken';
import { verifyPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { email, password } = body;

    const user = await prismadb.user.findUnique({
      where: { email }
    });

    if (!user) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    const isValid = await verifyPassword(password, user.password);
    if (!isValid) {
      return new NextResponse("Invalid credentials", { status: 401 });
    }

    // ...rest of your signin logic with JWT...
    const token = sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
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
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
