/**
 * WooGraphQL Query Reference
 * 
 * Use these queries/mutations with the fetchGraphQL function or Apollo Client
 * The woocommerce-session header is automatically managed
 */

// ============================================================================
// 1. CART QUERIES
// ============================================================================

export const CART_QUERY = `
  query GetCart {
    cart {
      contents {
        nodes {
          key
          quantity
          total
          product {
            node {
              databaseId
              id
              name
              slug
              description
              ... on SimpleProduct {
                price
                regularPrice
                salePrice
              }
              ... on VariableProduct {
                price
                regularPrice
                salePrice
              }
              image {
                sourceUrl
                altText
              }
            }
          }
          variation {
            databaseId
            name
            attributes {
              nodes {
                name
                value
              }
            }
          }
        }
      }
      total
      subtotal
      shippingTotal
      shippingTax
      tax
      discountTotal
      discountTax
      feeLines {
        nodes {
          id
          name
          total
          taxStatus
        }
      }
    }
  }
`;

export const CART_ITEM_COUNT = `
  query GetCartItemCount {
    cart {
      contents {
        itemCount
        productCount
      }
    }
  }
`;

// ============================================================================
// 2. ADD TO CART MUTATIONS
// ============================================================================

export const ADD_TO_CART_MUTATION = `
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
      cartItem {
        key
        quantity
        total
        product {
          node {
            databaseId
            name
          }
        }
      }
    }
  }
`;

export const addToCartVariables = (productId: number, quantity: number) => ({
  input: {
    productId,
    quantity,
    extraData: "",
  },
});

// ============================================================================
// 3. UPDATE CART ITEM QUANTITY
// ============================================================================

export const UPDATE_CART_ITEM_QUANTITY = `
  mutation UpdateItemQuantity($input: UpdateItemQuantitiesInput!) {
    updateItemQuantities(input: $input) {
      cart {
        contents {
          nodes {
            key
            quantity
            total
            product {
              node {
                name
                price
              }
            }
          }
        }
        total
      }
      items {
        key
        quantity
        total
      }
    }
  }
`;

export const updateItemQuantityVariables = (cartKey: string, quantity: number) => ({
  input: {
    items: [
      {
        key: cartKey,
        quantity,
      },
    ],
  },
});

// ============================================================================
// 4. REMOVE FROM CART
// ============================================================================

export const REMOVE_FROM_CART_MUTATION = `
  mutation RemoveFromCart($input: RemoveFromCartInput!) {
    removeFromCart(input: $input) {
      cart {
        contents {
          nodes {
            key
            quantity
            product {
              node {
                name
                price
              }
            }
          }
        }
        total
      }
    }
  }
`;

export const removeFromCartVariables = (cartKey: string) => ({
  input: {
    keys: [cartKey],
  },
});

// ============================================================================
// 5. APPLY COUPON
// ============================================================================

export const APPLY_COUPON_MUTATION = `
  mutation ApplyCoupon($input: ApplyCouponInput!) {
    applyCoupon(input: $input) {
      applied {
        nodes {
          code
          discountAmount
          discountTax
        }
      }
      cart {
        contents {
          nodes {
            key
            quantity
            total
          }
        }
        total
        discountTotal
      }
    }
  }
`;

export const applyCouponVariables = (code: string) => ({
  input: { code },
});

// ============================================================================
// 6. REMOVE COUPON
// ============================================================================

export const REMOVE_COUPON_MUTATION = `
  mutation RemoveCoupon($input: RemoveCouponInput!) {
    removeCoupon(input: $input) {
      cart {
        contents {
          nodes {
            key
            quantity
            total
          }
        }
        total
        discountTotal
      }
    }
  }
`;

export const removeCouponVariables = (code: string) => ({
  input: { code },
});

// ============================================================================
// 7. CLEAR CART
// ============================================================================

export const CLEAR_CART_MUTATION = `
  mutation ClearCart($input: ClearCartInput!) {
    clearCart(input: $input) {
      deletedItems
      cart {
        contents {
          nodes {
            key
          }
        }
      }
    }
  }
`;

export const clearCartVariables = () => ({
  input: {},
});

// ============================================================================
// 8. CHECKOUT INITIALIZATION
// ============================================================================

export const CHECKOUT_MUTATION = `
  mutation Checkout($input: CheckoutInput!) {
    checkout(input: $input) {
      order {
        databaseId
        orderNumber
        status
        orderKey
        date
        total
        subtotal
        shippingTotal
        taxTotal
        customerNote
      }
      clientMutationId
      redirect
    }
  }
`;

export const checkoutVariables = (
  billing: BillingData,
  shipping?: ShippingData,
  paymentMethod?: string
) => ({
  input: {
    clientMutationId: "CheckoutMutation",
    billing,
    shipping,
    paymentMethod: paymentMethod || "cod",
    shipToDifferentAddress: !!shipping,
    isPaid: false,
  },
});

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

// ============================================================================
// 9. CUSTOMER QUERIES (Logged In Users)
// ============================================================================

export const CUSTOMER_QUERY = `
  query GetCustomer {
    customer {
      id
      databaseId
      email
      firstName
      lastName
      username
      billing {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
        email
        phone
      }
      shipping {
        firstName
        lastName
        company
        address1
        address2
        city
        state
        postcode
        country
      }
    }
  }
`;

export const CUSTOMER_ORDERS = `
  query GetCustomerOrders {
    customer {
      orders {
        nodes {
          databaseId
          orderNumber
          date
          status
          total
          lineItems {
            nodes {
              productId
              product {
                name
                slug
              }
              quantity
              total
            }
          }
        }
      }
    }
  }
`;

// ============================================================================
// 10. SHIPPING METHODS
// ============================================================================

export const SHIPPING_METHODS_QUERY = `
  query GetShippingMethods {
    cart {
      availableShippingMethods {
        nodes {
          packageDetails
          rates {
            label
            cost
            id
          }
        }
      }
    }
  }
`;

// ============================================================================
// EXAMPLE USAGE IN COMPONENTS
// ============================================================================

/*
// In your component:
import { fetchGraphQL } from '@/lib/apollo-client';
import { CART_QUERY, ADD_TO_CART_MUTATION, addToCartVariables } from '@/lib/graphql-queries';

// Get cart
const { data } = await fetchGraphQL(CART_QUERY);
console.log('Cart:', data.cart);

// Add to cart
const { data: addResult } = await fetchGraphQL(
  ADD_TO_CART_MUTATION,
  addToCartVariables(123, 1)
);

// Checkout
const { data: checkoutResult } = await fetchGraphQL(
  CHECKOUT_MUTATION,
  checkoutVariables({
    firstName: 'John',
    lastName: 'Doe',
    address1: '123 Main St',
    city: 'New York',
    state: 'NY',
    postcode: '10001',
    country: 'US',
    email: 'john@example.com',
    phone: '555-1234',
  })
);
*/
