import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function PATCH(
  req: Request,
  { params }: { params: { storeId: string, taxonId: string } }
) {
  try {
    const body = await req.json();
    const { name, description, position, parentId } = body;

    if (!params.taxonId) {
      return new NextResponse("Taxon id is required", { status: 400 });
    }

    // Verify the taxon exists and belongs to a taxonomy in this store
    const existingTaxon = await prismadb.taxon.findFirst({
      where: {
        id: params.taxonId,
        taxonomy: {
          storeId: params.storeId
        }
      }
    });

    if (!existingTaxon) {
      return new NextResponse("Taxon not found", { status: 404 });
    }

    const updatedTaxon = await prismadb.taxon.update({
      where: {
        id: params.taxonId
      },
      data: {
        name: name,
        description: description,
        position: position,
        parentId: parentId
      },
      include: {
        parent: true,
        children: {
          include: {
            children: true
          }
        }
      }
    });

    return NextResponse.json(updatedTaxon);
  } catch (error) {
    console.log('[TAXON_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { storeId: string, taxonId: string } }
) {
  try {
    if (!params.taxonId) {
      return new NextResponse("Taxon id is required", { status: 400 });
    }

    // Verify the taxon exists and belongs to a taxonomy in this store
    const existingTaxon = await prismadb.taxon.findFirst({
      where: {
        id: params.taxonId,
        taxonomy: {
          storeId: params.storeId
        }
      }
    });

    if (!existingTaxon) {
      return new NextResponse("Taxon not found", { status: 404 });
    }

    const deletedTaxon = await prismadb.taxon.delete({
      where: {
        id: params.taxonId
      }
    });

    return NextResponse.json(deletedTaxon);
  } catch (error) {
    console.log('[TAXON_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string, taxonId: string } }
) {
  try {
    if (!params.taxonId) {
      return new NextResponse("Taxon id is required", { status: 400 });
    }

    const taxon = await prismadb.taxon.findUnique({
      where: {
        id: params.taxonId
      },
      include: {
        parent: true,
        children: {
          include: {
            children: true
          }
        },
        taxonomy: true
      }
    });

    return NextResponse.json(taxon);
  } catch (error) {
    console.log('[TAXON_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
