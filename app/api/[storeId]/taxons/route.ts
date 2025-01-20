import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { name, description, taxonomyId, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!taxonomyId) {
      return new NextResponse("Taxonomy ID is required", { status: 400 });
    }

    const existingTaxon = await prismadb.taxon.findFirst({
      where: {
        name,
        taxonomyId
      }
    });

    if (existingTaxon) {
      return new NextResponse("A taxon with this name already exists in this taxonomy", { status: 400 });
    }

    const permalink = `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`;

    const createData: any = {
      name,
      description: description || "",
      permalink,
      taxonomy: {
        connect: {
          id: taxonomyId
        }
      }
    };

    // Only add parent relation if parentId is provided
    if (parentId) {
      createData.parent = {
        connect: {
          id: parentId
        }
      };
    }

    const taxon = await prismadb.taxon.create({
      data: createData,
      include: {
        parent: true,
        children: true,
        taxonomy: true
      }
    });

    return NextResponse.json(taxon);
  } catch (error) {
    console.log('[TAXONS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const taxons = await prismadb.taxon.findMany({
      where: {
        taxonomy: {
          storeId: params.storeId
        }
      },
      include: {
        parent: true,
        children: true,
        taxonomy: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(taxons);
  } catch (error) {
    console.log('[TAXONS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
