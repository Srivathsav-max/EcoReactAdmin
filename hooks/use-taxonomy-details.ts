import { useEffect, useState, useCallback } from 'react';
import { graphqlClient } from '@/lib/graphql-client';
import { TaxonWithChildren, TaxonomyWithTaxons } from '@/types/taxon';

const GET_TAXONOMY_DETAILS = `
  query GetTaxonomyDetails($id: String!, $storeId: String!) {
    taxonomy(id: $id, storeId: $storeId) {
      id
      name
      description
      taxons(where: { parentId: null }) {
        id
        name
        description
        position
        level
        permalink
        products {
          id
        }
        children {
          id
          name
          description
          position
          level
          permalink
          products {
            id
          }
          children {
            id
            name
            description
            position
            level
            permalink
            products {
              id
            }
            children {
              id
              name
              description
              position
              level
              permalink
              products {
                id
              }
            }
          }
        }
      }
    }
  }
`;

interface TaxonomyResponse {
  taxonomy: TaxonomyWithTaxons;
}

export const useTaxonomyDetails = (storeId: string, taxonomyId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<TaxonomyWithTaxons | null>(null);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(GET_TAXONOMY_DETAILS, {
        id: taxonomyId,
        storeId
      });

      setData(response.taxonomy);
      setError(null);
    } catch (err) {
      console.error('Error fetching taxonomy details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch taxonomy details');
    } finally {
      setLoading(false);
    }
  }, [storeId, taxonomyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  return {
    data,
    loading,
    error,
    refetch: fetchData
  };
};

export type { TaxonWithChildren, TaxonomyWithTaxons };