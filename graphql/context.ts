import { NextApiRequest, NextApiResponse } from 'next';
import { getAdminSession, getCustomerSession } from '@/lib/auth';
import prismadb from '@/lib/prismadb';

export interface GraphQLContext {
  req: NextApiRequest;
  res: NextApiResponse;
  prisma: typeof prismadb;
  adminSession: Awaited<ReturnType<typeof getAdminSession>>;
  customerSession: Awaited<ReturnType<typeof getCustomerSession>>;
}

export async function createContext({ req, res }: { 
  req: NextApiRequest;
  res: NextApiResponse;
}): Promise<GraphQLContext> {
  const adminSession = await getAdminSession();
  const customerSession = await getCustomerSession();

  return {
    req,
    res,
    prisma: prismadb,
    adminSession,
    customerSession,
  };
}

// Auth helper functions
export function requireAdmin(context: GraphQLContext) {
  if (!context.adminSession) {
    throw new Error('Unauthorized. Admin access required.');
  }
  return context.adminSession;
}

export function requireCustomer(context: GraphQLContext) {
  if (!context.customerSession) {
    throw new Error('Unauthorized. Customer access required.');
  }
  return context.customerSession;
}

export function requireStoreAccess(context: GraphQLContext, storeId: string) {
  const admin = context.adminSession;
  const customer = context.customerSession;

  // Allow admin access if it's their store
  if (admin) {
    return true;
  }

  // Allow customer access if it's their store
  if (customer && customer.storeId === storeId) {
    return true;
  }

  throw new Error('Unauthorized access to this store');
}