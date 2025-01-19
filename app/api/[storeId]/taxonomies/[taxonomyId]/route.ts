import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { taxonomyId: string } }
) {
  try {
    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.findUnique({
      where: {
        id: params.taxonomyId
      },
      include: {
        rootTaxon: {
          include: {
            children: true
          }
        }
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string } }
) {
  try {
    const body = await req.json();
    const { name } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.update({
      where: {
        id: params.taxonomyId
      },
      data: {
        name
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string } }
) {
  try {
    if (!params.taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const taxonomy = await prismadb.taxonomy.delete({
      where: {
        id: params.taxonomyId
      }
    });

    return NextResponse.json(taxonomy);
  } catch (error) {
    console.log('[TAXONOMY_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
