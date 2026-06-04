import { ApolloClient, InMemoryCache, HttpLink, ApolloLink } from "@apollo/client";
import { onError } from "@apollo/client/link/error";
import { getSessionToken, setSessionToken } from "./session";

// Custom fetch with session token handling
export const fetchGraphQL = async (query: string, variables = {}) => {
  // Use local API proxy (no CORS issues)
  const apiUrl = '/api/proxy';

  const headers: HeadersInit = { 'Content-Type': 'application/json' };

  try {
    console.log('📤 Calling GraphQL via proxy:', apiUrl);
    console.log('📋 Query:', query.substring(0, 50) + '...');
    
    const res = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
      credentials: 'include', // CRITICAL: Send cookies with every request
    });

    console.log('📊 Response status:', res.status);

    const result = await res.json();

    if (!res.ok) {
      console.error(`❌ HTTP Error: ${res.status} ${res.statusText}`);
      console.error('Response:', result);
      throw new Error(`HTTP ${res.status}: ${res.statusText}`);
    }

    if (result.errors) {
      console.error('❌ GraphQL Errors:', result.errors);
      // Return errors but don't throw - let caller handle it
      return { data: null, errors: result.errors };
    }

    console.log('✅ GraphQL Success');
    return { data: result.data, errors: null };
  } catch (error) {
    console.error('❌ GraphQL Fetch Error:', error);
    throw error;
  }
};

// Custom HTTP Link that injects session token
const createHttpLink = () => {
  const apiUrl = '/api/proxy';

  return new HttpLink({
    uri: apiUrl,
    credentials: 'include', // Include cookies if using them
    fetch: async (uri, options) => {
      const response = await fetch(uri, options);

      // Capture and store session token from response headers as a non-HttpOnly fallback
      const cartToken = response.headers.get('Cart-Token') || response.headers.get('woocommerce-session');
      if (cartToken) {
        setSessionToken(cartToken);
      }

      return response;
    },
  });
};

// Error handling link
const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors) {
    graphQLErrors.forEach(({ message }) => {
      console.error(`[GraphQL error]: Message: ${message}`);
    });
  }
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

export const getClient = () => {
  return new ApolloClient({
    link: ApolloLink.from([errorLink, createHttpLink()]),
    cache: new InMemoryCache(),
    defaultOptions: {
      query: {
        fetchPolicy: "no-cache",
      },
      watchQuery: {
        fetchPolicy: "no-cache",
      },
    },
  });
};