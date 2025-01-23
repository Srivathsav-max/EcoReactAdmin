import { NextResponse } from 'next/server';
import { getAdminSession } from "@/lib/auth";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const body = await req.json();
    const { name } = body;
    
    if (!name) {
      return NextResponse.json({
        success: false,
        message: "Store name is required"
      }, { status: 400 });
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
  
    return NextResponse.json({
      success: true,
      data: store
    });
  } catch (error) {
    console.error('[STORES_POST]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to create store"
    }, { status: 500 });
  }
}

export async function GET(
  req: Request,
) {
  try {
    const session = await getAdminSession();

    if (!session) {
      return NextResponse.json({
        success: false,
        message: "Unauthorized access. Admin authentication required."
      }, { status: 401 });
    }

    const stores = await prismadb.store.findMany({
      where: {
        userId: session.userId
      }
    });
  
    return NextResponse.json({
      success: true,
      data: stores
    });
  } catch (error) {
    console.error('[STORES_GET]', error);
    return NextResponse.json({
      success: false,
      message: "Failed to fetch stores"
    }, { status: 500 });
  }
}
