import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string, taxonId: string } }
) {
  try {
    const body = await req.json();
    const { name, description } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!params.taxonId) {
      return new NextResponse("Taxon ID is required", { status: 400 });
    }

    const taxon = await prismadb.taxon.update({
      where: {
        id: params.taxonId
      },
      data: {
        name,
        description,
        permalink: `${name.toLowerCase().replace(/\s+/g, '-')}`
      }
    });

    return NextResponse.json(taxon);
  } catch (error) {
    console.log('[TAXON_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string, taxonId: string } }
) {
  try {
    if (!params.taxonId) {
      return new NextResponse("Taxon ID is required", { status: 400 });
    }

    const taxon = await prismadb.taxon.delete({
      where: {
        id: params.taxonId
      }
    });

    return NextResponse.json(taxon);
  } catch (error) {
    console.log('[TAXON_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
