import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const storeResolvers = {
  Query: {
    stores: async (
      _parent: unknown,
      _args: unknown,
      context: GraphQLContext
    ) => {
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const stores = await context.prisma.store.findMany({
        where: {
          userId: session.userId
        }
      });

      return stores;
    },

    store: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { id } = args;
      
      const store = await context.prisma.store.findUnique({
        where: {
          id
        },
        select: {
          id: true,
          name: true,
          userId: true,
          currency: true,
          locale: true,
          domain: true,
          themeSettings: true,
          customCss: true,
          logoUrl: true,
          faviconUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!store) {
        throw new Error('Store not found');
      }

      return store;
    },

    storeByDomain: async (
      _parent: unknown,
      args: { domain: string },
      context: GraphQLContext
    ) => {
      const { domain } = args;
      
      const store = await context.prisma.store.findUnique({
        where: {
          domain
        },
        select: {
          id: true,
          name: true,
          userId: true,
          currency: true,
          locale: true,
          domain: true,
          themeSettings: true,
          customCss: true,
          logoUrl: true,
          faviconUrl: true,
          createdAt: true,
          updatedAt: true
        }
      });

      if (!store) {
        throw new Error('Store not found');
      }

      return store;
    },
  },

  Mutation: {
    createStore: async (
      _parent: unknown,
      args: { 
        input: { 
          name: string;
          currency?: string;
          locale?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { input } = args;
      const { name, currency = 'USD', locale = 'en-US' } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      if (!name) {
        throw new Error('Store name is required');
      }

      // Generate a default domain based on store name
      const defaultDomain = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const store = await context.prisma.store.create({
        data: {
          name,
          userId: session.userId,
          currency,
          locale,
          domain: `${defaultDomain}-${Date.now()}`, // Ensure uniqueness
          themeSettings: {
            primaryColor: '#000000',
            secondaryColor: '#ffffff',
            fontFamily: 'Inter'
          }
        }
      });

      return store;
    },

    updateStore: async (
      _parent: unknown,
      args: { 
        id: string;
        input: { 
          name?: string;
          currency?: string;
          locale?: string;
          domain?: string;
          themeSettings?: any;
          customCss?: string;
          logoUrl?: string;
          faviconUrl?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, input } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      const store = await context.prisma.store.update({
        where: {
          id
        },
        data: input
      });

      return store;
    },

    deleteStore: async (
      _parent: unknown,
      args: { id: string },
      context: GraphQLContext
    ) => {
      const { id } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      await context.prisma.store.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  Store: {
    // Add any store-specific field resolvers if needed
    // For example, to count products, billboards, etc.
    _count: async (parent: any, _args: any, context: any) => {
      const [products, billboards, customers] = await Promise.all([
        context.prisma.product.count({
          where: { storeId: parent.id }
        }),
        context.prisma.billboard.count({
          where: { storeId: parent.id }
        }),
        context.prisma.customer.count({
          where: { storeId: parent.id }
        })
      ]);

      return {
        products,
        billboards,
        customers
      };
    },
  },
};