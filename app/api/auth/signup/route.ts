import { NextResponse } from 'next/server';
import { createUser, getUserByEmail } from '@/lib/auth';

export async function POST(req: Request) {
  try {
    const { email, password } = await req.json();

    const existingUser = await getUserByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    const user = await createUser(email, password);
    return NextResponse.json(
      { user: { id: user.id, email: user.email } },
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { error: 'Something went wrong' },
      { status: 500 }
    );
  }
}
