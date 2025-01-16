
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { email, newPassword } = body;

    if (!email || !newPassword) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);

    const customer = await prismadb.customer.update({
      where: {
        email_storeId: {
          email,
          storeId: params.storeId
        }
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
    console.log('[CUSTOMER_RESET_PASSWORD]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}