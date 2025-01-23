import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { layoutId: string } }
) {
  try {
    if (!params.layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
    }

    const layout = await prismadb.$queryRaw<Array<any>>`
      SELECT l.*, 
             COALESCE(json_agg(c.* ORDER BY c.position) FILTER (WHERE c.id IS NOT NULL), '[]') as components
      FROM "HomeLayout" l
      LEFT JOIN "LayoutComponent" c ON c."layoutId" = l.id
      WHERE l.id = ${params.layoutId}
      GROUP BY l.id
    `;
  
    return NextResponse.json(layout[0]);
  } catch (error) {
    console.log('[LAYOUT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
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
    const { name, isActive } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
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

    // If setting this layout as active, deactivate all others first
    if (isActive) {
      await prismadb.$executeRaw`
        UPDATE "HomeLayout"
        SET "isActive" = false
        WHERE "storeId" = ${params.storeId}
          AND id != ${params.layoutId}
      `;
    }

    // Update the layout
    await prismadb.$executeRaw`
      UPDATE "HomeLayout"
      SET 
        name = ${name},
        "isActive" = ${isActive},
        "updatedAt" = NOW()
      WHERE id = ${params.layoutId}
    `;

    const updatedLayout = await prismadb.$queryRaw<Array<any>>`
      SELECT * FROM "HomeLayout"
      WHERE id = ${params.layoutId}
    `;
  
    return NextResponse.json(updatedLayout[0]);
  } catch (error) {
    console.log('[LAYOUT_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
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

    if (!params.layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
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

    // Delete the layout (components will be deleted due to CASCADE)
    await prismadb.$executeRaw`
      DELETE FROM "HomeLayout"
      WHERE id = ${params.layoutId}
    `;
  
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[LAYOUT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}