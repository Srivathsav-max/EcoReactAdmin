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
          isActive: false,
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
          position: number;
          config?: any;
          isVisible?: boolean;
        }
      },
      context: GraphQLContext
    ) => {
      const { layoutId, storeId, input } = args;
      const { type, position, config = {}, isVisible = true } = input;

      const session = await getAdminSession();
      if (!session) {
        throw new Error('Unauthorized - Admin access required');
      }

      requireStoreAccess(context, storeId);

      const component = await context.prisma.layoutComponent.create({
        data: {
          type,
          position,
          config,
          isVisible,
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
          position?: number;
          config?: any;
          isVisible?: boolean;
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

  HomeLayout: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    components: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.layoutComponent.findMany({
        where: { layoutId: parent.id },
        orderBy: { position: 'asc' }
      });
    }
  },

  LayoutComponent: {
    layout: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.homeLayout.findUnique({
        where: { id: parent.layoutId }
      });
    }
  }
};
