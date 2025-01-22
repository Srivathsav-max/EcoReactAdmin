import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const store = await prismadb.store.findUnique({
      where: {
        id: params.storeId,
      },
      include: {
        billboards: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          }
        },
        products: {
          take: 8,
          where: {
            isVisible: true,
            status: 'active'
          },
          include: {
            images: {
              take: 1
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        taxonomies: {
          include: {
            taxons: {
              take: 6,
              where: {
                parentId: null
              }
            }
          },
          take: 1
        }
      }
    });

    return NextResponse.json(store);
  } catch (error) {
    console.log('[STORE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}