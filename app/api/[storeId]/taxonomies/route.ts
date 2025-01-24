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

    // Get all taxonomies with their taxons
    const rawTaxonomies = await prismadb.taxonomy.findMany({
      where: {
        storeId: params.storeId
      },
      include: {
        taxons: {
          include: {
            billboard: true,
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Helper function to build taxon hierarchy
    const buildTaxonHierarchy = (taxons: any[], parentId: string | null = null): any[] => {
      return taxons
        .filter(taxon => taxon.parentId === parentId)
        .map(taxon => ({
          ...taxon,
          children: buildTaxonHierarchy(taxons, taxon.id)
        }))
        .sort((a, b) => a.position - b.position);
    };

    // Helper function to get full path
    const getFullPath = (taxon: any, taxonomy: any, allTaxons: any[]): string => {
      const parts = [taxon.name];
      let current = taxon;
      
      while (current.parentId) {
        const parent = allTaxons.find(t => t.id === current.parentId);
        if (!parent) break;
        parts.unshift(parent.name);
        current = parent;
      }
      
      return `${taxonomy.name} > ${parts.join(' > ')}`;
    };

    // Process taxonomies
    const processedTaxonomies = rawTaxonomies.map(taxonomy => {
      const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);
      
      // Add full paths and levels to each taxon
      const processNode = (node: any, level: number = 0): any => {
        return {
          ...node,
          level,
          fullPath: getFullPath(node, taxonomy, taxonomy.taxons),
          children: node.children.map((child: any) => processNode(child, level + 1))
        };
      };

      const processedTaxons = hierarchicalTaxons.map(taxon => processNode(taxon));

      return {
        id: taxonomy.id,
        name: taxonomy.name,
        description: taxonomy.description,
        storeId: taxonomy.storeId,
        createdAt: taxonomy.createdAt,
        updatedAt: taxonomy.updatedAt,
        _count: {
          taxons: taxonomy.taxons.length
        },
        taxons: processedTaxons
      };
    });

    return NextResponse.json({
      success: true,
      data: processedTaxonomies
    });
  } catch (error) {
    console.log('[TAXONOMIES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
