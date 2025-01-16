import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function POST(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const body = await req.json();
    const { customerId, type, street, city, state, postalCode, country, isDefault } = body;

    if (!customerId || !street || !city || !state || !postalCode || !country) {
      return new NextResponse("Missing required fields", { status: 400 });
    }

    // If this is set as default, remove default from other addresses
    if (isDefault) {
      await prismadb.address.updateMany({
        where: {
          customerId: customerId,
          isDefault: true
        },
        data: {
          isDefault: false
        }
      });
    }

    const address = await prismadb.address.create({
      data: {
        customerId,
        type: type || 'home',
        street,
        city,
        state,
        postalCode,
        country,
        isDefault: isDefault || false
      }
    });

    return NextResponse.json(address);
  } catch (error) {
    console.log('[ADDRESS_POST]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
