
import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string, taxonomyId: string } }
) {
  try {
    const body = await req.json();
    const { name, description, parentId } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    const taxon = await prismadb.taxon.create({
      data: {
        name,
        description,
        permalink: `${name.toLowerCase().replace(/\s+/g, '-')}`,
        parentId: parentId || null,
        taxonomy: {
          connect: {
            id: params.taxonomyId
          }
        }
      }
    });

    return NextResponse.json(taxon);
  } catch (error) {
    console.log('[TAXON_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}