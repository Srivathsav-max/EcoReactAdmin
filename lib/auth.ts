import { compare, hash } from 'bcryptjs';
import { verify } from 'jsonwebtoken';
import prismadb from '@/lib/prismadb';

export async function hashPassword(password: string) {
  return await hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await hashPassword(password);
  
  return await prismadb.user.create({
    data: {
      email,
      password: hashedPassword,
    },
  });
}

export async function getUserByEmail(email: string) {
  return await prismadb.user.findUnique({
    where: { email },
  });
}

export async function verifyAuth(token: string) {
  try {
    if (!token) {
      return null;
    }

    // Verify the token
    const decoded = verify(token, process.env.JWT_SECRET!);
    
    // Get user from database
    const user = await prismadb.user.findUnique({
      where: { id: decoded.sub as string },
    });

    if (!user) {
      return null;
    }

    return { user };
  } catch (error) {
    return null;
  }
}
