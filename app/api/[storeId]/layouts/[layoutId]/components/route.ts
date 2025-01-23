import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { type, position = 0, config = {}, isVisible = true } = body;

    if (!type) {
      return new NextResponse("Component type is required", { status: 400 });
    }

    if (!params.layoutId) {
      return new NextResponse("Layout ID is required", { status: 400 });
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

    const layout = await prismadb.homeLayout.findFirst({
      where: {
        id: params.layoutId,
        storeId: params.storeId,
      }
    });

    if (!layout) {
      return new NextResponse("Layout not found", { status: 404 });
    }

    const component = await prismadb.layoutComponent.create({
      data: {
        type,
        position,
        config,
        isVisible,
        layoutId: params.layoutId,
      }
    });
  
    return NextResponse.json(component);
  } catch (error) {
    console.log('[LAYOUT_COMPONENTS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    if (!params.layoutId) {
      return new NextResponse("Layout ID is required", { status: 400 });
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

    const components = await prismadb.layoutComponent.findMany({
      where: {
        layoutId: params.layoutId,
        layout: {
          storeId: params.storeId
        }
      },
      orderBy: {
        position: 'asc'
      }
    });
  
    return NextResponse.json(components);
  } catch (error) {
    console.log('[LAYOUT_COMPONENTS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}