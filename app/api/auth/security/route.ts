import { NextResponse } from "next/server";
import { getAdminSession, hashPassword, verifyPassword } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function PUT(req: Request) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized - Admin access required"
      }, { status: 403 });
    }

    const body = await req.json();
    const { currentPassword, newPassword } = body;

    if (!currentPassword || !newPassword) {
      return NextResponse.json({
        success: false,
        message: "Both current and new passwords are required"
      }, { status: 400 });
    }

    const user = await prismadb.user.findUnique({
      where: {
        id: session.userId
      }
    });

    if (!user) {
      return NextResponse.json({
        success: false,
        message: "User not found"
      }, { status: 404 });
    }

    const isValid = await verifyPassword(currentPassword, user.password);

    if (!isValid) {
      return NextResponse.json({
        success: false,
        message: "Current password is incorrect"
      }, { status: 400 });
    }

    const hashedPassword = await hashPassword(newPassword);

    await prismadb.user.update({
      where: {
        id: session.userId
      },
      data: {
        password: hashedPassword
      }
    });

    return NextResponse.json({
      success: true,
      message: "Password updated successfully"
    });
  } catch (error) {
    console.error('[SECURITY_PUT]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to update password"
    }, { status: 500 });
  }
}
