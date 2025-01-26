import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { Prisma } from '@prisma/client';

export const productResolvers = {
  Query: {
    products: async (
      _parent: unknown,
      args: { storeId: string; filter?: { brandId?: string; isVisible?: boolean } },
      context: GraphQLContext
    ) => {
      const { storeId, filter } = args;
      requireStoreAccess(context, storeId);

      const products = await context.prisma.product.findMany({
        where: {
          storeId,
          brandId: filter?.brandId || undefined,
          isVisible: filter?.isVisible || undefined,
        },
        include: {
          images: true,
          brand: true,
          variants: {
            include: {
              stockItems: true,
            }
          },
          taxons: true,
          optionTypes: {
            include: {
              optionValues: true,
            }
          },
        },
        orderBy: {
          createdAt: 'desc',
        }
      });

      return products;
    },

    product: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const product = await context.prisma.product.findFirst({
        where: {
          id,
          storeId,
        },
        include: {
          images: true,
          brand: true,
          variants: {
            include: {
              stockItems: true,
            }
          },
          taxons: true,
          optionTypes: {
            include: {
              optionValues: true,
            }
          },
        },
      });

      if (!product) {
        throw new Error('Product not found');
      }

      return product;
    },
  },

  Mutation: {
    createProduct: async (
      _parent: unknown,
      args: { storeId: string; input: any },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      requireStoreAccess(context, storeId);

      const {
        name,
        description,
        price,
        images,
        brandId,
        isVisible = true,
        status = 'active',
        hasVariants = false,
        sku,
        barcode,
        tags = [],
        taxons = [],
        taxRate,
        weight,
        height,
        width,
        depth,
        minimumQuantity = 1,
        maximumQuantity,
        optionTypes = [],
      } = input;

      // Generate slug from name
      const slug = name.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const productData: Prisma.ProductCreateInput = {
        name,
        slug,
        description,
        price: parseFloat(price),
        brand: brandId ? { connect: { id: brandId } } : undefined,
        sku,
        barcode,
        status,
        isVisible,
        hasVariants,
        tags,
        taxRate: taxRate ? parseFloat(taxRate) : null,
        weight: weight ? parseFloat(weight) : null,
        height: height ? parseFloat(height) : null,
        width: width ? parseFloat(width) : null,
        depth: depth ? parseFloat(depth) : null,
        minimumQuantity,
        maximumQuantity,
        store: {
          connect: { id: storeId }
        },
        images: {
          createMany: {
            data: images.map((image: { url: string; fileId: string }) => ({
              url: image.url,
              fileId: image.fileId,
            })),
          },
        },
        optionTypes: {
          createMany: {
            data: optionTypes.map((ot: any) => ({
              name: ot.name,
              presentation: ot.presentation,
              position: ot.position,
              storeId,
            })),
          },
        },
        taxons: {
          connect: taxons.map((taxonId: string) => ({ id: taxonId })),
        },
      };

      const product = await context.prisma.product.create({
        data: productData,
        include: {
          images: true,
          brand: true,
          variants: {
            include: {
              stockItems: true,
            }
          },
          taxons: true,
        }
      });

      return product;
    },

    updateProduct: async (
      _parent: unknown,
      args: { id: string; storeId: string; input: any },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      requireStoreAccess(context, storeId);

      const {
        name,
        description,
        price,
        images,
        brandId,
        isVisible,
        status,
        hasVariants,
        sku,
        barcode,
        tags,
        taxons,
        taxRate,
        weight,
        height,
        width,
        depth,
        minimumQuantity,
        maximumQuantity,
        optionTypes,
      } = input;

      // Generate new slug if name is changed
      const slug = name?.toLowerCase().replace(/[^a-z0-9]/g, '-');

      const updateData: Prisma.ProductUpdateInput = {
        name,
        slug,
        description,
        price: price ? parseFloat(price) : undefined,
        brand: brandId ? { connect: { id: brandId } } : undefined,
        sku,
        barcode,
        status,
        isVisible,
        hasVariants,
        tags,
        taxRate: taxRate ? parseFloat(taxRate) : undefined,
        weight: weight ? parseFloat(weight) : undefined,
        height: height ? parseFloat(height) : undefined,
        width: width ? parseFloat(width) : undefined,
        depth: depth ? parseFloat(depth) : undefined,
        minimumQuantity,
        maximumQuantity,
        images: images ? {
          deleteMany: {},
          createMany: {
            data: images.map((image: { url: string; fileId: string }) => ({
              url: image.url,
              fileId: image.fileId,
            })),
          },
        } : undefined,
        optionTypes: optionTypes ? {
          deleteMany: {},
          createMany: {
            data: optionTypes.map((ot: any) => ({
              name: ot.name,
              presentation: ot.presentation,
              position: ot.position,
              storeId,
            })),
          },
        } : undefined,
        taxons: taxons ? {
          set: taxons.map((taxonId: string) => ({ id: taxonId })),
        } : undefined,
      };

      const product = await context.prisma.product.update({
        where: {
          id,
          storeId,
        },
        data: updateData,
        include: {
          images: true,
          brand: true,
          variants: {
            include: {
              stockItems: true,
            }
          },
          taxons: true,
        }
      });

      return product;
    },

    deleteProduct: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      await context.prisma.product.delete({
        where: {
          id,
          storeId,
        }
      });

      return true;
    },
  },

  // Type resolvers
  Product: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    brand: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.brandId) return null;
      return context.prisma.brand.findUnique({
        where: { id: parent.brandId }
      });
    },
    variants: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.variant.findMany({
        where: { productId: parent.id },
        include: {
          stockItems: true,
          optionValues: true
        }
      });
    },
    images: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.image.findMany({
        where: { productId: parent.id }
      });
    },
    taxons: async (parent: any, _args: any, context: GraphQLContext) => {
      const productTaxons = await context.prisma.product.findUnique({
        where: { id: parent.id },
        include: { taxons: true }
      });
      return productTaxons?.taxons || [];
    },
    optionTypes: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.optionType.findMany({
        where: { productId: parent.id },
        include: {
          optionValues: true
        },
        orderBy: { position: 'asc' }
      });
    },
  },

  Variant: {
    product: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId }
      });
    },
    stockItems: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.stockItem.findMany({
        where: { variantId: parent.id }
      });
    },
    optionValues: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.variantOptionValue.findMany({
        where: { variantId: parent.id },
        include: { optionValue: true }
      });
    },
    size: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.sizeId) return null;
      return context.prisma.size.findUnique({
        where: { id: parent.sizeId }
      });
    },
    color: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.colorId) return null;
      return context.prisma.color.findUnique({
        where: { id: parent.colorId }
      });
    },
  },

  ProductProperty: {
    product: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.product.findUnique({
        where: { id: parent.productId }
      });
    },
  },
};