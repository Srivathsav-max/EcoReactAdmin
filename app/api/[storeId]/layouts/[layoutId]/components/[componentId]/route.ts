import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const session = await verifyAuth();
    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const body = await req.json();
    const { isVisible, config, type } = body;

    if (!params.componentId) {
      return new NextResponse("Component ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Update component using raw query
    await prismadb.$executeRaw`
      UPDATE "LayoutComponent"
      SET 
        "isVisible" = COALESCE(${isVisible}, "isVisible"),
        "config" = COALESCE(${config ? JSON.stringify(config) : null}, "config"),
        "type" = COALESCE(${type}, "type"),
        "updatedAt" = NOW()
      WHERE id = ${params.componentId}
    `;

    const updatedComponent = await prismadb.$queryRaw<Array<any>>`
      SELECT * FROM "LayoutComponent"
      WHERE id = ${params.componentId}
    `;
  
    return NextResponse.json(updatedComponent[0]);
  } catch (error) {
    console.log('[LAYOUT_COMPONENT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const session = await verifyAuth();
    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!params.componentId) {
      return new NextResponse("Component ID is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    // Delete component using raw query
    await prismadb.$executeRaw`
      DELETE FROM "LayoutComponent"
      WHERE id = ${params.componentId}
    `;
  
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[LAYOUT_COMPONENT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}