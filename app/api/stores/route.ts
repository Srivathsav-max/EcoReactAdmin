import { NextResponse } from 'next/server';
import { getSession, isAdmin } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const session = await getSession();

    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const body = await req.json();
    const { name } = body;
    
    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    // Generate a default domain based on store name
    const defaultDomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

    const store = await prismadb.store.create({
      data: {
        name,
        userId: session.userId,
        domain: `${defaultDomain}-${Date.now()}`,  // Ensure uniqueness
        themeSettings: {
          primaryColor: '#000000',
          secondaryColor: '#ffffff',
          fontFamily: 'Inter'
        }
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
) {
  try {
    const session = await getSession();

    if (!session || !isAdmin(session)) {
      return new NextResponse("Unauthorized", { status: 401 });
    }

    const stores = await prismadb.store.findMany({
      where: {
        userId: session.userId
      }
    });
  
    return NextResponse.json(stores);
  } catch (error) {
    console.log('[STORES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
