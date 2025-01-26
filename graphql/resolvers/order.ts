import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';

export const orderResolvers = {
  // Type resolvers
  Order: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    orderItems: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.orderItem.findMany({
        where: { orderId: parent.id },
        include: {
          variant: {
            include: {
              product: true
            }
          }
        }
      });
    },
    customer: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    }
  },

  OrderItem: {
    order: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.order.findUnique({
        where: { id: parent.orderId }
      });
    },
    variant: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.variant.findUnique({
        where: { id: parent.variantId },
        include: {
          product: true
        }
      });
    }
  },

  Query: {
    orders: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      requireStoreAccess(context, storeId);

      const orders = await context.prisma.order.findMany({
        where: { storeId },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });

      return orders;
    },

    order: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const order = await context.prisma.order.findFirst({
        where: { id, storeId },
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      if (!order) {
        throw new Error('Order not found');
      }

      return order;
    }
  },

  Mutation: {
    updateOrder: async (
      _parent: unknown,
      args: { id: string; storeId: string; input: { status?: string; isPaid?: boolean } },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      requireStoreAccess(context, storeId);

      const order = await context.prisma.order.update({
        where: { id },
        data: input,
        include: {
          orderItems: {
            include: {
              variant: {
                include: {
                  product: true
                }
              }
            }
          }
        }
      });

      return order;
    },

    deleteOrder: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      await context.prisma.order.delete({
        where: { id }
      });

      return true;
    }
  }
};