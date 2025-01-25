import { authResolvers } from './auth';
import { productResolvers } from './product';
import { brandResolvers } from './brand';
import { billboardResolvers } from './billboard';
import { colorResolvers } from './color';
import { sizeResolvers } from './size';
import { taxonomyResolvers } from './taxonomy';
import { layoutResolvers } from './layout';
import { stockItemResolvers } from './stock-item';
import { stockMovementResolvers } from './stock-movement';
import { supplierResolvers } from './supplier';
import { attributeResolvers } from './attribute';
import { attributeValueResolvers } from './attribute-value';
import { optionTypeResolvers } from './option-type';
import { optionValueResolvers } from './option-value';
import { reviewResolvers } from './review';
import { storeResolvers } from './store';
import { customerResolvers } from './customer';
import { checkoutResolvers } from './checkout';
import { GraphQLScalarType, Kind } from 'graphql';
import { Prisma } from '@prisma/client';

// Custom scalar resolvers
const dateTimeScalar = new GraphQLScalarType({
  name: 'DateTime',
  description: 'DateTime custom scalar type',
  serialize(value: any) {
    return value.toISOString();
  },
  parseValue(value: any) {
    return new Date(value);
  },
  parseLiteral(ast: any) {
    if (ast.kind === 'StringValue') {
      return new Date(ast.value);
    }
    return null;
  },
});

const decimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Decimal custom scalar type',
  serialize(value: any) {
    return parseFloat(value.toString());
  },
  parseValue(value: any) {
    return parseFloat(value);
  },
  parseLiteral(ast: any) {
    if (ast.kind === 'FloatValue' || ast.kind === 'IntValue') {
      return parseFloat(ast.value);
    }
    return null;
  },
});

const jsonScalar = new GraphQLScalarType({
  name: 'JSON',
  description: 'JSON custom scalar type',
  serialize(value: any) {
    return value;
  },
  parseValue(value: any) {
    return value;
  },
  parseLiteral(ast: any) {
    switch (ast.kind) {
      case Kind.STRING:
        return JSON.parse(ast.value);
      case Kind.OBJECT:
        return ast.fields.reduce((obj: any, field: any) => {
          obj[field.name.value] = parseLiteralObject(field.value);
          return obj;
        }, {});
      case Kind.LIST:
        return ast.values.map(parseLiteralObject);
      case Kind.INT:
        return parseInt(ast.value, 10);
      case Kind.FLOAT:
        return parseFloat(ast.value);
      case Kind.BOOLEAN:
        return ast.value;
      case Kind.NULL:
        return null;
      default:
        return null;
    }
  },
});

// Helper function for parsing JSON objects in parseLiteral
function parseLiteralObject(ast: any): any {
  switch (ast.kind) {
    case Kind.STRING:
      return ast.value;
    case Kind.INT:
      return parseInt(ast.value, 10);
    case Kind.FLOAT:
      return parseFloat(ast.value);
    case Kind.BOOLEAN:
      return ast.value;
    case Kind.LIST:
      return ast.values.map(parseLiteralObject);
    case Kind.OBJECT:
      return ast.fields.reduce((obj: any, field: any) => {
        obj[field.name.value] = parseLiteralObject(field.value);
        return obj;
      }, {});
    case Kind.NULL:
      return null;
    default:
      return null;
  }
}

// Combine all resolvers
export const resolvers = {
  DateTime: dateTimeScalar,
  Decimal: decimalScalar,
  JSON: jsonScalar,

  // Merge Query resolvers
  Query: {
    ...authResolvers.Query,
    ...productResolvers.Query,
    ...brandResolvers.Query,
    ...billboardResolvers.Query,
    ...colorResolvers.Query,
    ...sizeResolvers.Query,
    ...taxonomyResolvers.Query,
    ...layoutResolvers.Query,
    ...stockItemResolvers.Query,
    ...stockMovementResolvers.Query,
    ...supplierResolvers.Query,
    ...attributeResolvers.Query,
    ...attributeValueResolvers.Query,
    ...optionTypeResolvers.Query,
    ...optionValueResolvers.Query,
    ...reviewResolvers.Query,
    ...storeResolvers.Query,
    ...customerResolvers.Query,
    ...checkoutResolvers.Query,
  },

  // Merge Mutation resolvers
  Mutation: {
    ...authResolvers.Mutation,
    ...productResolvers.Mutation,
    ...brandResolvers.Mutation,
    ...billboardResolvers.Mutation,
    ...colorResolvers.Mutation,
    ...sizeResolvers.Mutation,
    ...taxonomyResolvers.Mutation,
    ...layoutResolvers.Mutation,
    ...stockItemResolvers.Mutation,
    ...stockMovementResolvers.Mutation,
    ...supplierResolvers.Mutation,
    ...attributeResolvers.Mutation,
    ...attributeValueResolvers.Mutation,
    ...optionTypeResolvers.Mutation,
    ...optionValueResolvers.Mutation,
    ...reviewResolvers.Mutation,
    ...storeResolvers.Mutation,
    ...customerResolvers.Mutation,
    ...checkoutResolvers.Mutation,
  },

  // Type resolvers
  Store: {
    _count: storeResolvers.Store._count,
    customers: async (parent: any, _args: any, context: any) => {
      return context.prisma.customer.findMany({
        where: { storeId: parent.id }
      });
    },
  },

  Customer: {
    store: async (parent: any, _args: any, context: any) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    reviews: customerResolvers.Customer.reviews,
    addresses: customerResolvers.Customer.addresses,
    orders: async (parent: any, _args: any, context: any) => {
      return context.prisma.order.findMany({
        where: { customerId: parent.id },
        orderBy: { createdAt: 'desc' },
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
    },
  },

  Address: {
    customer: async (parent: any, _args: any, context: any) => {
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    },
  },

  Order: {
    store: async (parent: any, _args: any, context: any) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    customer: async (parent: any, _args: any, context: any) => {
      return context.prisma.customer.findUnique({
        where: { id: parent.customerId }
      });
    },
    orderItems: async (parent: any, _args: any, context: any) => {
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

  Product: {
    brand: async (parent: any, _args: any, context: any) => {
      if (!parent.brandId) return null;
      return context.prisma.brand.findUnique({
        where: { id: parent.brandId }
      });
    },
    taxons: async (parent: any, _args: any, context: any) => {
      const productTaxons = await context.prisma.product.findUnique({
        where: { id: parent.id },
        include: { taxons: true }
      });
      return productTaxons?.taxons || [];
    },
    variants: async (parent: any, _args: any, context: any) => {
      return context.prisma.variant.findMany({
        where: { productId: parent.id },
        include: {
          stockItems: true
        }
      });
    },
    optionTypes: async (parent: any, _args: any, context: any) => {
      return context.prisma.optionType.findMany({
        where: { productId: parent.id },
        include: {
          optionValues: true
        },
        orderBy: {
          position: 'asc'
        }
      });
    },
  },
};