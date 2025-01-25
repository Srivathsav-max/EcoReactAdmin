import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const reviewResolvers = {
  Query: {
    reviews: async (
      _parent: unknown,
      args: { 
        storeId: string;
        filter?: {
          productId?: string;
          status?: string;
          customerId?: string;
        }
      },
      context: GraphQLContext
    ) => {
      const { storeId, filter } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      const reviews = await context.prisma.productReview.findMany({
        where: {
          product: {
            storeId
          },
          ...(filter?.productId && { productId: filter.productId }),
          ...(filter?.status && { status: filter.status }),
          ...(filter?.customerId && { customerId: filter.customerId })
        },
        include: {
          product: true,
          customer: true
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return reviews;
    },

    review: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      const review = await context.prisma.productReview.findFirst({
        where: {
          id,
          product: {
            storeId
          }
        },
        include: {
          product: true,
          customer: true
        }
      });

      if (!review) {
        throw new Error('Review not found');
      }

      return review;
    },
  },

  Mutation: {
    createReview: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          productId: string;
          customerId: string;
          rating: number;
          title?: string;
          content: string;
          status?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { productId, customerId, rating, title, content, status = "pending" } = input;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      if (!productId) {
        throw new Error('Product ID is required');
      }

      if (!customerId) {
        throw new Error('Customer ID is required');
      }

      if (!rating) {
        throw new Error('Rating is required');
      }

      if (!content) {
        throw new Error('Content is required');
      }

      const review = await context.prisma.productReview.create({
        data: {
          productId,
          customerId,
          rating,
          title,
          content,
          status
        },
        include: {
          product: true,
          customer: true
        }
      });

      return review;
    },

    updateReviewStatus: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string;
        status: string;
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, status } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      const review = await context.prisma.productReview.update({
        where: { id },
        data: { status },
        include: {
          product: true,
          customer: true
        }
      });

      return review;
    },

    deleteReview: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized access. Admin authentication required.');
      }

      const storeByUserId = await context.prisma.store.findFirst({
        where: {
          id: storeId,
          userId: session.userId,
        }
      });

      if (!storeByUserId) {
        throw new Error('Unauthorized access to this store');
      }

      await context.prisma.productReview.delete({
        where: { id }
      });

      return true;
    },
  },

  Review: {
    product: async (parent: any, _args: any, context: any) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId }
      });
    },
    customer: async (parent: any, _args: any, context: any) => {
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    },
  },
};