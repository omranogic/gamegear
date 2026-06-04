import { NextResponse } from 'next/server';

const WP_GRAPHQL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wed.usewebs.com/gamegear/backend/graphql';

async function forwardToWP(body: string, cookies: string, auth: string, attempt = 1): Promise<any> {
  const res = await fetch(WP_GRAPHQL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      ...(auth ? { Authorization: auth } : {}),
      ...(cookies ? { Cookie: cookies } : {}),
    },
    body,
  });

  const text = await res.text();
  let jsonData: any;
  try {
    jsonData = JSON.parse(text || '{}');
  } catch {
    return { error: 'Invalid JSON from server', status: 500 };
  }

  // Check if we got an "Expired token" error
  if (
    jsonData.errors &&
    Array.isArray(jsonData.errors) &&
    jsonData.errors.some((e: any) =>
      (e.extensions?.debugMessage || '').includes('Expired token') ||
      (e.message || '').includes('Expired token')
    )
  ) {
    console.warn('⏰ Detected expired token, retrying without session cookie...');

    // Retry without the old session cookie (force fresh session)
    if (attempt < 2) {
      // Remove woocommerce-session from cookies and retry
      const cleanedCookies = cookies
        .split(';')
        .map((c) => c.trim())
        .filter((c) => !c.startsWith('woocommerce-session='))
        .join('; ');

      return forwardToWP(body, cleanedCookies, auth, attempt + 1);
    }
  }

  // Capture all Set-Cookie headers from WP response
  const setCookieHeaders = res.headers.getSetCookie?.() || [];
  const sessionHeader = res.headers.get('woocommerce-session');
  
  console.log('📡 WP Response:', {
    status: res.status,
    hasSetCookieHeader: setCookieHeaders.length > 0,
    hasSessionHeader: !!sessionHeader,
    setCookies: setCookieHeaders.map(c => c.split(';')[0].split('=')[0]),
  });

  return { jsonData, sessionHeader, setCookieHeaders };
}

export async function POST(req: Request) {
  try {
    const body = await req.text();

    // Forward incoming cookies (including any woocommerce-session) to WP
    const incomingCookies = req.headers.get('cookie') || '';

    // Forward Authorization header if present
    const auth = req.headers.get('authorization') || '';

    const result = await forwardToWP(body, incomingCookies, auth);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: result.status || 500 });
    }

    const response = NextResponse.json(result.jsonData);

    // If WP returned a woocommerce-session header, set it as an HttpOnly cookie
    if (result.sessionHeader) {
      // Set cookie for 7 days, accessible across the domain
      const maxAge = 7 * 24 * 60 * 60; // seconds
      
      // For production (Vercel), don't restrict to subdomain - let browser handle it
      const cookie = `woocommerce-session=${result.sessionHeader}; Path=/; HttpOnly; SameSite=Lax; Secure; Max-Age=${maxAge}`;
      
      response.headers.set('Set-Cookie', cookie);
      console.log('🔐 Session cookie set from WP:', {
        hasSession: !!result.sessionHeader,
        cookieLength: result.sessionHeader?.length,
      });
    }

    // Also forward any other Set-Cookie headers from WordPress
    if (result.setCookieHeaders && result.setCookieHeaders.length > 0) {
      result.setCookieHeaders.forEach((setCookie: string) => {
        // Only forward non-session cookies to avoid conflicts
        if (!setCookie.includes('woocommerce-session')) {
          response.headers.append('Set-Cookie', setCookie);
          console.log('📌 Forwarded Set-Cookie:', setCookie.split(';')[0].split('=')[0]);
        }
      });
    }

    return response;
  } catch (err) {
    console.error('Proxy error:', err);
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
