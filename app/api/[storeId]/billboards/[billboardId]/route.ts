import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from '@/lib/auth';

export async function GET(
  req: Request,
  { params }: { params: { billboardId: string } }
) {
  try {
    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const billboard = await prismadb.billboard.findUnique({
      where: {
        id: params.billboardId
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, billboardId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { label, imageUrl } = body;

    if (!label) {
      return new NextResponse("Label is required", { status: 400 });
    }

    if (!imageUrl) {
      return new NextResponse("Image URL is required", { status: 400 });
    }

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const billboard = await prismadb.billboard.updateMany({
      where: {
        id: params.billboardId
      },
      data: {
        label: label,
        imageUrl: imageUrl
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, billboardId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.billboardId) {
      return new NextResponse("Billboard id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const billboard = await prismadb.billboard.deleteMany({
      where: {
        id: params.billboardId
      }
    });
  
    return NextResponse.json(billboard);
  } catch (error) {
    console.log('[BILLBOARD_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
