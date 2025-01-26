import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { valueId: string } }
) {
  try {
    if (!params.valueId) {
      return new NextResponse("Value id is required", { status: 400 });
    }

    const attributeValue = await prismadb.attributeValue.findUnique({
      where: {
        id: params.valueId
      }
    });
  
    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log('[ATTRIBUTE_VALUE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, valueId: string } }
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

    if (!params.valueId) {
      return new NextResponse("Value id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const attributeValue = await prismadb.attributeValue.update({
      where: {
        id: params.valueId
      },
      data: {
        value,
        attributeId,
        position
      }
    });
  
    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log('[ATTRIBUTE_VALUE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, valueId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.valueId) {
      return new NextResponse("Value id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const attributeValue = await prismadb.attributeValue.delete({
      where: {
        id: params.valueId
      }
    });
  
    return NextResponse.json(attributeValue);
  } catch (error) {
    console.log('[ATTRIBUTE_VALUE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 