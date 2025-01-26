import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Helper function to build taxon hierarchy
const buildTaxonHierarchy = (taxons: any[], parentId: string | null = null, level = 0): any[] => {
  return taxons
    .filter(taxon => taxon.parentId === parentId)
    .map(taxon => ({
      ...taxon,
      level,
      children: buildTaxonHierarchy(taxons, taxon.id, level + 1)
    }))
    .sort((a, b) => a.position - b.position);
};

// Helper function to get full path
const getFullPath = (taxon: any, taxonomy: any, allTaxons: any[]): string => {
  const parts = [taxon.name];
  let current = taxon;
  
  while (current.parentId) {
    const parent = allTaxons.find(t => t.id === current.parentId);
    if (!parent) break;
    parts.unshift(parent.name);
    current = parent;
  }
  
  return `${taxonomy.name} > ${parts.join(' > ')}`;
};

export const taxonomyResolvers = {
  Query: {
    taxonomies: async (
      _parent: unknown,
      args: { storeId: string },
      context: GraphQLContext
    ) => {
      const { storeId } = args;
      requireStoreAccess(context, storeId);

      const rawTaxonomies = await context.prisma.taxonomy.findMany({
        where: { storeId },
        include: {
          taxons: {
            include: {
              billboard: true,
            }
          }
        },
        orderBy: {
          createdAt: 'desc'
        }
      });

      const processedTaxonomies = rawTaxonomies.map(taxonomy => {
        const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);
        return {
          ...taxonomy,
          _count: {
            taxons: taxonomy.taxons.length
          },
          taxons: hierarchicalTaxons
        };
      });

      return processedTaxonomies;
    },

    taxonomy: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      const taxonomy = await context.prisma.taxonomy.findFirst({
        where: { id, storeId },
        include: {
          taxons: {
            include: {
              billboard: true,
              products: true
            }
          }
        }
      });

      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);

      return {
        ...taxonomy,
        _count: {
          taxons: taxonomy.taxons.length
        },
        taxons: hierarchicalTaxons
      };
    },
  },

  Mutation: {
    createTaxonomy: async (
      _parent: unknown,
      args: { 
        storeId: string; 
        input: { 
          name: string;
          description?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { storeId, input } = args;
      const { name, description } = input;

      requireStoreAccess(context, storeId);

      const taxonomy = await context.prisma.taxonomy.create({
        data: {
          name,
          description,
          storeId,
        },
        include: {
          taxons: true
        }
      });

      return {
        ...taxonomy,
        _count: {
          taxons: 0
        },
        taxons: []
      };
    },

    updateTaxonomy: async (
      _parent: unknown,
      args: { 
        id: string;
        storeId: string; 
        input: { 
          name: string;
          description?: string;
        } 
      },
      context: GraphQLContext
    ) => {
      const { id, storeId, input } = args;
      const { name, description } = input;

      requireStoreAccess(context, storeId);

      const taxonomy = await context.prisma.taxonomy.update({
        where: { id },
        data: {
          name,
          description
        },
        include: {
          taxons: {
            include: {
              billboard: true,
              products: true
            }
          }
        }
      });

      const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);

      return {
        ...taxonomy,
        _count: {
          taxons: taxonomy.taxons.length
        },
        taxons: hierarchicalTaxons
      };
    },

    deleteTaxonomy: async (
      _parent: unknown,
      args: { id: string; storeId: string },
      context: GraphQLContext
    ) => {
      const { id, storeId } = args;
      requireStoreAccess(context, storeId);

      await context.prisma.taxonomy.delete({
        where: { id }
      });

      return true;
    },
  },

  // Type resolvers
  Taxonomy: {
    store: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.store.findUnique({
        where: { id: parent.storeId }
      });
    },
    taxons: async (parent: any, args: { where?: { parentId: string | null } }, context: GraphQLContext) => {
      const where = {
        taxonomyId: parent.id,
        ...(args.where ? { parentId: args.where.parentId } : {})
      };

      const taxons = await context.prisma.taxon.findMany({
        where,
        include: {
          billboard: true,
          children: true,
          parent: true,
          products: true
        },
        orderBy: { position: 'asc' }
      });

      // If filtering by parentId, we only need to process this level
      if (args.where?.parentId !== undefined) {
        return taxons.map(taxon => ({
          ...taxon,
          level: taxon.parentId ? 1 : 0
        }));
      }

      // Otherwise, build full hierarchy
      const rootTaxons = taxons.filter(taxon => !taxon.parentId);
      return rootTaxons.map(taxon => ({
        ...taxon,
        level: 0,
        children: buildTaxonHierarchy(taxons, taxon.id, 1)
      }));
    }
  },

  Taxon: {
    taxonomy: async (parent: any, _args: any, context: GraphQLContext) => {
      return context.prisma.taxonomy.findUnique({
        where: { id: parent.taxonomyId }
      });
    },
    billboard: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.billboardId) return null;
      return context.prisma.billboard.findUnique({
        where: { id: parent.billboardId }
      });
    },
    parent: async (parent: any, _args: any, context: GraphQLContext) => {
      if (!parent.parentId) return null;
      const parentTaxon = await context.prisma.taxon.findUnique({
        where: { id: parent.parentId }
      });
      return parentTaxon ? { ...parentTaxon, level: (parent.level || 0) - 1 } : null;
    },
    children: async (parent: any, _args: any, context: GraphQLContext) => {
      const children = await context.prisma.taxon.findMany({
        where: { parentId: parent.id },
        orderBy: { position: 'asc' }
      });
      return children.map(child => ({
        ...child,
        level: (parent.level || 0) + 1
      }));
    },
    products: async (parent: any, _args: any, context: GraphQLContext) => {
      const taxon = await context.prisma.taxon.findUnique({
        where: { id: parent.id },
        include: { products: true }
      });
      return taxon?.products || [];
    }
  }
};