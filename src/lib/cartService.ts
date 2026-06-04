import { getSessionToken, setSessionToken, clearSessionToken } from './session';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
  rawPrice: number;
  quantity: number;
  slug: string;
  image?: string;
}

export interface WooCartItem {
  key: string;
  product: {
    databaseId: number;
    name: string;
    price: string;
  };
  quantity: number;
}

const CART_STORAGE_KEY = 'gg_cart_data';

// Dedicated GraphQL fetcher to ensure WooCommerce Sessions & User Auth are ALWAYS sent
export const fetchGraphQL = async (query: string, variables = {}, retryOnExpiredToken = true) => {
  const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || "https://wed.usewebs.com/gamegear/backend/graphql";
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // 1. Include WooCommerce Session Token (Guest/Active Cart)
  const sessionToken = getSessionToken();
  if (sessionToken) {
    headers['woocommerce-session'] = sessionToken;
  }

  // 2. Include User Auth Token (Saves cart permanently to WP account database)
  if (typeof window !== 'undefined') {
    const authToken = localStorage.getItem('gg_user_token');
    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }
  }

  const res = await fetch(endpoint, {
    method: 'POST',
    headers,
    body: JSON.stringify({ query, variables }),
  });

  const newSessionToken = res.headers.get('woocommerce-session');
  if (newSessionToken) {
    setSessionToken(newSessionToken);
    console.log("🔑 New WooCommerce session token received");
  }

  const jsonResponse = await res.json();

  // Log GraphQL errors for debugging
  if (jsonResponse.errors) {
    console.error("❌ GraphQL Error:", JSON.stringify(jsonResponse.errors, null, 2));
  }

  // Handle expired token error - retry with fresh session
  if (
    retryOnExpiredToken &&
    jsonResponse.errors &&
    jsonResponse.errors.some((error: any) => error.extensions?.debugMessage === 'Expired token')
  ) {
    console.warn('⏰ WooCommerce session token expired, clearing and retrying with fresh session...');
    clearSessionToken(); // Clear the expired token

    // Retry without the old token (this will create a new session)
    return fetchGraphQL(query, variables, false);
  }

  // Handle "no session" error by creating fresh session
  if (
    retryOnExpiredToken &&
    jsonResponse.errors &&
    jsonResponse.errors.some((error: any) => error.message?.includes('No session') || error.message?.includes('session'))
  ) {
    console.warn('⚠️ No valid WooCommerce session found, creating fresh session...');
    clearSessionToken(); // Clear to force new session creation
    
    // Retry with fresh session
    return fetchGraphQL(query, variables, false);
  }

  return jsonResponse;
};

// Fetch cart from WooCommerce
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
                image {
                  sourceUrl
                }
              }
            }
          }
        }
        total
      }
    }
  `;

  try {
    const { data, errors } = await fetchGraphQL(query);
    
    if (errors) {
      console.error('GraphQL Errors in fetchWooCommerceCart:', JSON.stringify(errors, null, 2));
      return null;
    }

    return data?.cart || null;
  } catch (error) {
    console.error('Error fetching WooCommerce cart:', error);
    return null;
  }
};

// Add item to WooCommerce cart
export const addToWooCommerceCart = async (productId: number, quantity: number) => {
  const mutation = `
    mutation AddToCart($input: AddToCartInput!) {
      addToCart(input: $input) {
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
    }
  `;

  try {
    console.log(`➕ Adding ${quantity} of product ${productId} to WooCommerce cart...`);
    const { data, errors } = await fetchGraphQL(mutation, {
      input: {
        productId,
        quantity,
        clientMutationId: "add-to-cart",
      },
    });

    if (errors) {
      console.error('❌ GraphQL Errors in addToWooCommerceCart:', JSON.stringify(errors, null, 2));
      throw new Error(errors[0]?.message || 'Failed to add item to cart');
    }

    console.log('✅ Item successfully added to WooCommerce cart');
    return data?.addToCart?.cart || null;
  } catch (error) {
    console.error('❌ Error adding to WooCommerce cart:', error);
    throw error; // Re-throw to let caller handle it
  }
};

// Remove item from WooCommerce cart
export const removeFromWooCommerceCart = async (cartKey: string) => {
  const mutation = `
    mutation RemoveFromCart($input: RemoveFromCartInput!) {
      removeFromCart(input: $input) {
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

  try {
    const { data, errors } = await fetchGraphQL(mutation, {
      input: {
        keys: [cartKey],
        clientMutationId: "remove-from-cart",
      },
    });

    if (errors) {
      console.error('GraphQL Errors in removeFromWooCommerceCart:', JSON.stringify(errors, null, 2));
      return null;
    }

    return data?.removeFromCart?.cart || null;
  } catch (error) {
    console.error('Error removing from WooCommerce cart:', error);
    return null;
  }
};

// Get localStorage cart
export const getLocalStorageCart = (): CartItem[] => {
  if (typeof window === 'undefined') return [];
  
  const cart = localStorage.getItem(CART_STORAGE_KEY);
  return cart ? JSON.parse(cart) : [];
};

// Save to localStorage
export const saveLocalStorageCart = (items: CartItem[]) => {
  if (typeof window === 'undefined') return;
  localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
};

// Sync localStorage cart to WooCommerce
export const syncLocalStorageToWooCommerce = async () => {
  const localCart = getLocalStorageCart();

  console.log('Starting cart sync. Local cart items:', localCart.length);

  for (const item of localCart) {
    try {
      console.log(`Syncing item: ${item.name} (qty: ${item.quantity})`);
      const result = await addToWooCommerceCart(
        parseInt(item.productId),
        item.quantity
      );

      if (!result) {
        console.error(`Failed to sync item: ${item.name}`);
      } else {
        console.log(`Successfully synced: ${item.name}`);
      }
    } catch (error) {
      console.error(`Error syncing item ${item.name}:`, error);
    }
  }

  console.log('Cart sync completed');
};

// Sync WooCommerce cart DOWN to localStorage (Run this on Login or Initial App Load)
export const syncWooCommerceToLocalStorage = async () => {
  console.log("📥 Fetching cart from WooCommerce backend...");
  const wooCart = await fetchWooCommerceCart();

  if (!wooCart) {
    console.warn("⚠️ No cart data returned from backend, keeping local cart unchanged");
    return getLocalStorageCart(); // Return existing local cart instead of clearing
  }

  if (wooCart?.contents?.nodes && wooCart.contents.nodes.length > 0) {
    console.log(`📦 Backend has ${wooCart.contents.nodes.length} items, syncing to local...`);
    
    const localItems = wooCart.contents.nodes.map((node: {
      key: string;
      quantity: number;
      product: {
        node: {
          databaseId: number;
          name: string;
          price: string;
          slug: string;
          image?: { sourceUrl: string };
        };
      };
    }) => {
      // Parse price string to get numeric value (e.g., "₹1,299" → 1299)
      const rawPrice = parseFloat(node.product.node.price?.replace(/[^0-9.-]+/g, "")) || 0;
      
      return {
        id: node.key,
        productId: node.product.node.databaseId.toString(),
        name: node.product.node.name,
        price: node.product.node.price,
        rawPrice: rawPrice,
        quantity: node.quantity,
        slug: node.product.node.slug,
        image: node.product.node.image?.sourceUrl || '',
      };
    });

    saveLocalStorageCart(localItems);
    console.log("✅ Cart synced from backend:", localItems.length, "items");
    return localItems;
  }

  console.log("ℹ️ Backend cart is empty, keeping local cart unchanged");
  // If WooCommerce cart is empty, DO NOT clear local storage
  // User might still be building cart
  return getLocalStorageCart();
};

// Clear all local cart data (Run this on Logout)
export const clearFrontendCartData = () => {
  saveLocalStorageCart([]);
  clearSessionToken();
};

// Clear WooCommerce cart
export const clearWooCommerceCart = async () => {
  const cart = await fetchWooCommerceCart();
  if (!cart?.contents?.nodes) return;

  for (const item of cart.contents.nodes) {
    await removeFromWooCommerceCart(item.key);
  }
};

// Get cart totals from WooCommerce
export const getCartTotal = async () => {
  const cart = await fetchWooCommerceCart();
  return cart?.total || '0';
};

// Get item count from WooCommerce
export const getCartItemCount = async () => {
  const cart = await fetchWooCommerceCart();
  const itemCount = cart?.contents?.nodes?.reduce(
    (sum: number, item: WooCartItem) => sum + item.quantity,
    0
  ) || 0;
  return itemCount;
};
