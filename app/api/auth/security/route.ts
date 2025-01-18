import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { cookies } from "next/headers";
import { verifyAuth, hashPassword, verifyPassword } from "@/lib/auth";

async function handleEmailUpdate(userId: string, currentPassword: string, newEmail: string) {
  const user = await prismadb.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid current password");
  }

  // Check if new email is already in use
  if (newEmail !== user.email) {
    const existingUser = await prismadb.user.findUnique({
      where: { email: newEmail }
    });
    
    if (existingUser) {
      throw new Error("Email already in use");
    }

    // Update email
    const updatedUser = await prismadb.user.update({
      where: { id: userId },
      data: { email: newEmail }
    });

    return updatedUser;
  }

  throw new Error("New email must be different from current email");
}

async function handlePasswordUpdate(userId: string, currentPassword: string, newPassword: string) {
  const user = await prismadb.user.findUnique({
    where: { id: userId }
  });

  if (!user) {
    throw new Error("User not found");
  }

  const isValid = await verifyPassword(currentPassword, user.password);
  if (!isValid) {
    throw new Error("Invalid current password");
  }

  const hashedPassword = await hashPassword(newPassword);
  const updatedUser = await prismadb.user.update({
    where: { id: userId },
    data: { password: hashedPassword }
  });

  return updatedUser;
}

export async function PATCH(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    const session = await verifyAuth(token || '');
    
    if (!session?.user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { currentPassword, email, newPassword } = body;

    if (!currentPassword) {
      return new NextResponse("Current password is required", { status: 400 });
    }

    // Handle email update
    if (email && !newPassword) {
      try {
        const updatedUser = await handleEmailUpdate(session.user.id, currentPassword, email);
        return NextResponse.json({
          message: "Email updated successfully",
          email: updatedUser.email
        });
      } catch (error: any) {
        return new NextResponse(error.message, { status: 400 });
      }
    }

    // Handle password update
    if (newPassword && !email) {
      try {
        await handlePasswordUpdate(session.user.id, currentPassword, newPassword);
        return NextResponse.json({
          message: "Password updated successfully"
        });
      } catch (error: any) {
        return new NextResponse(error.message, { status: 400 });
      }
    }

    return new NextResponse(
      "Invalid request. Please update either email or password, not both.", 
      { status: 400 }
    );

  } catch (error) {
    console.error('[SECURITY_PATCH]', error);
    return new NextResponse(
      "Internal server error", 
      { status: 500 }
    );
  }
}
