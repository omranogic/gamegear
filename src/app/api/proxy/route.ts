import { NextResponse } from 'next/server';

const WP_GRAPHQL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wed.usewebs.com/gamegear/backend/graphql';

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Forward incoming cookies (including any woocommerce-session) to WP
    const incomingCookies = req.headers.get('cookie') || '';

    // Forward Authorization header if present
    const auth = req.headers.get('authorization') || '';

    const res = await fetch(WP_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(auth ? { Authorization: auth } : {}),
        ...(incomingCookies ? { Cookie: incomingCookies } : {}),
      },
      body,
    });

    const data = await res.text();

    // If WP returned a woocommerce-session header, set it as an HttpOnly cookie
    const sessionHeader = res.headers.get('woocommerce-session');
    const response = NextResponse.json(JSON.parse(data || '{}'));

    if (sessionHeader) {
      // Set cookie for 7 days
      const maxAge = 7 * 24 * 60 * 60; // seconds
      const cookie = `woocommerce-session=${sessionHeader}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
      response.headers.set('Set-Cookie', cookie);
    }

    return response;
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
