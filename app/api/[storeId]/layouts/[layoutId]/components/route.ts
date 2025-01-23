import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const { storeId, layoutId } = params;
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
    const { type, position } = body;

    console.log('[POST] Creating component:', { type, position, layoutId, storeId });

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
    }

    if (typeof position !== 'number') {
      return new NextResponse("Position is required", { status: 400 });
    }

    if (!layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
    }

    // Verify layout belongs to store
    const layout = await prismadb.homeLayout.findFirst({
      where: {
        id: layoutId,
        storeId: storeId,
      }
    });

    console.log('[POST] Found layout:', layout);

    if (!layout) {
      return new NextResponse("Layout not found", { status: 404 });
    }

    // Create new component with default config based on type
    let defaultConfig = {};
    const uniqueId = crypto.randomUUID();
    console.log('[POST] Generated unique ID:', uniqueId);

    switch (type) {
      case 'billboard':
        defaultConfig = {
          label: '',
          imageUrl: '',
          callToAction: { text: '', link: '' }
        };
        break;
      case 'featured-products':
      case 'products-grid':
      case 'products-carousel':
        defaultConfig = {
          title: '',
          productIds: [],
          itemsPerRow: 4,
          maxItems: 8
        };
        break;
      case 'banner':
        defaultConfig = {
          title: '',
          subtitle: '',
          imageUrl: '',
          callToAction: { text: '', link: '' }
        };
        break;
      case 'categories':
        defaultConfig = {
          title: '',
          categoryIds: [],
          displayStyle: 'grid'
        };
        break;
      case 'sliding-banners':
        defaultConfig = {
          interval: 5000,
          banners: [{
            id: uniqueId,
            label: '',
            imageUrl: '',
            link: ''
          }]
        };
        break;
      default:
        defaultConfig = {};
    }

    console.log('[POST] Using default config:', defaultConfig);

    try {
      // Create component
      const component = await prismadb.layoutComponent.create({
        data: {
          type,
          position,
          config: defaultConfig,
          layoutId
        }
      });

      console.log('[POST] Created component:', component);

      // Update positions of other components
      await prismadb.$executeRaw`
        UPDATE "LayoutComponent"
        SET position = position + 1
        WHERE "layoutId" = ${layoutId}
          AND position >= ${position}
          AND id != ${component.id}
      `;

      return NextResponse.json(component);
    } catch (dbError) {
      console.error('[POST] Database error:', dbError);
      return new NextResponse(
        "Database error: " + (dbError instanceof Error ? dbError.message : "Unknown error"), 
        { status: 500 }
      );
    }
  } catch (error) {
    console.error('[POST] General error:', error);
    return new NextResponse(
      "Internal error: " + (error instanceof Error ? error.message : "Unknown error"), 
      { status: 500 }
    );
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const { storeId, layoutId } = params;
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
    const { components } = body;

    if (!Array.isArray(components)) {
      return new NextResponse("Invalid components array", { status: 400 });
    }

    // Verify layout belongs to store
    const layout = await prismadb.homeLayout.findFirst({
      where: {
        id: layoutId,
        storeId: storeId,
      }
    });

    if (!layout) {
      return new NextResponse("Layout not found", { status: 404 });
    }

    // Update all components in a transaction
    await prismadb.$transaction(
      components.map((component: { id: string; position: number }) =>
        prismadb.layoutComponent.update({
          where: {
            id: component.id,
            layoutId
          },
          data: { position: component.position }
        })
      )
    );

    const updatedComponents = await prismadb.layoutComponent.findMany({
      where: {
        layoutId
      },
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json(updatedComponents);
  } catch (error) {
    console.error('[PATCH] General error:', error);
    return new NextResponse(
      "Internal error: " + (error instanceof Error ? error.message : "Unknown error"),
      { status: 500 }
    );
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, layoutId: string } }
) {
  try {
    const { layoutId } = params;
    
    if (!layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
    }

    const components = await prismadb.layoutComponent.findMany({
      where: {
        layoutId
      },
      orderBy: {
        position: 'asc'
      }
    });

    return NextResponse.json(components);
  } catch (error) {
    console.error('[GET] General error:', error);
    return new NextResponse(
      "Internal error: " + (error instanceof Error ? error.message : "Unknown error"),
      { status: 500 }
    );
  }
}