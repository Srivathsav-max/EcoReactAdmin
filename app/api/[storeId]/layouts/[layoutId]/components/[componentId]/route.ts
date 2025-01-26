import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
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
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const component = await prismadb.layoutComponent.findFirst({
      where: {
        id: params.componentId,
        layoutId: params.layoutId,
        layout: {
          storeId: params.storeId
        }
      }
    });
  
    return NextResponse.json(component);
  } catch (error) {
    console.log('[LAYOUT_COMPONENT_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { type, position, config, isVisible } = body;

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
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const component = await prismadb.layoutComponent.update({
      where: {
        id: params.componentId
      },
      data: {
        type,
        position,
        config,
        isVisible
      }
    });
  
    return NextResponse.json(component);
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
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
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
      return new NextResponse("Unauthorized - Store access denied", { status: 403 });
    }

    const component = await prismadb.layoutComponent.delete({
      where: {
        id: params.componentId
      }
    });
  
    return NextResponse.json(component);
  } catch (error) {
    console.log('[LAYOUT_COMPONENT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}