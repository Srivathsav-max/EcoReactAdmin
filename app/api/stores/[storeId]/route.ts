import { NextResponse } from "next/server";
import { getSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getSession();

    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    
    const { 
      name,
      domain,
      customCss,
      logoUrl,
      faviconUrl,
      themeSettings 
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.updateMany({
      where: {
        id: params.storeId,
        userId: session.userId
      },
      data: {
        name,
        domain,
        customCss,
        logoUrl,
        faviconUrl,
        themeSettings
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const session = await getSession();

    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId: session.userId
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
