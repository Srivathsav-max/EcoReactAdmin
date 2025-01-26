import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { optionValueId: string, storeId: string } }
) {
  try {
    if (!params.optionValueId) {
      return new NextResponse("Option value id is required", { status: 400 });
    }

    const optionValue = await prismadb.optionValue.findUnique({
      where: {
        id: params.optionValueId,
      },
      include: {
        optionType: {
          include: {
            product: true,
          }
        },
      }
    });

    return NextResponse.json(optionValue);
  } catch (error) {
    console.log('[OPTION_VALUE_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function PATCH(
  req: Request,
  { params }: { params: { optionValueId: string, storeId: string } }
) {
  try {
    const body = await req.json();
    const { 
      name,
      presentation,
      position,
      optionTypeId,
    } = body;

    if (!params.optionValueId) {
      return new NextResponse("Option value id is required", { status: 400 });
    }

    // Verify the option type belongs to the store
    if (optionTypeId) {
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
    }

    const optionValue = await prismadb.optionValue.update({
      where: {
        id: params.optionValueId,
      },
      data: {
        name,
        presentation,
        position,
        optionTypeId,
      }
    });

    return NextResponse.json(optionValue);
  } catch (error) {
    console.log('[OPTION_VALUE_PATCH]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { optionValueId: string, storeId: string } }
) {
  try {
    if (!params.optionValueId) {
      return new NextResponse("Option value id is required", { status: 400 });
    }

    const optionValue = await prismadb.optionValue.delete({
      where: {
        id: params.optionValueId,
      }
    });

    return NextResponse.json(optionValue);
  } catch (error) {
    console.log('[OPTION_VALUE_DELETE]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
} 