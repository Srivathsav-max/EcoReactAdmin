import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string; attributeId: string } } 
) {
  try {
    if (!params.attributeId) {
      return new NextResponse("Attribute id is required", { status: 400 });
    }

    const attribute = await prismadb.attribute.findUnique({
      where: {
        id: params.attributeId
      }
    });
  
    return NextResponse.json(attribute);
  } catch (error) {
    console.log('[ATTRIBUTE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, attributeId: string } }
) {
  try {
    const user = await getCurrentUser();
    const body = await req.json();
    
    const { name, code, type, isRequired, isVisible, position } = body;

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!code) {
      return new NextResponse("Code is required", { status: 400 });
    }

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
    }

    if (!params.attributeId) {
      return new NextResponse("Attribute id is required", { status: 400 });
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

    const attribute = await prismadb.attribute.update({
      where: {
        id: params.attributeId
      },
      data: {
        name,
        code,
        type,
        isRequired,
        isVisible,
        position
      }
    });
  
    return NextResponse.json(attribute);
  } catch (error) {
    console.log('[ATTRIBUTE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, attributeId: string } }
) {
  try {
    const user = await getCurrentUser();

    if (!user?.id) {
      return new NextResponse("Unauthenticated", { status: 401 });
    }

    if (!params.attributeId) {
      return new NextResponse("Attribute id is required", { status: 400 });
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

    const attribute = await prismadb.attribute.delete({
      where: {
        id: params.attributeId
      }
    });
  
    return NextResponse.json(attribute);
  } catch (error) {
    console.log('[ATTRIBUTE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 