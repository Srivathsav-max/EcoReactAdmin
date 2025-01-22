import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import prismadb from "./prismadb";

export interface AdminSession {
  userId: string;
  email: string;
  role: 'admin';
}

export interface CustomerSession {
  customerId: string;
  email: string;
  storeId: string;
  role: 'customer';
}

type Session = AdminSession | CustomerSession;

// Main session getter
export async function getSession(): Promise<Session | null> {
  try {
    const token = cookies().get('token')?.value;

    if (!token) {
      return null;
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as Session;
    return decoded;
  } catch (error) {
    console.error('[AUTH_ERROR]', error);
    return null;
  }
}

// Auth verification
export async function verifyAuth(): Promise<Session | null> {
  return getSession();
}

// User management
export async function getUserByEmail(email: string) {
  return prismadb.user.findUnique({
    where: { email }
  });
}

export async function createUser(email: string, password: string) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prismadb.user.create({
    data: {
      email,
      password: hashedPassword
    }
  });
}

// Customer management
export async function getCustomerByEmail(email: string, storeId: string) {
  return prismadb.customer.findFirst({
    where: {
      email,
      storeId
    }
  });
}

export async function createCustomer(
  email: string,
  password: string,
  storeId: string,
  name: string
) {
  const hashedPassword = await bcrypt.hash(password, 10);
  
  return prismadb.customer.create({
    data: {
      email,
      password: hashedPassword,
      storeId,
      name
    }
  });
}

// Password utilities
export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// Token generation
export function generateAdminToken(user: { id: string; email: string }) {
  return jwt.sign(
    { userId: user.id, email: user.email, role: 'admin' },
    process.env.JWT_SECRET!,
    { expiresIn: '7d' }
  );
}

export function generateCustomerToken(customer: { id: string; email: string; storeId: string }) {
  return jwt.sign(
    { 
      customerId: customer.id, 
      email: customer.email, 
      storeId: customer.storeId,
      role: 'customer'
    },
    process.env.JWT_SECRET!,
    { expiresIn: '30d' }
  );
}

// Type guards
export function isAdmin(session: Session | null): session is AdminSession {
  return session?.role === 'admin';
}

export function isCustomer(session: Session | null): session is CustomerSession {
  return session?.role === 'customer';
}
