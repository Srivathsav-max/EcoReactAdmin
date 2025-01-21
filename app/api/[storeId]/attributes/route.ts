import { NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/session";
import prismadb from "@/lib/prismadb";
import { NextRequest } from "next/server";

export async function POST(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await getCurrentUser(req);
    const body = await req.json();
    
    const { name, code, type, isRequired, isVisible, position } = body;

    if (!user) {
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

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const attribute = await prismadb.attributes.create({
      data: {
        name,
        code,
        type,
        isRequired,
        isVisible,
        position,
        storeId: params.storeId,
      }
    });

    return NextResponse.json(attribute);
  } catch (error) {
    console.log('[ATTRIBUTES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: NextRequest,
  { params }: { params: { storeId: string } }
) {
  try {
    const user = await getCurrentUser(req);

    if (!user) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const attributes = await prismadb.attributes.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json(attributes);
  } catch (error) {
    console.log('[ATTRIBUTES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 