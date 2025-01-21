declare module '@/types/taxon' {
  import { Taxon, Taxonomy } from '@prisma/client';

  export interface TaxonWithChildren extends Omit<Taxon, 'children'> {
    children?: TaxonWithChildren[];
  }

  export interface TaxonomyWithTaxons extends Omit<Taxonomy, 'taxons'> {
    taxons: TaxonWithChildren[];
  }
} 