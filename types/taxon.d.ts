declare module '@/types/taxon' {
  import { Taxon, Taxonomy } from '@prisma/client';

  interface TaxonWithProducts extends Taxon {
    products: Array<{ id: string }>;
  }

  export interface TaxonWithChildren extends Omit<TaxonWithProducts, 'children'> {
    children?: TaxonWithChildren[];
  }

  export interface TaxonomyWithTaxons extends Omit<Taxonomy, 'taxons'> {
    taxons: TaxonWithChildren[];
  }
}