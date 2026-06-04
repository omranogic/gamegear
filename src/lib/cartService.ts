import { getSessionToken, setSessionToken, clearSessionToken } from './session';

export interface CartItem {
  id: string;
  productId: string;
  name: string;
  price: string;
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
export const fetchGraphQL = async (query: string, variables = {}) => {
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
  }

  return res.json();
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
    const { data, errors } = await fetchGraphQL(mutation, {
      input: {
        productId,
        quantity,
        clientMutationId: "add-to-cart",
      },
    });

    if (errors) {
      console.error('GraphQL Errors in addToWooCommerceCart:', JSON.stringify(errors, null, 2));
      return null;
    }

    return data?.addToCart?.cart || null;
  } catch (error) {
    console.error('Error adding to WooCommerce cart:', error);
    return null;
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
  const wooCart = await fetchWooCommerceCart();

  if (wooCart?.contents?.nodes) {
    const localItems: CartItem[] = wooCart.contents.nodes.map((node: {
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
    }) => ({
      id: node.key,
      productId: node.product.node.databaseId.toString(),
      name: node.product.node.name,
      price: node.product.node.price,
      quantity: node.quantity,
      slug: node.product.node.slug,
      image: node.product.node.image?.sourceUrl || '',
    }));

    saveLocalStorageCart(localItems);
    return localItems;
  }

  // If WooCommerce cart is empty, clear local storage to keep them in sync
  saveLocalStorageCart([]);
  return [];
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
