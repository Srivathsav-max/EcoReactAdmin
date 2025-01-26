import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getCurrentUser } from '@/lib/session';

export const attributeValueResolvers = {
  Query: {
    attributeValues: async (
      _parent: unknown,
      args: { storeId: string; attributeId?: string },
      context: GraphQLContext
    ) => {
      const { storeId, attributeId } = args;

      const attributeValues = await context.prisma.attributeValue.findMany({
        where: {
          storeId,
          ...(attributeId && { attributeId })
        },
        include: {
          attribute: true
        },
        orderBy: {
          position: 'asc'
        }
      });

      return attributeValues;
    },

    attributeValue: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;

      const attributeValue = await context.prisma.attributeValue.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          attribute: true
        }
      });

      if (!attributeValue) {
        throw new Error('Attribute value not found');
      }

      return attributeValue;
    },
  },

  Mutation: {
    createAttributeValue: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          value: string;
          attributeId: string;
          position?: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { value, attributeId, position = 0 } = input;

      const user = await getCurrentUser();
      if (!user) {
        throw new Error('Unauthenticated');
      }

      if (!value) {
        throw new Error('Value is required');
      }

      if (!attributeId) {
        throw new Error('Attribute ID is required');
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

      const attributeValue = await context.prisma.attributeValue.create({
        data: {
          value,
          position,
          attributeId,
          storeId,
        },
        include: {
          attribute: true
        }
      });

      return attributeValue;
    },

    updateAttributeValue: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          value?: string;
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

      const attributeValue = await context.prisma.attributeValue.update({
        where: {
          id
        },
        data: input,
        include: {
          attribute: true
        }
      });

      return attributeValue;
    },

    deleteAttributeValue: async (
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

      await context.prisma.attributeValue.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  AttributeValue: {
    attribute: async (parent: any, _args: any, context: any) => {
      return context.prisma.attributes.findUnique({
        where: { id: parent.attributeId }
      });
    },
  },
};