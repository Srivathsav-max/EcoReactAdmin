import { NextResponse } from 'next/server';
import { getUserByEmail, verifyPassword } from '@/lib/auth';
import { sign } from 'jsonwebtoken';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const user = await getUserByEmail(email);
    if (!user || !await verifyPassword(password, user.password)) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }

    const token = sign(
      { sub: user.id, email: user.email },
      process.env.JWT_SECRET!,
      { expiresIn: '1d' }
    );

    const response = NextResponse.json(
      { 
        success: true,
        redirectUrl: '/dashboard' 
      },
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
