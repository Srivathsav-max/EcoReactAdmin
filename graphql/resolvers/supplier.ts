import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getCurrentUser } from '@/lib/session';

export const supplierResolvers = {
  Query: {
    suppliers: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      requireStoreAccess(context, storeId);

      const suppliers = await context.prisma.supplier.findMany({
        where: {
          storeId
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return suppliers;
    },

    supplier: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const supplier = await context.prisma.supplier.findFirst({
        where: {
          id,
          storeId
        }
      });

      if (!supplier) {
        throw new Error('Supplier not found');
      }

      return supplier;
    },
  },

  Mutation: {
    createSupplier: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          code: string;
          email?: string;
          phone?: string;
          address?: string;
          website?: string;
          description?: string;
          isActive?: boolean;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { 
        name, 
        code, 
        email, 
        phone, 
        address, 
        website, 
        description, 
        isActive = true 
      } = input;

      const user = await getCurrentUser();
      if (!user?.id) {
        throw new Error('Unauthenticated');
      }

      if (!name) {
        throw new Error('Name is required');
      }

      if (!code) {
        throw new Error('Code is required');
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

      const supplier = await context.prisma.supplier.create({
        data: {
          name,
          code,
          email,
          phone,
          address,
          website,
          description,
          isActive,
          storeId,
        }
      });

      return supplier;
    },

    updateSupplier: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name?: string;
          code?: string;
          email?: string;
          phone?: string;
          address?: string;
          website?: string;
          description?: string;
          isActive?: boolean;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
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
        throw new Error('Unauthorized');
      }

      const supplier = await context.prisma.supplier.update({
        where: {
          id
        },
        data: input
      });

      return supplier;
    },

    deleteSupplier: async (
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
        throw new Error('Unauthorized');
      }

      await context.prisma.supplier.delete({
        where: {
          id
        }
      });

      return true;
    },
  },
};