import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { 
      name,
      presentation,
      position,
      optionTypeId,
    } = body;

    if (!name) {
      return new NextResponse("Name is required", { status: 400 });
    }

    if (!optionTypeId) {
      return new NextResponse("Option Type ID is required", { status: 400 });
    }

    // Verify the option type belongs to the store
    const optionType = await prismadb.productOptionType.findFirst({
      where: {
        id: optionTypeId,
        product: {
          storeId: params.storeId,
        }
      }
    });

    if (!optionType) {
      return new NextResponse("Option Type not found", { status: 404 });
    }

    const optionValue = await prismadb.optionValue.create({
      data: {
        name,
        presentation,
        position: position || 0,
        optionTypeId,
      }
    });
  
    return NextResponse.json(optionValue);
  } catch (error) {
    console.log('[OPTION_VALUES_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const { searchParams } = new URL(req.url);
    const optionTypeId = searchParams.get('optionTypeId');

    const optionValues = await prismadb.optionValue.findMany({
      where: {
        optionType: {
          product: {
            storeId: params.storeId,
          }
        },
        ...(optionTypeId && { optionTypeId }),
      },
      include: {
        optionType: {
          include: {
            product: true,
          }
        },
      },
      orderBy: {
        position: 'asc',
      }
    });
  
    return NextResponse.json(optionValues);
  } catch (error) {
    console.log('[OPTION_VALUES_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 