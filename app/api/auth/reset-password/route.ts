import { NextResponse } from 'next/server';
import prismadb from "@/lib/prismadb";
import { hashPassword } from "@/lib/password";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log('Reset password request body:', body); // Debug log

    const { email, password } = body; // Changed from newPassword to password to match frontend

    if (!email || !password) {
      console.log('Missing required fields:', { email: !!email, password: !!password }); // Debug log
      return NextResponse.json(
        { 
          success: false, 
          message: `Required fields missing: ${!email ? 'email' : ''} ${!password ? 'password' : ''}`.trim() 
        },
        { status: 400 }
      );
    }

    // Find the user first
    const user = await prismadb.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 }
      );
    }

    const hashedPassword = await hashPassword(password);
    console.log('Updating password for email:', email); // Debug log

    // Update user's password
    await prismadb.user.update({
      where: { email },
      data: {
        password: hashedPassword,
      },
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Password updated successfully' 
    });

  } catch (error) {
    console.error('Reset password error:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to reset password' },
      { status: 500 }
    );
  }
}