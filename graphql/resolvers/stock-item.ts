import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const stockItemResolvers = {
  Query: {
    stockItems: async (
      _parent: unknown,
      args: { storeId: string; variantId?: string },
      context: GraphQLContext
    ) => {
      const { storeId, variantId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const stockItems = await context.prisma.stockItem.findMany({
        where: {
          storeId,
          ...(variantId && { variantId }),
        },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });

      return stockItems;
    },

    stockItem: async (
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

      const stockItem = await context.prisma.stockItem.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });

      if (!stockItem) {
        throw new Error('Stock item not found');
      }

      return stockItem;
    },
  },

  Mutation: {
    createStockItem: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          variantId: string;
          count: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { variantId, count = 0 } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!variantId) {
        throw new Error('Variant ID is required');
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

      // Check if stock item already exists for this variant and store
      const existingStockItem = await context.prisma.stockItem.findFirst({
        where: {
          variantId,
          storeId,
        }
      });

      if (existingStockItem) {
        throw new Error('Stock item already exists for this variant');
      }

      const stockItem = await context.prisma.stockItem.create({
        data: {
          variantId,
          storeId,
          count,
        },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });

      return stockItem;
    },

    updateStockItem: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          count: number;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { count } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const stockItem = await context.prisma.stockItem.update({
        where: {
          id
        },
        data: {
          count
        },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });

      return stockItem;
    },

    deleteStockItem: async (
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

      await context.prisma.stockItem.delete({
        where: {
          id
        }
      });

      return true;
    },

    adjustStockItemCount: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        adjustment: number;
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, adjustment } = args;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const stockItem = await context.prisma.stockItem.findUnique({
        where: { id }
      });

      if (!stockItem) {
        throw new Error('Stock item not found');
      }

      const updatedStockItem = await context.prisma.stockItem.update({
        where: {
          id
        },
        data: {
          count: stockItem.count + adjustment
        },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });

      return updatedStockItem;
    },
  },
};