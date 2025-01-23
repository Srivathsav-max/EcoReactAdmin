import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
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

    const layout = await prismadb.homeLayout.create({
      data: {
        name,
        storeId: params.storeId,
      }
    });
  
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
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const layouts = await prismadb.homeLayout.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        components: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  
    return NextResponse.json(layouts);
  } catch (error) {
    console.log('[LAYOUTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}