import { useEffect, useState, useCallback } from 'react';
import { format } from 'date-fns';
import { graphqlClient } from '@/lib/graphql-client';

export const GET_TAXONOMIES = `
  query GetTaxonomies($storeId: String!) {
    taxonomies(storeId: $storeId) {
      id
      name
      taxons {
        id
      }
      createdAt
    }
  }
`;

export interface Taxonomy {
  id: string;
  name: string;
  taxonsCount: number;
  createdAt: string;
}

interface RawTaxonomy {
  id: string;
  name: string;
  taxons: Array<{ id: string }>;
  createdAt: string;
}

interface TaxonomiesResponse {
  taxonomies: RawTaxonomy[];
}

export const useTaxonomies = (storeId: string) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<Taxonomy[]>([]);

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const response = await graphqlClient.request(GET_TAXONOMIES, {
        storeId
      });

      const formattedTaxonomies = response.taxonomies.map((taxonomy: RawTaxonomy) => ({
        id: taxonomy.id,
        name: taxonomy.name,
        taxonsCount: taxonomy.taxons.length,
        createdAt: format(new Date(taxonomy.createdAt), 'MMMM do, yyyy'),
      }));

      setData(formattedTaxonomies);
      setError(null);
    } catch (err) {
      console.error('Error fetching taxonomies:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch taxonomies');
    } finally {
      setLoading(false);
    }
  }, [storeId]);

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