import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import { verifyAuth } from '@/lib/auth';
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { sizeId: string } }
) {
  try {
    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const size = await prismadb.size.findUnique({
      where: {
        id: params.sizeId
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { sizeId: string, storeId: string } }
) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 403 });
    
    const session = await verifyAuth(token);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 403 });

    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const size = await prismadb.size.delete({
      where: {
        id: params.sizeId
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};


export async function PATCH(
  req: Request,
  { params }: { params: { sizeId: string, storeId: string } }
) {
  try {
    const token = cookies().get('token')?.value;
    if (!token) return new NextResponse("Unauthorized", { status: 403 });
    
    const session = await verifyAuth(token);
    if (!session?.user) return new NextResponse("Unauthorized", { status: 403 });

    const body = await req.json();

    const { name, value } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!value) {
      return new NextResponse("Value is required", { status: 400 });
    }


    if (!params.sizeId) {
      return new NextResponse("Size id is required", { status: 400 });
    }

    const storeByUserId = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
        userId: session.user.id,
      }
    });

    if (!storeByUserId) {
      return new NextResponse("Unauthorized", { status: 405 });
    }

    const size = await prismadb.size.update({
      where: {
        id: params.sizeId
      },
      data: {
        name,
        value
      }
    });
  
    return NextResponse.json(size);
  } catch (error) {
    console.log('[SIZE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
