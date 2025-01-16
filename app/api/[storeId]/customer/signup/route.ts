import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import bcrypt from "bcrypt";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { name, email, password, phone, address } = body;

    if (!name || !email || !password) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    const exists = await prismadb.customer.findFirst({
      where: {
        email: email,
        storeId: params.storeId
      }
    });

    if (exists) {
      return new NextResponse("Email already exists", { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const customer = await prismadb.customer.create({
      data: {
        name,
        email,
        password: hashedPassword,
        phone,
        storeId: params.storeId
      }
    });

    return NextResponse.json({ 
      id: customer.id,
      name: customer.name,
      email: customer.email
    });
  } catch (error) {
    console.log('[CUSTOMER_SIGNUP]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
