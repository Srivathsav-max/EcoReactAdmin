import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const billboardResolvers = {
  Query: {
    billboards: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const billboards = await context.prisma.billboard.findMany({
        where: {
          storeId
        }
      });

      return billboards;
    },

    billboard: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const billboard = await context.prisma.billboard.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!billboard) {
        throw new Error('Billboard not found');
      }

      return billboard;
    },
  },

  Mutation: {
    createBillboard: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          label: string; 
          imageUrl: string; 
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { label, imageUrl } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!label) {
        throw new Error('Label is required');
      }

      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized - Store access denied');
      }

      const billboard = await context.prisma.billboard.create({
        data: {
          label,
          imageUrl,
          storeId,
        }
      });

      return billboard;
    },

    updateBillboard: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          label: string; 
          imageUrl: string; 
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { label, imageUrl } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!label) {
        throw new Error('Label is required');
      }

      if (!imageUrl) {
        throw new Error('Image URL is required');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized - Store access denied');
      }

      const billboard = await context.prisma.billboard.update({
        where: {
          id
        },
        data: {
          label,
          imageUrl
        }
      });

      return billboard;
    },

    deleteBillboard: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized - Store access denied');
      }

      await context.prisma.billboard.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  // Type resolvers
  Billboard: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    taxons: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.taxon.findMany({
        where: { billboardId: parent.id }
      });
    }
  }
};