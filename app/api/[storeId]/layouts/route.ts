import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
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
    const { name, isActive = false } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
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

    // If this layout is being set as active, deactivate all other layouts first
    if (isActive) {
      await prismadb.$executeRaw`
        UPDATE "HomeLayout"
        SET "isActive" = false
        WHERE "storeId" = ${params.storeId}
      `;
    }

    // Create the new layout
    const layout = await prismadb.$executeRaw`
      INSERT INTO "HomeLayout" ("id", "storeId", "name", "isActive", "createdAt", "updatedAt")
      VALUES (
        ${crypto.randomUUID()},
        ${params.storeId},
        ${name},
        ${isActive},
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json(layout);
  } catch (error) {
    console.log('[LAYOUTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const layouts = await prismadb.$queryRaw<Array<any>>`
      SELECT * FROM "HomeLayout"
      WHERE "storeId" = ${params.storeId}
      ORDER BY "createdAt" DESC
    `;

    return NextResponse.json(layouts);
  } catch (error) {
    console.log('[LAYOUTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}