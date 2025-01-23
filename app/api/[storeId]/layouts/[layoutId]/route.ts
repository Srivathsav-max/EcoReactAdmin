import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const { storeId, layoutId } = await params;
    if (!storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    if (!layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
    }

    // Get layout with components
    const layout = await prismadb.homeLayout.findFirst({
      where: {
        id: layoutId,  // Fixed: params.layoutId -> layoutId
        storeId: storeId,  // Fixed: params.storeId -> storeId
      },
      include: {
        components: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    if (!layout) {
      return new NextResponse("Layout not found", { status: 404 });
    }

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
    const { storeId, layoutId } = await params;  // Added await params destructuring
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

    if (!layoutId) {  // Fixed: params.layoutId -> layoutId
      return new NextResponse("Layout id is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,  // Fixed: params.storeId -> storeId
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // If setting this layout as active, deactivate all others first
    if (isActive) {
      await prismadb.homeLayout.updateMany({
        where: {
          storeId: storeId,  // Fixed: params.storeId -> storeId
          id: {
            not: layoutId  // Fixed: params.layoutId -> layoutId
          }
        },
        data: {
          isActive: false
        }
      });
    }

    // Update the layout
    const updatedLayout = await prismadb.homeLayout.update({
      where: {
        id: layoutId  // Fixed: params.layoutId -> layoutId
      },
      data: {
        name,
        isActive,
      },
      include: {
        components: {
          orderBy: {
            position: 'asc'
          }
        }
      }
    });

    return NextResponse.json(updatedLayout);
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
    const { storeId, layoutId } = await params;  // Added await params destructuring
    const cookieStore = await cookies();
    const token = cookieStore.get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const session = await verifyAuth();
    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    if (!layoutId) {  // Fixed: params.layoutId -> layoutId
      return new NextResponse("Layout id is required", { status: 400 });
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: storeId,  // Fixed: params.storeId -> storeId
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Delete components first
    await prismadb.layoutComponent.deleteMany({
      where: {
        layoutId: layoutId,  // Fixed: params.layoutId -> layoutId
      }
    });

    // Delete the layout
    await prismadb.homeLayout.delete({
      where: {
        id: layoutId,  // Fixed: params.layoutId -> layoutId
      }
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[LAYOUT_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}