import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.create({
      data: {
        name,
        description,
        storeId: params.storeId,
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMIES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    if (!params.storeId) {
      return new NextResponse("Store ID is required", { status: 400 });
    }

    const taxonomies = await prismadb.taxonomy.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        taxons: {
          where: {
            parentId: null
          },
          include: {
            children: true
          }
        },
        _count: {
          select: {
            taxons: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(taxonomies);
  } catch (error) {
    console.log('[TAXONOMIES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
