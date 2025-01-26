import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';

export const optionValueResolvers = {
  Query: {
    optionValues: async (
      _parent: unknown,
      args: { storeId: string; optionTypeId?: string },
      context: GraphQLContext
    ) => {
      const { storeId, optionTypeId } = args;
      requireStoreAccess(context, storeId);

      const optionValues = await context.prisma.optionValue.findMany({
        where: {
          optionType: {
            storeId
          },
          ...(optionTypeId && { optionTypeId }),
        },
        include: {
          optionType: {
            include: {
              product: true,
            }
          }
        },
        orderBy: {
          position: 'asc'
        }
      });

      return optionValues;
    },

    optionValue: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const optionValue = await context.prisma.optionValue.findFirst({
        where: {
          id,
          optionType: {
            storeId
          }
        },
        include: {
          optionType: {
            include: {
              product: true,
            }
          }
        }
      });

      if (!optionValue) {
        throw new Error('Option value not found');
      }

      return optionValue;
    },
  },

  Mutation: {
    createOptionValue: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          presentation?: string;
          position?: number;
          optionTypeId: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, presentation, position = 0, optionTypeId } = input;

      if (!name) {
        throw new Error('Name is required');
      }

      if (!optionTypeId) {
        throw new Error('Option Type ID is required');
      }

      requireStoreAccess(context, storeId);

      // Verify the option type belongs to the store
      const optionType = await context.prisma.optionType.findFirst({
        where: {
          id: optionTypeId,
          storeId
        }
      });

      if (!optionType) {
        throw new Error('Option type not found');
      }

      const optionValue = await context.prisma.optionValue.create({
        data: {
          name,
          presentation: presentation || name,
          position,
          optionTypeId,
        },
        include: {
          optionType: {
            include: {
              product: true,
            }
          }
        }
      });

      return optionValue;
    },

    updateOptionValue: async (
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

      // Verify the option value belongs to the store via option type
      const existingValue = await context.prisma.optionValue.findFirst({
        where: {
          id,
          optionType: {
            storeId
          }
        }
      });

      if (!existingValue) {
        throw new Error('Option value not found');
      }

      const optionValue = await context.prisma.optionValue.update({
        where: {
          id
        },
        data: input,
        include: {
          optionType: {
            include: {
              product: true,
            }
          }
        }
      });

      return optionValue;
    },

    deleteOptionValue: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      // Verify the option value belongs to the store via option type
      const existingValue = await context.prisma.optionValue.findFirst({
        where: {
          id,
          optionType: {
            storeId
          }
        }
      });

      if (!existingValue) {
        throw new Error('Option value not found');
      }

      await context.prisma.optionValue.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  OptionValue: {
    optionType: async (parent: any, _args: any, context: any) => {
      return context.prisma.optionType.findUnique({
        where: { id: parent.optionTypeId },
        include: {
          product: true,
        }
      });
    },
  },
};