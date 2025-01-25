import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const sizeResolvers = {
  Query: {
    sizes: async (
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

      const sizes = await context.prisma.size.findMany({
        where: {
          storeId
        }
      });

      return sizes;
    },

    size: async (
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

      const size = await context.prisma.size.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!size) {
        throw new Error('Size not found');
      }

      return size;
    },
  },

  Mutation: {
    createSize: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          value: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, value } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      if (!value) {
        throw new Error('Value is required');
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

      const size = await context.prisma.size.create({
        data: {
          name,
          value,
          storeId,
        }
      });

      return size;
    },

    updateSize: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name: string;
          value: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { name, value } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      if (!value) {
        throw new Error('Value is required');
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

      const size = await context.prisma.size.update({
        where: {
          id
        },
        data: {
          name,
          value
        }
      });

      return size;
    },

    deleteSize: async (
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

      await context.prisma.size.delete({
        where: {
          id
        }
      });

      return true;
    },
  },
};