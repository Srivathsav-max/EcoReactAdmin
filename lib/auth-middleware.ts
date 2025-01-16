import { NextResponse } from "next/server";
import prismadb from "@/lib/prismadb";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET!;
const REFRESH_SECRET = process.env.REFRESH_SECRET!;

export const generateTokens = (customerId: string, storeId: string) => {
  const accessToken = jwt.sign(
    { customerId, storeId },
    JWT_SECRET,
    { expiresIn: '15m' }
  );

  const refreshToken = jwt.sign(
    { customerId, storeId },
    REFRESH_SECRET,
    { expiresIn: '7d' }
  );

  return { accessToken, refreshToken };
};

export async function authenticateCustomer(request: Request) {
  try {
    const authHeader = request.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return { error: "Unauthorized", status: 401 };
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, JWT_SECRET) as { 
      customerId: string;
      storeId: string;
      exp: number;
    };

    // Check token expiration
    if (Date.now() >= decoded.exp * 1000) {
      return { error: "Token expired", status: 401 };
    }
    
    const customer = await prismadb.customer.findFirst({
      where: { 
        id: decoded.customerId,
        storeId: decoded.storeId
      }
    });

    if (!customer) {
      return { error: "Unauthorized", status: 401 };
    }

    return { customer, storeId: decoded.storeId };
  } catch (error) {
    return { error: "Invalid token", status: 401 };
  }
}
