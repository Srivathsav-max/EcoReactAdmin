import { 
  PrismaProduct, 
  Product, 
  Variant, 
  PrismaVariant,
  Taxon,
  PrismaTaxon,
  OptionType,
  PrismaOptionType
} from "@/types/models";

/**
 * Converts a Prisma Decimal to a number
 */
export function formatPriceFromDecimal(price: any): number {
  if (!price) return 0;
  
  // If it's already a number, return it
  if (typeof price === 'number') return price;
  
  // If it has toNumber method (Prisma Decimal), use it
  if (typeof price.toNumber === 'function') {
    return price.toNumber();
  }
  
  // If it's a string (or can be converted to one), parse it
  const numStr = price.toString();
  const parsed = parseFloat(numStr);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Format a taxon from Prisma data
 */
function formatTaxon(taxon: PrismaTaxon): Taxon {
  return {
    id: taxon.id,
    name: taxon.name,
    permalink: taxon.permalink || taxon.id, // fallback to id if permalink is null
    description: taxon.description,
    position: taxon.position,
    billboard: taxon.billboard || undefined
  };
}

/**
 * Format option type from Prisma data
 */
function formatOptionType(optionType: PrismaOptionType): OptionType {
  return {
    id: optionType.id,
    name: optionType.name,
    presentation: optionType.presentation,
    position: optionType.position,
    optionValues: optionType.optionValues.map(ov => ({
      id: ov.id,
      name: ov.name,
      presentation: ov.presentation,
      position: ov.position,
      optionType: {
        id: optionType.id,
        name: optionType.name,
        presentation: optionType.presentation,
      }
    }))
  };
}

/**
 * Formats a variant from Prisma into the proper type with number prices
 */
export function formatVariant(variant: PrismaVariant): Variant {
  return {
    ...variant,
    price: formatPriceFromDecimal(variant.price),
    compareAtPrice: formatPriceFromDecimal(variant.compareAtPrice),
    optionValues: variant.optionValues.map(ov => ({
      optionValue: {
        id: ov.optionValue.id,
        name: ov.optionValue.name,
        presentation: ov.optionValue.presentation,
        position: ov.optionValue.position,
        optionType: ov.optionValue.optionType
      }
    }))
  };
}

/**
 * Formats a product from Prisma into the proper type with number prices
 */
export function formatProduct(product: PrismaProduct): Product {
  return {
    ...product,
    price: formatPriceFromDecimal(product.price),
    variants: product.variants.map(formatVariant),
    taxons: product.taxons.map(formatTaxon),
    optionTypes: product.optionTypes.map(formatOptionType)
  };
}

/**
 * Format an array of products from Prisma
 */
export function formatProducts(products: PrismaProduct[]): Product[] {
  return products.map(formatProduct);
}

/**
 * Get a product's price, handling Decimal format
 */
export function getProductPrice(product: PrismaProduct | Product): number {
  if (!product) return 0;
  
  // If the product has variants, use the first variant's price
  if (product.variants?.length > 0) {
    return formatPriceFromDecimal(product.variants[0].price);
  }
  
  // Otherwise use the product's price
  return formatPriceFromDecimal(product.price);
}

/**
 * Get a variant's price, handling Decimal format
 */
export function getVariantPrice(variant: PrismaVariant | Variant): number {
  if (!variant) return 0;
  return formatPriceFromDecimal(variant.price);
}
