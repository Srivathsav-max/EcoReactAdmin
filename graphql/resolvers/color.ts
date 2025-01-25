import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const colorResolvers = {
  Query: {
    colors: async (
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

      const colors = await context.prisma.color.findMany({
        where: {
          storeId
        }
      });

      return colors;
    },

    color: async (
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

      const color = await context.prisma.color.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!color) {
        throw new Error('Color not found');
      }

      return color;
    },
  },

  Mutation: {
    createColor: async (
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

      const color = await context.prisma.color.create({
        data: {
          name,
          value,
          storeId,
        }
      });

      return color;
    },

    updateColor: async (
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

      const color = await context.prisma.color.update({
        where: {
          id
        },
        data: {
          name,
          value
        }
      });

      return color;
    },

    deleteColor: async (
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

      await context.prisma.color.delete({
        where: {
          id
        }
      });

      return true;
    },
  },
};