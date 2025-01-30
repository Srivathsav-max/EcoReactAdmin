export const formatPrice = (price: number | string): number => {
  const numericPrice = typeof price === 'string' ? parseFloat(price) : price;
  return Number(numericPrice.toFixed(2));
};

export const formatPriceWithCurrency = (price: number | string): string => {
  const formattedPrice = formatPrice(price);
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(formattedPrice);
};

export const formatProduct = (product: any) => {
  return {
    ...product,
    price: formatPrice(product.price),
    variants: product.variants?.map((variant: any) => ({
      ...variant,
      price: formatPrice(variant.price)
    }))
  };
};

export const formatProducts = (products: any[]) => {
  return products.map(product => formatProduct(product));
};
