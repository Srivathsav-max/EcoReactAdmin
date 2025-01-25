import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getCurrentUser } from '@/lib/session';
import { Prisma } from '@prisma/client';

export const brandResolvers = {
  Query: {
    brands: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      requireStoreAccess(context, storeId);

      const brands = await context.prisma.brand.findMany({
        where: {
          storeId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return brands;
    },

    brand: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const brand = await context.prisma.brand.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!brand) {
        throw new Error('Brand not found');
      }

      return brand;
    },
  },

  Mutation: {
    createBrand: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string; 
          description?: string; 
          logoUrl?: string; 
          website?: string; 
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, description, logoUrl, website } = input;

      const user = await getCurrentUser();
      if (!user?.id) {
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
        throw new Error('Unauthorized access to this store');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      const brand = await context.prisma.brand.create({
        data: {
          name,
          description,
          logoUrl,
          website,
          storeId,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        }
      });

      return brand;
    },

    updateBrand: async (
      _parent: unknown,
      args: { 
        id: string; 
        storeId: string; 
        input: { 
          name: string; 
          description?: string; 
          logoUrl?: string; 
          website?: string; 
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { name, description, logoUrl, website } = input;

      const user = await getCurrentUser();
      if (!user?.id) {
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
        throw new Error('Unauthorized access to this store');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      const brand = await context.prisma.brand.update({
        where: {
          id
        },
        data: {
          name,
          description,
          logoUrl,
          website,
          slug: name.toLowerCase().replace(/\s+/g, '-'),
        }
      });

      return brand;
    },

    deleteBrand: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;

      const user = await getCurrentUser();
      if (!user?.id) {
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
        throw new Error('Unauthorized access to this store');
      }

      await context.prisma.brand.delete({
        where: {
          id
        }
      });

      return true;
    },
  },
};