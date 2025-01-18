import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { verify } from 'jsonwebtoken';
import prismadb from '@/lib/prismadb';

export async function GET() {
  try {
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { sub: string };
    const userId = decoded.sub;

    const stores = await prismadb.store.findMany({
      where: {
        userId,
      }
    });
  
    return NextResponse.json(stores);
  } catch (error) {
    console.log('[STORES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const token = cookies().get('token')?.value;
    
    if (!token) {
      return new NextResponse("Unauthorized", { status: 403 });
    }

    const decoded = verify(token, process.env.JWT_SECRET!) as { sub: string };
    const userId = decoded.sub;

    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const store = await prismadb.store.create({
      data: {
        name,
        userId,
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
