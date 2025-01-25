import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getCurrentUser } from '@/lib/session';

export const attributeResolvers = {
  Query: {
    attributes: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unauthenticated');
      }

      requireStoreAccess(context, storeId);

      const attributes = await context.prisma.attribute.findMany({
        where: {
          storeId
        },
        include: {
          values: true
        },
        orderBy: {
          position: 'asc'
        }
      });

      return attributes;
    },

    attribute: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unauthenticated');
      }

      requireStoreAccess(context, storeId);

      const attribute = await context.prisma.attribute.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          values: true
        }
      });

      if (!attribute) {
        throw new Error('Attribute not found');
      }

      return attribute;
    },
  },

  Mutation: {
    createAttribute: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          code: string;
          type: string;
          isRequired?: boolean;
          isVisible?: boolean;
          position?: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, code, type, isRequired = false, isVisible = true, position = 0 } = input;

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Unauthenticated');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      if (!code) {
        throw new Error('Code is required');
      }

      if (!type) {
        throw new Error('Type is required');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: user.id,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized');
      }

      const attribute = await context.prisma.attribute.create({
        data: {
          name,
          code,
          type,
          isRequired,
          isVisible,
          position,
          storeId,
        },
        include: {
          values: true
        }
      });

      return attribute;
    },

    updateAttribute: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name?: string;
          code?: string;
          type?: string;
          isRequired?: boolean;
          isVisible?: boolean;
          position?: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unauthenticated');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: user.id,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized');
      }

      const attribute = await context.prisma.attribute.update({
        where: {
          id
        },
        data: input,
        include: {
          values: true
        }
      });

      return attribute;
    },

    deleteAttribute: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const user = await getCurrentUser();

      if (!user) {
        throw new Error('Unauthenticated');
      }

      // Verify store ownership
      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: user.id,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized');
      }

      await context.prisma.attribute.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  Attribute: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    values: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.attributeValue.findMany({
        where: {
          attributeId: parent.id
        },
        orderBy: {
          position: 'asc'
        }
      });
    },
  },
};