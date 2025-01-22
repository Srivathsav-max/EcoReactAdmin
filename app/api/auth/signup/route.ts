import { NextResponse } from "next/server";
import { getUserByEmail, createUser } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { name, email, password } = body;

    if (!email || !name || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Check if user exists
    const existingUser = await getUserByEmail(email);
    
    if (existingUser) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    // Create user
    const user = await createUser(email, password);

    // Create default store for the user
    const store = await prismadb.store.create({
      data: {
        name: `${name}'s Store`,
        userId: user.id,
        currency: process.env.DEFAULT_STORE_CURRENCY || 'USD',
        locale: process.env.DEFAULT_STORE_LOCALE || 'en-US',
        domain: `${name.toLowerCase().replace(/[^a-z0-9]/g, '-')}-${Date.now()}`
      }
    });

    // Update user name
    await prismadb.user.update({
      where: { id: user.id },
      data: { name }
    });

    return NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        name
      }
    });
  } catch (error) {
    console.log('[SIGNUP]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
