import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth, isAdmin } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function POST(
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
    const { type, config } = body;

    if (!type) {
      return new NextResponse("Type is required", { status: 400 });
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

    // Find the current highest position
    const existingComponents = await prismadb.$queryRaw<Array<{ position: number }>>`
      SELECT position FROM "LayoutComponent" 
      WHERE "layoutId" = ${params.layoutId} 
      ORDER BY position DESC 
      LIMIT 1
    `;

    const newPosition = existingComponents.length > 0 ? existingComponents[0].position + 1 : 0;

    // Initialize default config based on component type
    let defaultConfig = {};
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
    }

    // Merge provided config with default config
    const finalConfig = { ...defaultConfig, ...(config || {}) };

    // Create new component
    const component = await prismadb.$executeRaw`
      INSERT INTO "LayoutComponent" ("id", "layoutId", "type", "position", "config", "isVisible", "createdAt", "updatedAt")
      VALUES (
        ${crypto.randomUUID()},
        ${params.layoutId},
        ${type},
        ${newPosition},
        ${JSON.stringify(finalConfig)},
        true,
        NOW(),
        NOW()
      )
      RETURNING *
    `;

    return NextResponse.json({ success: true });
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
    if (!params.layoutId) {
      return new NextResponse("Layout id is required", { status: 400 });
    }

    // Get components with their data
    const components = await prismadb.$queryRaw<Array<any>>`
      WITH component_data AS (
        SELECT 
          lc.*,
          CASE 
            WHEN lc.type IN ('featured-products', 'products-grid', 'products-carousel') 
            THEN (
              SELECT json_agg(p.*)
              FROM "Product" p
              WHERE p.id = ANY(ARRAY(SELECT jsonb_array_elements_text(lc.config->'productIds')))
            )
            WHEN lc.type = 'categories' 
            THEN (
              SELECT json_agg(t.*)
              FROM "Taxon" t
              WHERE t.id = ANY(ARRAY(SELECT jsonb_array_elements_text(lc.config->'categoryIds')))
            )
            ELSE NULL
          END as related_data
        FROM "LayoutComponent" lc
        WHERE lc."layoutId" = ${params.layoutId}
      )
      SELECT 
        cd.*,
        CASE 
          WHEN cd.type IN ('featured-products', 'products-grid', 'products-carousel') 
          THEN jsonb_set(cd.config::jsonb, '{products}', COALESCE(cd.related_data::jsonb, '[]'::jsonb))
          WHEN cd.type = 'categories' 
          THEN jsonb_set(cd.config::jsonb, '{categories}', COALESCE(cd.related_data::jsonb, '[]'::jsonb))
          ELSE cd.config::jsonb
        END as config
      FROM component_data cd
      ORDER BY cd.position ASC
    `;

    return NextResponse.json(components);
  } catch (error) {
    console.log('[LAYOUT_COMPONENTS_GET]', error);
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
    const { components } = body;

    if (!components || !Array.isArray(components)) {
      return new NextResponse("Components array is required", { status: 400 });
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

    // Update all component positions using raw query
    await Promise.all(
      components.map(async (component: { id: string, position: number }) => {
        await prismadb.$executeRaw`
          UPDATE "LayoutComponent"
          SET position = ${component.position},
              "updatedAt" = NOW()
          WHERE id = ${component.id}
        `;
      })
    );
  
    return NextResponse.json({ success: true });
  } catch (error) {
    console.log('[LAYOUT_COMPONENTS_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}