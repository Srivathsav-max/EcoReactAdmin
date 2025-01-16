import { NextResponse } from "next/server";
import { hash, compare } from "bcrypt";
import prismadb from "@/lib/prismadb";
import { cookies } from "next/headers";
import { verifyAuth } from "@/lib/auth";

export async function PATCH(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    const session = await verifyAuth(token || '');
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, email, newPassword } = body;

    const user = await prismadb.user.findUnique({
      where: { id: session.user.id }
    });

    if (!user) {
      return new NextResponse("User not found", { status: 404 });
    }

    // Verify current password
    const isValid = await compare(currentPassword, user.password);
    if (!isValid) {
      return new NextResponse("Invalid current password", { status: 400 });
    }

    const updates: any = {};
    
    if (email) {
      updates.email = email;
    }

    if (newPassword) {
      updates.password = await hash(newPassword, 10);
    }

    const updatedUser = await prismadb.user.update({
      where: { id: session.user.id },
      data: updates
    });

    return NextResponse.json(updatedUser);
  } catch (error) {
    console.error('[SECURITY_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
