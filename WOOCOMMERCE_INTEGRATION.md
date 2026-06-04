# Headless WooCommerce + Next.js Cart Integration Guide

## Overview

This guide explains how to properly synchronize a Next.js frontend cart (localStorage-based) with a WooCommerce backend (session-based) in a Headless WooCommerce setup using WPGraphQL + WooGraphQL.

---

## 1. WooGraphQL Session Management

### How Sessions Work

```
┌─────────────────┐
│  First Request  │
│  (No Token)     │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────┐
│  WooCommerce Server                 │
│  - Creates new session              │
│  - Returns header:                  │
│    woocommerce-session: <TOKEN>     │
└────────┬────────────────────────────┘
         │
         ▼
┌────────────────────────────┐
│  Frontend (Client)         │
│  - Receives token          │
│  - Stores in Cookie        │
│  - Sends back next request │
└────────────────────────────┘
         │
         ▼
┌──────────────────────────────────────┐
│  Subsequent Requests                 │
│  - Include header:                   │
│    woocommerce-session: <TOKEN>      │
│  - WooCommerce recognizes session    │
│  - Products added to same cart       │
└──────────────────────────────────────┘
```

### Key Points

- **Session is server-side**: WooCommerce maintains cart state on the server
- **Token = Session ID**: The `woocommerce-session` header identifies the user
- **Stateless frontend**: Each request must include the token, or WooCommerce treats it as a new user
- **Session duration**: Typically 48 hours before expiration

---

## 2. Architecture Overview

### Two Separate Systems

```
┌──────────────────────────┐
│   Next.js Frontend       │
│  ┌────────────────────┐  │
│  │  localStorage      │  │
│  │  (gg_cart_data)    │  │
│  │                    │  │
│  │  - Quick access    │  │
│  │  - Offline support │  │
│  │  - UI updates      │  │
│  └────────────────────┘  │
└──────────────────────────┘
         │
    Sync on checkout
         │
         ▼
┌──────────────────────────┐
│  WooCommerce Backend     │
│  ┌────────────────────┐  │
│  │  Server-side Cart  │  │
│  │  (Session-based)   │  │
│  │                    │  │
│  │  - Cart validation │  │
│  │  - Pricing calcs   │  │
│  │  - Inventory check │  │
│  │  - Checkout ready  │  │
│  └────────────────────┘  │
└──────────────────────────┘
```

### Flow

1. **Product Page**: Add to cart → Updates localStorage + WooCommerce simultaneously
2. **Cart Page**: Shows localStorage items + fetches WooCommerce total
3. **Checkout**: Syncs localStorage → WooCommerce → Processes order

---

## 3. Session Token Persistence

### Cookie Storage (Recommended)

**File**: `src/lib/session.ts`

```typescript
import Cookies from 'js-cookie';

export const SESSION_TOKEN = 'woocommerce-session';

export const getSessionToken = () => Cookies.get(SESSION_TOKEN);

export const setSessionToken = (token: string) => {
  Cookies.set(SESSION_TOKEN, token, {
    expires: 7,           // 7 days
    sameSite: 'Lax',      // CSRF protection
    secure: true,         // HTTPS only (production)
  });
};
```

### Why Cookies?

- ✅ Automatic inclusion in requests (some configurations)
- ✅ Survives page refreshes
- ✅ Isolated from localStorage (security)
- ✅ Configurable expiration

---

## 4. Sending Token with Every Request

### Custom Apollo Link

**File**: `src/lib/apollo-client.ts`

```typescript
import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { getSessionToken, setSessionToken } from "./session";

const createHttpLink = () => {
  return new HttpLink({
    uri: process.env.NEXT_PUBLIC_WORDPRESS_API_URL,
    fetch: async (uri, options) => {
      const token = getSessionToken();
      
      // Inject session token into request headers
      if (token) {
        options!.headers = {
          ...options!.headers,
          'woocommerce-session': token,
        };
      }

      const response = await fetch(uri, options);

      // Capture session token from response and persist it
      const sessionToken = response.headers.get('woocommerce-session');
      if (sessionToken) {
        setSessionToken(sessionToken);
      }

      return response;
    },
  });
};

export const getClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, createHttpLink()]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: { fetchPolicy: "no-cache" },
    },
  });
};
```

**What This Does:**

1. Before each GraphQL request, reads token from cookie
2. Adds token to request headers
3. After response, checks if new token was sent
4. Updates cookie with new token if present

---

## 5. Cart Synchronization Flow

### Before Checkout

```typescript
// 1. Get items from localStorage
const localCart = getLocalStorageCart();
// Output: [
//   { productId: "123", quantity: 2, name: "Wireless Mouse" },
//   { productId: "456", quantity: 1, name: "USB Cable" }
// ]

// 2. For each item, add to WooCommerce
for (const item of localCart) {
  await addToWooCommerceCart(item.productId, item.quantity);
}

// 3. WooCommerce cart now contains same items
// 4. Proceed to checkout with same session token
```

### GraphQL Mutations

**Add to Cart:**
```graphql
mutation AddToCart($productId: Int!, $quantity: Int!) {
  addToCart(input: { productId: $productId, quantity: $quantity }) {
    cart {
      contents {
        nodes {
          key
          quantity
          product {
            databaseId
            name
            price
          }
        }
      }
      total
    }
  }
}
```

**Get Cart:**
```graphql
query GetCart {
  cart {
    contents {
      nodes {
        key
        quantity
        product {
          databaseId
          name
          price
          slug
        }
      }
    }
    total
  }
}
```

---

## 6. Complete Checkout Flow

### Implementation

**File**: `src/app/(shop)/checkout/CheckoutClientComponent.tsx`

```typescript
const handleCheckout = async () => {
  try {
    // Step 1: Sync localStorage to WooCommerce
    await syncLocalStorageToWooCommerce();
    
    // Step 2: Verify cart exists
    const wooCart = await fetchWooCommerceCart();
    if (!wooCart?.contents?.nodes?.length) {
      throw new Error("Cart sync failed");
    }
    
    // Step 3: Initialize checkout
    const result = await initializeCheckout();
    
    // Step 4: Redirect to payment
    router.push(result.checkoutUrl);
  } catch (error) {
    setError(error.message);
  }
};
```

### Why This Works

1. **Token persistence**: Same session token used throughout
2. **Server validation**: WooCommerce validates cart on server
3. **Pricing accuracy**: WooCommerce calculates totals, taxes, shipping
4. **Inventory check**: WooCommerce confirms items still available
5. **Payment processing**: WooCommerce handles transactions

---

## 7. Handling Edge Cases

### Case 1: User Adds to Cart, Then Refreshes Page

```typescript
// On page load:
useEffect(() => {
  const syncCartOnLoad = async () => {
    const localCart = getLocalStorageCart();
    const wooCart = await fetchWooCommerceCart();
    
    // If localStorage has items but WooCommerce cart is empty:
    if (localCart.length > 0 && !wooCart?.contents?.nodes?.length) {
      // Sync them
      await syncLocalStorageToWooCommerce();
    }
  };
  
  syncCartOnLoad();
}, []);
```

### Case 2: Session Token Expires

```typescript
// In apollo-client.ts error handler:
const errorLink = onError(({ graphQLErrors, response }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      if (message.includes("session") || message.includes("not found")) {
        // Session expired, clear token and retry
        setSessionToken("");
        // User will get a new token on next request
      }
    });
  }
});
```

### Case 3: User Logs Out

```typescript
const handleLogout = () => {
  // Clear session token
  setSessionToken("");
  
  // Clear localStorage cart
  localStorage.removeItem("gg_cart_data");
  
  // Redirect to login
  router.push("/login");
};
```

---

## 8. Debugging Checklist

| Issue | Solution |
|-------|----------|
| WooCommerce cart stays empty | ✅ Verify token is stored in cookies<br>✅ Check `woocommerce-session` header in Network tab |
| "No session found" error | ✅ Token not being sent with request<br>✅ Check apollo-client.ts fetch hook |
| Different totals in cart vs checkout | ✅ WooCommerce cart not synced<br>✅ Run `syncLocalStorageToWooCommerce()` before checkout |
| Cart items disappear after refresh | ✅ Session token expired<br>✅ Check cookie expiration settings |
| Multiple carts appearing | ✅ New session created each request<br>✅ Verify token persistence |

---

## 9. Production Checklist

- [ ] Set `secure: true` in `setSessionToken()` for HTTPS
- [ ] Set appropriate `sameSite` policy based on domain structure
- [ ] Add error boundaries around cart operations
- [ ] Implement retry logic for failed syncs
- [ ] Monitor WooCommerce session errors in logging
- [ ] Test with multiple browser tabs
- [ ] Verify CORS headers allow `woocommerce-session`
- [ ] Set up monitoring for cart sync failures
- [ ] Document API response rate limits
- [ ] Test offline scenarios with localStorage fallback

---

## 10. Files Modified/Created

```
src/
├── lib/
│   ├── apollo-client.ts       (Updated - Session token handling)
│   ├── session.ts             (Existing - Cookie management)
│   └── cartService.ts         (New - Cart sync functions)
├── app/
│   └── (shop)/
│       ├── product/[slug]/
│       │   └── AddToCartSection.tsx  (Updated - Uses cartService)
│       └── checkout/
│           └── CheckoutClientComponent.tsx  (New - Checkout flow)
└── context/
    └── CartContext.tsx        (Existing - localStorage context)
```

---

## 11. Key Takeaways

1. **WooCommerce is the source of truth**: Always verify cart on server before checkout
2. **Session token is critical**: Must be persisted and sent with every request
3. **Two-cart system is intentional**: localStorage = fast UI, WooCommerce = validation
4. **Sync before checkout**: Ensures frontend and backend carts match
5. **Handle session expiration**: Gracefully recover when token expires

---

## References

- [WooGraphQL Documentation](https://github.com/wp-graphql/wp-graphql-woocommerce)
- [WPGraphQL Documentation](https://www.wpgraphql.com/)
- [Apollo Client Documentation](https://www.apollographql.com/docs/react/)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
