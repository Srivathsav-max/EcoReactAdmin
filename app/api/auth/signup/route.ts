import { NextResponse } from "next/server";
import { createUser, generateAdminToken } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const body = await req.json();
    const { email, password, name } = body;

    if (!email || !password || !name) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // Create the user
    const user = await createUser(email, password, name);

    // Get super admin role
    const superAdminRole = await prismadb.role.findFirst({
      where: { name: "Super Admin" } // This name matches DefaultRoles.SUPER_ADMIN.name
    });

    if (!superAdminRole) {
      return new NextResponse("System not properly initialized", { status: 500 });
    }

    // Create a default store for the user
    const store = await prismadb.store.create({
      data: {
        name: `${name}'s Store`,
        userId: user.id,
      }
    });

    // Assign super admin role to user for this store
    await prismadb.roleAssignment.create({
      data: {
        userId: user.id,
        roleId: superAdminRole.id,
        storeId: store.id,
      }
    });

    // Generate admin token
    const token = generateAdminToken(user);

    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    response.cookies.set({
      name: 'admin_token',
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      expires: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) // 7 days
    });

    return response;
  } catch (error) {
    console.error('[SIGNUP]', error);
    if ((error as any).code === 'P2002') {
      return new NextResponse("Email already exists", { status: 400 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
}
