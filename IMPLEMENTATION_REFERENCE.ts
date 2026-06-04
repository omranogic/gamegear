/**
 * COMPLETE HEADLESS WOOCOMMERCE + NEXT.JS INTEGRATION EXAMPLE
 * 
 * This file demonstrates the complete flow from product page to checkout
 * with proper WooCommerce session management and cart synchronization.
 */

// ============================================================================
// STEP 1: SESSION MANAGEMENT (src/lib/session.ts)
// ============================================================================

import Cookies from 'js-cookie';

export const SESSION_TOKEN = 'woocommerce-session';

export const getSessionToken = () => {
  if (typeof window === 'undefined') return null;
  return Cookies.get(SESSION_TOKEN);
};

export const setSessionToken = (token: string) => {
  if (typeof window === 'undefined') return;
  Cookies.set(SESSION_TOKEN, token, {
    expires: 7,
    sameSite: 'Lax',
    secure: process.env.NODE_ENV === 'production',
  });
};

// ============================================================================
// STEP 2: APOLLO CLIENT WITH SESSION SUPPORT (src/lib/apollo-client.ts)
// ============================================================================

import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";

const createHttpLink = () => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    fetch: async (uri, options) => {
      const token = getSessionToken();
      
      if (token) {
        options!.headers = {
          ...options!.headers,
          'woocommerce-session': token,
        };
      }

      const response = await fetch(uri, options);

      const sessionToken = response.headers.get('woocommerce-session');
      if (sessionToken) {
        setSessionToken(sessionToken);
      }

      return response;
    },
  });
};

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error(`[GraphQL error]: ${message}`);
    });
  }
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export const getClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, createHttpLink()]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: "no-cache" },
      watchQuery: { fetchPolicy: "no-cache" },
    },
  });
};

// ============================================================================
// STEP 3: CART SERVICE (src/lib/cartService.ts)
// ============================================================================

export const fetchGraphQL = async (query: string, variables = {}) => {
  const headers = { 'Content-Type': 'application/json' };
  const token = getSessionToken();
  
  if (token) headers['woocommerce-session'] = token;

  const res = await fetch(process.env.NEXT_PUBLIC_WORDPRESS_API_URL!, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const sessionToken = res.headers.get('woocommerce-session');
  if (sessionToken) setSessionToken(sessionToken);

  return res.json();
};

export const addToWooCommerceCart = async (productId: number, quantity: number) => {
  const mutation = `
    mutation AddToCart($productId: Int!, $quantity: Int!) {
      addToCart(input: { productId: $productId, quantity: $quantity }) {
        cart {
          contents {
            nodes {
              key
              quantity
              product {
                node {
                  databaseId
                  name
                  ... on SimpleProduct {
                    price
                  }
                  ... on VariableProduct {
                    price
                  }
                }
              }
            }
          }
          total
        }
      }
    }
  `;

  const { data, errors } = await fetchGraphQL(mutation, { productId, quantity });
  if (errors) throw new Error(errors[0]?.message);
  return data?.addToCart?.cart;
};

export const fetchWooCommerceCart = async () => {
  const query = `
    query GetCart {
      cart {
        contents {
          nodes {
            key
            quantity
            product {
              node {
                databaseId
                name
                slug
                ... on SimpleProduct {
                  price
                }
                ... on VariableProduct {
                  price
                }
              }
            }
          }
        }
        total
      }
    }
  `;

  const { data } = await fetchGraphQL(query);
  return data?.cart;
};

export const syncLocalStorageToWooCommerce = async () => {
  const localCart = JSON.parse(
    localStorage.getItem('gg_cart_data') || '[]'
  );

  for (const item of localCart) {
    try {
      await addToWooCommerceCart(
        parseInt(item.productId),
        item.quantity
      );
    } catch (error) {
      console.error(`Failed to sync ${item.name}:`, error);
    }
  }
};

// ============================================================================
// STEP 4: COMPLETE CHECKOUT FLOW
// ============================================================================

export async function completeCheckout({
  billingData,
  shippingData,
}: {
  billingData: BillingData;
  shippingData?: ShippingData;
}) {
  try {
    // Phase 1: Sync local cart with WooCommerce
    console.log('Phase 1: Syncing cart...');
    await syncLocalStorageToWooCommerce();
    
    // Wait for processing
    await new Promise(resolve => setTimeout(resolve, 1000));

    // Phase 2: Verify WooCommerce cart
    console.log('Phase 2: Verifying WooCommerce cart...');
    const wooCart = await fetchWooCommerceCart();
    
    if (!wooCart?.contents?.nodes?.length) {
      throw new Error('Cart is empty after sync');
    }

    console.log('WooCommerce cart verified:', wooCart);

    // Phase 3: Execute checkout
    console.log('Phase 3: Executing checkout...');
    const checkoutMutation = `
      mutation Checkout($input: CheckoutInput!) {
        checkout(input: $input) {
          order {
            databaseId
            orderNumber
            orderKey
            status
          }
          redirect
          result
        }
      }
    `;

    const { data, errors } = await fetchGraphQL(checkoutMutation, {
      input: {
        billing: billingData,
        shipping: shippingData,
        shipToDifferentAddress: !!shippingData,
      },
    });

    if (errors) throw new Error(errors[0]?.message);

    // Phase 4: Return checkout result
    console.log('Checkout successful');
    return {
      success: true,
      orderId: data?.checkout?.order?.databaseId,
      orderNumber: data?.checkout?.order?.orderNumber,
      redirect: data?.checkout?.redirect,
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Checkout failed',
    };
  }
}

// ============================================================================
// STEP 5: REACT COMPONENT USAGE
// ============================================================================

/*
// In src/app/(shop)/checkout/CheckoutForm.tsx
'use client';

import { useState } from 'react';
import { completeCheckout } from '@/lib/cartService';

export function CheckoutForm() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const formData = new FormData(e.currentTarget);

    const result = await completeCheckout({
      billingData: {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        address1: formData.get('address1') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postcode: formData.get('postcode') as string,
        country: formData.get('country') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
      },
    });

    setLoading(false);

    if (result.success) {
      console.log('Order created:', result.orderId);
      window.location.href = result.redirect || '/order-success';
    } else {
      setError(result.error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <input name="firstName" type="text" required />
      <input name="lastName" type="text" required />
      <input name="email" type="email" required />
      <input name="phone" type="tel" required />
      <input name="address1" type="text" required />
      <input name="city" type="text" required />
      <input name="state" type="text" required />
      <input name="postcode" type="text" required />
      <input name="country" type="text" required />
      
      {error && <div className="error">{error}</div>}
      
      <button type="submit" disabled={loading}>
        {loading ? 'Processing...' : 'Place Order'}
      </button>
    </form>
  );
}
*/

// ============================================================================
// STEP 6: DEBUGGING UTILITIES
// ============================================================================

export async function debugCart() {
  console.log('=== CART DEBUG INFO ===');
  
  // 1. Check session token
  const token = getSessionToken();
  console.log('Session Token:', token ? '✅ Present' : '❌ Missing');
  
  // 2. Check localStorage cart
  const localCart = JSON.parse(
    localStorage.getItem('gg_cart_data') || '[]'
  );
  console.log('LocalStorage Cart Items:', localCart.length);
  localCart.forEach(item => {
    console.log(`  - ${item.name}: ${item.quantity}x`);
  });
  
  // 3. Fetch WooCommerce cart
  try {
    const wooCart = await fetchWooCommerceCart();
    console.log('WooCommerce Cart Items:', wooCart?.contents?.nodes?.length || 0);
    wooCart?.contents?.nodes?.forEach((item: any) => {
      console.log(`  - ${item.product.name}: ${item.quantity}x`);
    });
  } catch (error) {
    console.error('Error fetching WooCommerce cart:', error);
  }
  
  console.log('=== END DEBUG ===');
}

// Usage: Call debugCart() from browser console to see current state
// window.__debugCart = debugCart;

// ============================================================================
// TYPES
// ============================================================================

interface BillingData {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  email: string;
  phone: string;
  company?: string;
}

interface ShippingData {
  firstName: string;
  lastName: string;
  address1: string;
  address2?: string;
  city: string;
  state: string;
  postcode: string;
  country: string;
  company?: string;
}
