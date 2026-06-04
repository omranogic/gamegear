import { NextResponse } from 'next/server';

const WP_GRAPHQL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wed.usewebs.com/gamegear/backend/graphql';

async function fetchWP(query: string, variables = {}, incomingCookies = '') {
  const res = await fetch(WP_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(incomingCookies ? { Cookie: incomingCookies } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });

  const sessionHeader = res.headers.get('woocommerce-session');
  const json = await res.json();
  return { json, sessionHeader };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const items = body.items || [];
    const incomingCookies = req.headers.get('cookie') || '';

    // If guest has no items, just return current backend cart
    if (!Array.isArray(items) || items.length === 0) {
      const cartQuery = `query GetCart { cart { contents { nodes { key quantity product { node { databaseId name price slug image { sourceUrl } } } } } total } }`;
      const { json, sessionHeader } = await fetchWP(cartQuery, {}, incomingCookies);
      const resp = NextResponse.json(json);
      if (sessionHeader) resp.headers.set('Set-Cookie', `woocommerce-session=${sessionHeader}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${7*24*60*60}`);
      return resp;
    }

    // Upload guest items to backend by calling addToCart for each
    const addMutation = `mutation AddToCart($input: AddToCartInput!) { addToCart(input: $input) { cart { contents { nodes { key quantity product { node { databaseId name price slug image { sourceUrl } } } } } total } } }`;

    let lastSession: string | null = null;

    for (const item of items) {
      const productId = parseInt(item.productId || item.id || 0, 10);
      const quantity = item.quantity || 1;
      if (!productId) continue;

      const { json, sessionHeader } = await fetchWP(addMutation, { input: { productId, quantity, clientMutationId: 'merge' } }, incomingCookies);
      if (sessionHeader) lastSession = sessionHeader;

      if (json.errors) {
        console.warn('Warning while merging item to cart:', json.errors);
      }
    }

    // After uploading, fetch merged cart
    const cartQuery = `query GetCart { cart { contents { nodes { key quantity product { node { databaseId name price slug image { sourceUrl } } } } } total } }`;
    const { json: mergedJson, sessionHeader } = await fetchWP(cartQuery, {}, incomingCookies);

    const response = NextResponse.json(mergedJson);
    const cookieToSet = sessionHeader || lastSession;
    if (cookieToSet) response.headers.set('Set-Cookie', `woocommerce-session=${cookieToSet}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${7*24*60*60}`);

    return response;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
