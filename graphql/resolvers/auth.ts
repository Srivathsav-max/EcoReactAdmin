import { GraphQLContext } from '../context';
import {
  generateAdminToken,
  generateCustomerToken,
  verifyPassword,
  getAuthCookie
} from '@/lib/auth';

export const authResolvers = {
  Query: {
    adminSession: async (
      _parent: unknown,
      _args: {},
      context: GraphQLContext
    ) => {
      return context.adminSession;
    },

    customerSession: async (
      _parent: unknown,
      _args: {},
      context: GraphQLContext
    ) => {
      return context.customerSession;
    },
  },

  Mutation: {
    adminSignIn: async (
      _parent: unknown,
      args: { email: string; password: string },
      context: GraphQLContext
    ) => {
      const { email, password } = args;

      const user = await context.prisma.user.findUnique({
        where: { email }
      });

      if (!user) {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(password, user.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = generateAdminToken(user);
      const cookieOptions = getAuthCookie(token, 'admin');
      
      // Set cookie in response
      context.res.setHeader('Set-Cookie', [
        `${cookieOptions.name}=${cookieOptions.value}; HttpOnly; Path=/; ${
          cookieOptions.secure ? 'Secure; ' : ''
        }SameSite=Lax; Expires=${cookieOptions.expires?.toUTCString()}`
      ]);

      return {
        userId: user.id,
        email: user.email,
        role: 'admin'
      };
    },

    adminSignOut: async (
      _parent: unknown,
      _args: {},
      context: GraphQLContext
    ) => {
      // Clear cookie in response
      context.res.setHeader('Set-Cookie', [
        'admin_token=; HttpOnly; Path=/; Max-Age=0'
      ]);
      return true;
    },

    customerSignIn: async (
      _parent: unknown,
      args: { email: string; password: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { email, password, storeId } = args;

      const customer = await context.prisma.customer.findFirst({
        where: {
          email,
          storeId
        }
      });

      if (!customer) {
        throw new Error('Invalid credentials');
      }

      const isValid = await verifyPassword(password, customer.password);
      if (!isValid) {
        throw new Error('Invalid credentials');
      }

      const token = generateCustomerToken({
        id: customer.id,
        email: customer.email,
        storeId
      });

      const cookieOptions = getAuthCookie(token, 'customer');
      
      // Set cookie in response
      context.res.setHeader('Set-Cookie', [
        `${cookieOptions.name}=${cookieOptions.value}; HttpOnly; Path=/; ${
          cookieOptions.secure ? 'Secure; ' : ''
        }SameSite=Lax; Expires=${cookieOptions.expires?.toUTCString()}`
      ]);

      return {
        customerId: customer.id,
        email: customer.email,
        storeId,
        role: 'customer'
      };
    },

    customerSignOut: async (
      _parent: unknown,
      _args: {},
      context: GraphQLContext
    ) => {
      // Clear cookie in response
      context.res.setHeader('Set-Cookie', [
        'customer_token=; HttpOnly; Path=/; Max-Age=0'
      ]);
      return true;
    },
  },
};