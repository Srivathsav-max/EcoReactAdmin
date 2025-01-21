import { NextRequest } from "next/server";
import jwt from 'jsonwebtoken';

interface JWTPayload {
  id: string;
  email: string;
  // add other fields that are in your JWT token
}

export async function getSession(req: NextRequest) {
  const token = req.headers.get('authorization')?.replace('Bearer ', '');
  
  if (!token) {
    return null;
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

export async function getCurrentUser(req: NextRequest) {
  try {
    const session = await getSession(req);
    return session;
  } catch (error) {
    return null;
  }
} 