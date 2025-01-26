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
import { orderResolvers } from './order';
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
    if (ast.kind === Kind.STRING) {
      return new Date(ast.value);
    }
    return null;
  },
});

const decimalScalar = new GraphQLScalarType({
  name: 'Decimal',
  description: 'Decimal custom scalar type',
  serialize(value: any) {
    return value instanceof Prisma.Decimal ? value.toNumber() : value;
  },
  parseValue(value: any) {
    return new Prisma.Decimal(value);
  },
  parseLiteral(ast: any) {
    if (ast.kind === Kind.FLOAT || ast.kind === Kind.INT) {
      return new Prisma.Decimal(ast.value);
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
    return parseLiteralObject(ast);
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
    ...orderResolvers.Query,
  },

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
    ...orderResolvers.Mutation,
  },

  // Type resolvers
  Store: storeResolvers.Store,
  Product: productResolvers.Product,
  Variant: productResolvers.Variant,
  ProductProperty: productResolvers.ProductProperty,
  Order: orderResolvers.Order,
  OrderItem: orderResolvers.OrderItem,
  Customer: customerResolvers.Customer,
  Address: customerResolvers.Address,
  Taxonomy: taxonomyResolvers.Taxonomy,
  Taxon: taxonomyResolvers.Taxon,
  Billboard: billboardResolvers.Billboard,
  Brand: brandResolvers.Brand,
  Supplier: supplierResolvers.Supplier,
  Attribute: attributeResolvers.Attribute,
  AttributeValue: attributeValueResolvers.AttributeValue,
  OptionType: optionTypeResolvers.OptionType,
  OptionValue: optionValueResolvers.OptionValue,
  StockItem: stockItemResolvers.StockItem,
  StockMovement: stockMovementResolvers.StockMovement,
  Size: sizeResolvers.Size,
  Color: colorResolvers.Color,
  HomeLayout: layoutResolvers.HomeLayout,
  LayoutComponent: layoutResolvers.LayoutComponent,
  ProductReview: reviewResolvers.ProductReview
};