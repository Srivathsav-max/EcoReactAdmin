import { NextResponse } from "next/server";
import { cookies } from 'next/headers';
import prismadb from "@/lib/prismadb";
import { verifyAuth } from "@/lib/auth";
import { z } from "zod";

const storeSchema = z.object({
  name: z.string().min(1),
  currency: z.string().min(1),
  locale: z.string().min(1),
});

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const session = await verifyAuth(token);
    if (!session?.user) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const body = await req.json();
    const { name, currency, locale } = storeSchema.parse(body);

    // First verify the store exists
    const existingStore = await prismadb.store.findFirst({
      where: {
        id: params.storeId,
      }
    });

    if (!existingStore) {
      return new NextResponse("Store not found", { status: 404 });
    }

    // Then update with type safety
    const store = await prismadb.store.update({
      where: {
        id: params.storeId,
      },
      data: {
        name: name || undefined,
        currency: currency || undefined,
        locale: locale || undefined,
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    if (error instanceof Error) {
      console.log('[STORE_PATCH]', error.message);
      return new NextResponse(error.message, { status: 500 });
    }
    return new NextResponse("Internal error", { status: 500 });
  }
};

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('token')?.value;

    if (!token) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    const session = await verifyAuth(token);
    if (!session?.user) {
      return new NextResponse("Unauthenticated", { status: 403 });
    }

    if (!params.storeId) {
      return new NextResponse("Store id is required", { status: 400 });
    }

    const store = await prismadb.store.deleteMany({
      where: {
        id: params.storeId,
        userId: session.user.id
      }
    });
  
    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
};
