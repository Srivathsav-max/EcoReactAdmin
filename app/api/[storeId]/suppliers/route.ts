import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    
    const { name, code, email, phone, address, website, description, isActive } = body;

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const supplier = await prismadb.supplier.create({
      data: {
        name,
        code,
        email,
        phone,
        address,
        website,
        description,
        isActive,
        storeId: params.storeId,
      }
    });

    return NextResponse.json(supplier);
  } catch (error) {
    console.log('[SUPPLIERS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const suppliers = await prismadb.supplier.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(suppliers);
  } catch (error) {
    console.log('[SUPPLIERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 