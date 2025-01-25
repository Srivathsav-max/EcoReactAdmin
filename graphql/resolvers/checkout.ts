import { GraphQLContext } from '../context';
import { stripe } from '@/lib/stripe';
import Stripe from 'stripe';
import { Prisma } from '@prisma/client';
import * as bcrypt from 'bcrypt';

export const checkoutResolvers = {
  Mutation: {
    createCheckoutSession: async (
      _parent: unknown,
      args: { 
        storeId: string;
        input: { 
          variantIds: string[];
          quantities?: Record<string, number>;
          email: string;
          phone?: string;
          address?: string;
        }
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { variantIds, quantities = {}, email, phone = "", address = "" } = input;

      if (!variantIds || variantIds.length === 0) {
        throw new Error('Variant IDs are required');
      }

      if (!email) {
        throw new Error('Email is required');
      }

      // Get variants with their products
      const variants = await context.prisma.variant.findMany({
        where: {
          id: {
            in: variantIds
          },
          product: {
            storeId // Ensure products belong to the store
          }
        },
        include: {
          product: true
        }
      });

      if (variants.length !== variantIds.length) {
        throw new Error('Some variants not found or do not belong to this store');
      }

      // Find or create customer
      let customer = await context.prisma.customer.findFirst({
        where: {
          email,
          storeId
        }
      });

      if (!customer) {
        // Generate a random password for guest checkout
        const randomPassword = Math.random().toString(36).slice(-8);
        const hashedPassword = await bcrypt.hash(randomPassword, 10);

        customer = await context.prisma.customer.create({
          data: {
            email,
            name: email.split('@')[0], // Use email prefix as name
            password: hashedPassword,
            phone,
            storeId,
            addresses: {
              create: address ? [{
                type: 'billing',
                street: address,
                city: '',  // These would ideally come from the checkout form
                state: '',
                postalCode: '',
                country: '',
                isDefault: true
              }] : []
            }
          }
        });
      }

      // Create Stripe line items
      const line_items: Stripe.Checkout.SessionCreateParams.LineItem[] = [];

      variants.forEach((variant) => {
        if (!variant.price) {
          throw new Error(`Variant ${variant.name} has no price set`);
        }

        const quantity = quantities[variant.id] || 1;

        line_items.push({
          quantity,
          price_data: {
            currency: 'USD',
            product_data: {
              name: `${variant.product.name} - ${variant.name}`,
            },
            unit_amount: Math.round(variant.price.toNumber() * 100)
          }
        });
      });

      // Create order with items
      const order = await context.prisma.order.create({
        data: {
          storeId,
          customerId: customer.id, // Link order to customer
          isPaid: false,
          status: 'pending',
          phone,
          address,
          orderItems: {
            create: variants.map(variant => ({
              variantId: variant.id,
              price: variant.price,
              quantity: quantities[variant.id] || 1
            }))
          }
        },
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

      // Create Stripe checkout session
      const session = await stripe.checkout.sessions.create({
        line_items,
        mode: 'payment',
        billing_address_collection: 'required',
        phone_number_collection: {
          enabled: true,
        },
        customer_email: email,
        success_url: `${process.env.FRONTEND_STORE_URL}/cart?success=1`,
        cancel_url: `${process.env.FRONTEND_STORE_URL}/cart?canceled=1`,
        metadata: {
          orderId: order.id,
          customerId: customer.id,
          email
        },
      });

      if (!session.url) {
        throw new Error('Failed to create checkout session');
      }

      return {
        url: session.url,
        orderId: order.id
      };
    },
  },

  Query: {
    order: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;

      const order = await context.prisma.order.findFirst({
        where: {
          id,
          storeId
        },
        include: {
          customer: true,
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
    },

    orders: async (
      _parent: unknown,
      args: { 
        storeId: string;
        filter?: {
          isPaid?: boolean;
          status?: string;
        }
      },
      context: GraphQLContext
    ) => {
      const { storeId, filter } = args;

      const orders = await context.prisma.order.findMany({
        where: {
          storeId,
          ...(filter?.isPaid !== undefined && { isPaid: filter.isPaid }),
          ...(filter?.status && { status: filter.status })
        },
        include: {
          customer: true,
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
        orderBy: {
          createdAt: 'desc'
        }
      });

      return orders;
    },
  },

  Order: {
    store: async (parent: any, _args: any, context: any) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },

    customer: async (parent: any, _args: any, context: any) => {
      if (!parent.customerId) return null;
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    },

    // Resolver for calculating total amount
    total: async (parent: any) => {
      let total = 0;
      for (const item of parent.orderItems) {
        total += item.price.toNumber() * item.quantity;
      }
      return total;
    },
  },

  OrderItem: {
    order: async (parent: any, _args: any, context: any) => {
      return context.prisma.order.findUnique({
        where: { id: parent.orderId }
      });
    },

    variant: async (parent: any, _args: any, context: any) => {
      return context.prisma.variant.findUnique({
        where: { id: parent.variantId },
        include: {
          product: true
        }
      });
    },
  },
};