import { useState } from 'react';
import { graphqlClient } from '@/lib/graphql-client';

const DELETE_TAXONOMY = `
  mutation DeleteTaxonomy($id: String!, $storeId: String!) {
    deleteTaxonomy(id: $id, storeId: $storeId)
  }
`;

const CREATE_TAXONOMY = `
  mutation CreateTaxonomy($storeId: String!, $input: TaxonomyCreateInput!) {
    createTaxonomy(storeId: $storeId, input: $input) {
      id
      name
      description
    }
  }
`;

const UPDATE_TAXONOMY = `
  mutation UpdateTaxonomy($id: String!, $storeId: String!, $input: TaxonomyUpdateInput!) {
    updateTaxonomy(id: $id, storeId: $storeId, input: $input) {
      id
      name
      description
    }
  }
`;

const CREATE_TAXON = `
  mutation CreateTaxon($taxonomyId: String!, $storeId: String!, $input: TaxonCreateInput!) {
    createTaxon(taxonomyId: $taxonomyId, storeId: $storeId, input: $input) {
      id
      name
      description
      position
      level
      permalink
    }
  }
`;

const UPDATE_TAXON = `
  mutation UpdateTaxon($id: String!, $storeId: String!, $input: TaxonUpdateInput!) {
    updateTaxon(id: $id, storeId: $storeId, input: $input) {
      id
      name
      description
      position
      level
      permalink
    }
  }
`;

const DELETE_TAXON = `
  mutation DeleteTaxon($id: String!, $storeId: String!) {
    deleteTaxon(id: $id, storeId: $storeId)
  }
`;

interface TaxonomyInput {
  name: string;
  description?: string;
}

interface TaxonInput {
  name: string;
  description?: string;
  position?: number;
  taxonomyId: string;
  billboardId?: string;
  parentId?: string;
}

export const useTaxonomyMutations = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createTaxonomy = async (storeId: string, input: TaxonomyInput) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(CREATE_TAXONOMY, {
        storeId,
        input
      });
      setError(null);
      return response.createTaxonomy;
    } catch (err) {
      console.error('Error creating taxonomy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create taxonomy';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTaxonomy = async (storeId: string, id: string, input: TaxonomyInput) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(UPDATE_TAXONOMY, {
        id,
        storeId,
        input
      });
      setError(null);
      return response.updateTaxonomy;
    } catch (err) {
      console.error('Error updating taxonomy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update taxonomy';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTaxonomy = async (storeId: string, id: string) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(DELETE_TAXONOMY, {
        id,
        storeId
      });
      setError(null);
      return response.deleteTaxonomy;
    } catch (err) {
      console.error('Error deleting taxonomy:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete taxonomy';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createTaxon = async (storeId: string, input: TaxonInput) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(CREATE_TAXON, {
        taxonomyId: input.taxonomyId,
        storeId,
        input: {
          name: input.name,
          description: input.description,
          position: input.position,
          billboardId: input.billboardId,
          parentId: input.parentId
        }
      });
      setError(null);
      return response.createTaxon;
    } catch (err) {
      console.error('Error creating taxon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to create taxon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const updateTaxon = async (storeId: string, id: string, input: Omit<TaxonInput, 'taxonomyId'>) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(UPDATE_TAXON, {
        id,
        storeId,
        input: {
          name: input.name,
          description: input.description,
          position: input.position,
          billboardId: input.billboardId,
          parentId: input.parentId
        }
      });
      setError(null);
      return response.updateTaxon;
    } catch (err) {
      console.error('Error updating taxon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to update taxon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const deleteTaxon = async (storeId: string, id: string) => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(DELETE_TAXON, {
        id,
        storeId
      });
      setError(null);
      return response.deleteTaxon;
    } catch (err) {
      console.error('Error deleting taxon:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete taxon';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return {
    createTaxonomy,
    updateTaxonomy,
    deleteTaxonomy,
    createTaxon,
    updateTaxon,
    deleteTaxon,
    loading,
    error
  };
};