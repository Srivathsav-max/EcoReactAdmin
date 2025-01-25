import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const layoutResolvers = {
  Query: {
    layouts: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const layouts = await context.prisma.homeLayout.findMany({
        where: {
          storeId
        },
        include: {
          components: {
            orderBy: {
              position: 'asc'
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return layouts;
    },

    layout: async (
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

      const layout = await context.prisma.homeLayout.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          components: {
            orderBy: {
              position: 'asc'
            }
          }
        }
      });

      if (!layout) {
        throw new Error('Layout not found');
      }

      return layout;
    },
  },

  Mutation: {
    createLayout: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!name) {
        throw new Error('Name is required');
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

      const layout = await context.prisma.homeLayout.create({
        data: {
          name,
          storeId,
        },
        include: {
          components: true
        }
      });

      return layout;
    },

    updateLayout: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { name } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      if (!name) {
        throw new Error('Name is required');
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

      const layout = await context.prisma.homeLayout.update({
        where: {
          id
        },
        data: {
          name
        },
        include: {
          components: {
            orderBy: {
              position: 'asc'
            }
          }
        }
      });

      return layout;
    },

    deleteLayout: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      const session = await getAdminSession();

      if (!session) {
        throw new Error('Unauthorized - Admin access required');
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

      await context.prisma.homeLayout.delete({
        where: {
          id
        }
      });

      return true;
    },

    addLayoutComponent: async (
      _parent: unknown,
      args: { 
        layoutId: string;
        storeId: string;
        input: {
          type: string;
          title: string;
          subtitle?: string;
          position: number;
          settings?: any;
        }
      },
      context: GraphQLContext
    ) => {
      const { layoutId, storeId, input } = args;
      const { type, title, subtitle, position, settings } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const component = await context.prisma.layoutComponent.create({
        data: {
          type,
          title,
          subtitle,
          position,
          settings,
          layoutId,
        }
      });

      return component;
    },

    updateLayoutComponent: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string;
        input: {
          type?: string;
          title?: string;
          subtitle?: string;
          position?: number;
          settings?: any;
        }
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const component = await context.prisma.layoutComponent.update({
        where: {
          id
        },
        data: input
      });

      return component;
    },

    deleteLayoutComponent: async (
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

      await context.prisma.layoutComponent.delete({
        where: {
          id
        }
      });

      return true;
    },
  },
};