import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";

export async function GET(
  req: Request,
  { params }: { params: { storeId: string } }
) {
  try {
    const customers = await prismadb.customer.findMany({
      where: {
        storeId: params.storeId
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(customers);
  } catch (error) {
    console.log('[CUSTOMERS_GET]', error);
    return new NextResponse("Internal error", { status: 500 });
  }
}
