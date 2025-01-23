import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import { getAdminSession } from "@/lib/auth";

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

    const layout = await prismadb.homeLayout.findFirst({
      where: {
        id: params.layoutId,
        storeId: params.storeId,
      },
      include: {
        components: true
      }
    });
  
    return NextResponse.json(layout);
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
    const session = await getAdminSession();

    if (!session) {
      return new NextResponse("Unauthorized - Admin access required", { status: 403 });
    }

    const body = await req.json();
    
    const { name, isActive } = body;

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

    // If setting this layout as active, deactivate all other layouts
    if (isActive) {
      await prismadb.homeLayout.updateMany({
        where: {
          storeId: params.storeId,
          NOT: {
            id: params.layoutId
          }
        },
        data: {
          isActive: false
        }
      });
    }

    const layout = await prismadb.homeLayout.update({
      where: {
        id: params.layoutId
      },
      data: {
        name,
        isActive,
      }
    });
  
    return NextResponse.json(layout);
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

    const layout = await prismadb.homeLayout.delete({
      where: {
        id: params.layoutId
      }
    });
  
    return NextResponse.json(layout);
  } catch (error) {
    console.log('[LAYOUT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}