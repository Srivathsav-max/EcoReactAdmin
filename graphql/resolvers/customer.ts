import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';

export const customerResolvers = {
  Query: {
    customers: async (
      _parent: unknown,
      args: { 
        storeId: string;
        filter?: {
          email?: string;
          name?: string;
        }
      },
      context: GraphQLContext
    ) => {
      const { storeId, filter } = args;
      requireStoreAccess(context, storeId);

      const customers = await context.prisma.customer.findMany({
        where: {
          storeId,
          ...(filter?.email && {
            email: {
              contains: filter.email,
              mode: 'insensitive'
            }
          }),
          ...(filter?.name && {
            name: {
              contains: filter.name,
              mode: 'insensitive'
            }
          }),
        },
        include: {
          reviews: true,
          addresses: true,
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      return customers;
    },

    customer: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const customer = await context.prisma.customer.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          reviews: true,
          addresses: true,
        }
      });

      if (!customer) {
        throw new Error('Customer not found');
      }

      return customer;
    },
  },

  Mutation: {
    createCustomer: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          email: string;
          password: string;
          phone?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, email, password, phone } = input;

      requireStoreAccess(context, storeId);

      const existingCustomer = await context.prisma.customer.findFirst({
        where: {
          email,
          storeId
        }
      });

      if (existingCustomer) {
        throw new Error('Email already in use');
      }

      const customer = await context.prisma.customer.create({
        data: {
          name,
          email,
          password,
          phone,
          storeId,
        },
        include: {
          reviews: true,
          addresses: true,
        }
      });

      return customer;
    },

    updateCustomer: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name?: string;
          email?: string;
          phone?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      requireStoreAccess(context, storeId);

      if (input.email) {
        const existingCustomer = await context.prisma.customer.findFirst({
          where: {
            email: input.email,
            storeId,
            NOT: {
              id
            }
          }
        });

        if (existingCustomer) {
          throw new Error('Email already in use');
        }
      }

      const customer = await context.prisma.customer.update({
        where: {
          id
        },
        data: input,
        include: {
          reviews: true,
          addresses: true,
        }
      });

      return customer;
    },

    deleteCustomer: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      await context.prisma.customer.delete({
        where: {
          id
        }
      });

      return true;
    },

    addCustomerAddress: async (
      _parent: unknown,
      args: { 
        customerId: string;
        storeId: string;
        input: {
          type: string;
          street: string;
          city: string;
          state: string;
          postalCode: string;
          country: string;
          isDefault?: boolean;
        }
      },
      context: GraphQLContext
    ) => {
      const { customerId, storeId, input } = args;
      requireStoreAccess(context, storeId);

      const address = await context.prisma.address.create({
        data: {
          ...input,
          customerId,
        }
      });

      return address;
    },

    updateCustomerAddress: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string;
        input: {
          type?: string;
          street?: string;
          city?: string;
          state?: string;
          postalCode?: string;
          country?: string;
          isDefault?: boolean;
        }
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      requireStoreAccess(context, storeId);

      const address = await context.prisma.address.update({
        where: {
          id
        },
        data: input
      });

      return address;
    },

    deleteCustomerAddress: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      await context.prisma.address.delete({
        where: {
          id
        }
      });

      return true;
    },
  },

  Customer: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    reviews: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.productReview.findMany({
        where: { customerId: parent.id },
        orderBy: {
          createdAt: 'desc'
        }
      });
    },
    addresses: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.address.findMany({
        where: { customerId: parent.id },
        orderBy: [
          { isDefault: 'desc' },
          { createdAt: 'desc' }
        ]
      });
    }
  },

  Address: {
    customer: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    }
  }
};