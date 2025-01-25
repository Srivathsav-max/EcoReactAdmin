import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const stockMovementResolvers = {
  Query: {
    stockMovements: async (
      _parent: unknown,
      args: { 
        storeId: string;
        stockItemId?: string;
        type?: string;
      },
      context: GraphQLContext
    ) => {
      const { storeId, stockItemId, type } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const stockMovements = await context.prisma.stockMovement.findMany({
        where: {
          stockItem: {
            storeId
          },
          ...(stockItemId && { stockItemId }),
          ...(type && { type }),
        },
        include: {
          stockItem: {
            include: {
              variant: true
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return stockMovements;
    },

    stockMovement: async (
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

      const stockMovement = await context.prisma.stockMovement.findFirst({
        where: {
          id,
          stockItem: {
            storeId
          }
        },
        include: {
          stockItem: {
            include: {
              variant: true
            }
          }
        }
      });

      if (!stockMovement) {
        throw new Error('Stock movement not found');
      }

      return stockMovement;
    },
  },

  Mutation: {
    createStockMovement: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          type: string;
          quantity: number;
          stockItemId: string;
          reason?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { type, quantity, stockItemId, reason } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!type) {
        throw new Error('Movement type is required');
      }

      if (typeof quantity !== 'number') {
        throw new Error('Quantity is required and must be a number');
      }

      if (!stockItemId) {
        throw new Error('Stock item ID is required');
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

      // Get stock item and verify it exists
      const stockItem = await context.prisma.stockItem.findUnique({
        where: {
          id: stockItemId,
        },
        include: {
          variant: true
        }
      });

      if (!stockItem) {
        throw new Error('Stock item not found');
      }

      // Create the stock movement
      const stockMovement = await context.prisma.stockMovement.create({
        data: {
          type,
          quantity,
          stockItemId,
          variantId: stockItem.variantId,
          reason: reason || null,
        },
        include: {
          stockItem: {
            include: {
              variant: true
            }
          }
        }
      });

      // Update stock item count based on movement
      await context.prisma.stockItem.update({
        where: {
          id: stockItemId
        },
        data: {
          count: stockItem.count + quantity
        }
      });

      return stockMovement;
    },
  },

  StockMovement: {
    stockItem: async (parent: any, _args: any, context: any) => {
      return context.prisma.stockItem.findUnique({
        where: { id: parent.stockItemId },
        include: {
          variant: true
        }
      });
    },
  },
};