import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const cookieStore = cookies();
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

    console.log('Received update request:', { type, isVisible, componentId: params.componentId });

    if (!params.componentId) {
      return new NextResponse("Component ID is required", { status: 400 });
    }

    // Validate config based on component type
    if (type === 'sliding-banners') {
      console.log('Validating sliding banners config:', config);

      if (!config.banners || !Array.isArray(config.banners)) {
        return new NextResponse("Invalid sliding banners configuration: banners array is required", { status: 400 });
      }

      if (config.banners.length === 0) {
        return new NextResponse("At least one banner is required", { status: 400 });
      }

      for (const banner of config.banners) {
        if (!banner.id || !banner.label || !banner.imageUrl) {
          return new NextResponse("Each banner must have an id, label, and imageUrl", { status: 400 });
        }
      }

      if (typeof config.interval !== 'number' || config.interval < 1000) {
        return new NextResponse("Invalid sliding banners configuration: interval must be a number >= 1000", { status: 400 });
      }
    }

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Verify component exists and belongs to layout
    const existingComponent = await prismadb.layoutComponent.findFirst({
      where: {
        id: params.componentId,
        layoutId: params.layoutId
      }
    });

    if (!existingComponent) {
      return new NextResponse("Component not found", { status: 404 });
    }

    console.log('Updating component with config:', {
      type,
      isVisible,
      configSummary: JSON.stringify(config).substring(0, 100) + '...'
    });

    // Update component using Prisma client for better type safety
    const updatedComponent = await prismadb.layoutComponent.update({
      where: {
        id: params.componentId,
      },
      data: {
        isVisible: isVisible ?? undefined,
        config: config ? config : undefined,
        type: type ?? undefined,
      }
    });

    console.log('Component updated successfully:', updatedComponent.id);

    return NextResponse.json(updatedComponent);
  } catch (error) {
    console.error('[LAYOUT_COMPONENT_PATCH] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to update component";
    
    if (errorMessage.includes('not found')) {
      return new NextResponse("Component not found", { status: 404 });
    }
    
    if (errorMessage.includes('validation')) {
      return new NextResponse(errorMessage, { status: 400 });
    }
    
    return new NextResponse(`Error updating component: ${errorMessage}`, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string, componentId: string } }
) {
  try {
    const cookieStore = cookies();
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

    // Verify store ownership
    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.userId,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    // Verify component exists and belongs to layout
    const existingComponent = await prismadb.layoutComponent.findFirst({
      where: {
        id: params.componentId,
        layoutId: params.layoutId
      }
    });

    if (!existingComponent) {
      return new NextResponse("Component not found", { status: 404 });
    }

    console.log('Deleting component:', params.componentId);

    // Delete component using Prisma client
    await prismadb.layoutComponent.delete({
      where: {
        id: params.componentId
      }
    });

    console.log('Component deleted successfully');
  
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[LAYOUT_COMPONENT_DELETE] Error:', error);
    
    const errorMessage = error instanceof Error 
      ? error.message 
      : "Failed to delete component";
    
    if (errorMessage.includes('not found')) {
      return new NextResponse("Component not found", { status: 404 });
    }
    
    return new NextResponse(`Error deleting component: ${errorMessage}`, { status: 500 });
  }
}