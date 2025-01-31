import { cookies } from 'next/headers';

// Function to get customer token from cookie on client side
export function getCustomerTokenFromCookie(): string | undefined {
  // Use js-cookie or document.cookie on client side
  if (typeof window !== 'undefined') {
    const match = document.cookie.match(/customer_token=([^;]+)/);
    return match ? match[1] : undefined;
  }
  return undefined;
}

// Function to check if customer is authenticated on client side
export function isCustomerAuthenticated(): boolean {
  return !!getCustomerTokenFromCookie();
}
