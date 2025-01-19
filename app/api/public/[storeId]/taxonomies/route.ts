import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const taxonomies = await prismadb.taxonomy.findMany({
      where: {
        storeId: params.storeId,
      },
      include: {
        rootTaxon: {
          include: {
            children: {
              include: {
                children: true,
                products: {
                  include: {
                    images: true,
                    taxons: true,
                  }
                }
              }
            }
          }
        }
      }
    });

    return NextResponse.json(taxonomies);
  } catch (error) {
    console.log('[PUBLIC_TAXONOMIES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
