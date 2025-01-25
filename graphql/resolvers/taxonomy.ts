import { GraphQLContext } from '../context';
import { requireStoreAccess } from '../context';
import { getAdminSession } from '@/lib/auth';
import { Prisma } from '@prisma/client';

// Helper function to build taxon hierarchy
const buildTaxonHierarchy = (taxons: any[], parentId: string | null = null): any[] => {
  return taxons
    .filter(taxon => taxon.parentId === parentId)
    .map(taxon => ({
      ...taxon,
      children: buildTaxonHierarchy(taxons, taxon.id)
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
        where: {
          storeId
        },
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

      // Process taxonomies
      const processedTaxonomies = rawTaxonomies.map(taxonomy => {
        const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);
        
        // Add full paths and levels to each taxon
        const processNode = (node: any, level: number = 0): any => {
          return {
            ...node,
            level,
            fullPath: getFullPath(node, taxonomy, taxonomy.taxons),
            children: node.children.map((child: any) => processNode(child, level + 1))
          };
        };

        const processedTaxons = hierarchicalTaxons.map(taxon => processNode(taxon));

        return {
          ...taxonomy,
          _count: {
            taxons: taxonomy.taxons.length
          },
          taxons: processedTaxons
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
        where: {
          id,
          storeId
        },
        include: {
          taxons: {
            include: {
              billboard: true,
            }
          }
        }
      });

      if (!taxonomy) {
        throw new Error('Taxonomy not found');
      }

      const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);
      
      // Add full paths and levels to each taxon
      const processNode = (node: any, level: number = 0): any => {
        return {
          ...node,
          level,
          fullPath: getFullPath(node, taxonomy, taxonomy.taxons),
          children: node.children.map((child: any) => processNode(child, level + 1))
        };
      };

      const processedTaxons = hierarchicalTaxons.map(taxon => processNode(taxon));

      return {
        ...taxonomy,
        _count: {
          taxons: taxonomy.taxons.length
        },
        taxons: processedTaxons
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

      if (!name) {
        throw new Error('Name is required');
      }

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

      if (!name) {
        throw new Error('Name is required');
      }

      requireStoreAccess(context, storeId);

      const taxonomy = await context.prisma.taxonomy.update({
        where: {
          id
        },
        data: {
          name,
          description
        },
        include: {
          taxons: {
            include: {
              billboard: true
            }
          }
        }
      });

      const hierarchicalTaxons = buildTaxonHierarchy(taxonomy.taxons);
      
      // Add full paths and levels to each taxon
      const processNode = (node: any, level: number = 0): any => {
        return {
          ...node,
          level,
          fullPath: getFullPath(node, taxonomy, taxonomy.taxons),
          children: node.children.map((child: any) => processNode(child, level + 1))
        };
      };

      const processedTaxons = hierarchicalTaxons.map(taxon => processNode(taxon));

      return {
        ...taxonomy,
        _count: {
          taxons: taxonomy.taxons.length
        },
        taxons: processedTaxons
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
        where: {
          id
        }
      });

      return true;
    },
  },
};