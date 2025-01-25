import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';

export const optionTypeResolvers = {
  Query: {
    optionTypes: async (
      _parent: unknown,
      args: { storeId: string; productId?: string },
      context: GraphQLContext
    ) => {
      const { storeId, productId } = args;
      requireStoreAccess(context, storeId);

      const optionTypes = await context.prisma.optionType.findMany({
        where: {
          storeId,
          ...(productId && { productId }),
        },
        include: {
          optionValues: true,
          product: true,
        },
        orderBy: {
          position: 'asc'
        }
      });

      return optionTypes;
    },

    optionType: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const optionType = await context.prisma.optionType.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          optionValues: true,
          product: true,
        }
      });

      if (!optionType) {
        throw new Error('Option type not found');
      }

      return optionType;
    },
  },

  Mutation: {
    createOptionType: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          presentation?: string;
          position?: number;
          productId: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, presentation, position = 0, productId } = input;

      if (!name || !productId) {
        throw new Error('Name and Product ID are required');
      }

      requireStoreAccess(context, storeId);

      // Verify the product belongs to the store
      const product = await context.prisma.product.findFirst({
        where: {
          id: productId,
          storeId
        }
      });

      if (!product) {
        throw new Error('Product not found');
      }

      const optionType = await context.prisma.optionType.create({
        data: {
          name,
          presentation: presentation || name,
          position,
          productId,
          storeId,
        },
        include: {
          optionValues: true,
          product: true,
        }
      });

      return optionType;
    },

    updateOptionType: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name?: string;
          presentation?: string;
          position?: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      requireStoreAccess(context, storeId);

      // Verify the option type belongs to the store
      const existingType = await context.prisma.optionType.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!existingType) {
        throw new Error('Option type not found');
      }

      const optionType = await context.prisma.optionType.update({
        where: {
          id
        },
        data: input,
        include: {
          optionValues: true,
          product: true,
        }
      });

      return optionType;
    },

    deleteOptionType: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      // Verify the option type belongs to the store
      const existingType = await context.prisma.optionType.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!existingType) {
        throw new Error('Option type not found');
      }

      await context.prisma.optionType.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  OptionType: {
    optionValues: async (parent: any, _args: any, context: any) => {
      return context.prisma.optionValue.findMany({
        where: { optionTypeId: parent.id },
        orderBy: {
          position: 'asc'
        }
      });
    },
    product: async (parent: any, _args: any, context: any) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId }
      });
    },
  },
};