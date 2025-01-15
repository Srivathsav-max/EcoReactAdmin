import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export const formatPriceForClient = (price: any) => {
  if (!price) return formatter.format(0);
  
  const numericPrice = typeof price === 'object' && price.toNumber 
    ? price.toNumber() 
    : parseFloat(price);
    
  return !isNaN(numericPrice) ? formatter.format(numericPrice) : formatter.format(0);
};