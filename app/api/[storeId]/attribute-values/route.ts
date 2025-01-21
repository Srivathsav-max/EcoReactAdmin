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
    
    const { value, attributeId, position } = body;

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }

    if (!attributeId) {
      return new NextResponse("Attribute ID is required", { status: 400 });
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

    const attributeValue = await prismadb.attributeValue.create({
      data: {
        value,
        position,
        attributeId,
        storeId: params.storeId,
      }
    });

    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log('[ATTRIBUTE_VALUES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const attributeValues = await prismadb.attributeValue.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        attribute: true
      },
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json(attributeValues);
  } catch (error) {
    console.log('[ATTRIBUTE_VALUES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 