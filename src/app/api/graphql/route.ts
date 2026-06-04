// This is a proxy endpoint for GraphQL requests
// Browser calls this endpoint (same origin, no CORS issues)
// This endpoint calls WordPress backend with custom headers

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Get Cart-Token from cookies
    const cartToken = request.cookies.get('woocommerce-session')?.value;
    
    const apiUrl = 'https://wed.usewebs.com/gamegear/backend/graphql';

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Always add Cart-Token header (even if empty/undefined initially)
    if (cartToken) {
      headers['Cart-Token'] = cartToken;
      console.log('🔑 Sending existing Cart-Token:', cartToken.substring(0, 20) + '...');
    } else {
      console.log('⚠️ No Cart-Token found in cookies');
    }

    console.log('📤 Proxying GraphQL to:', apiUrl);

    // Make the request to WordPress
    const response = await fetch(apiUrl, {
      method: 'POST',
      headers,
      body: JSON.stringify(body),
    });

    const data = await response.json();

    // Always check for new token in response
    const newToken = response.headers.get('Cart-Token') || 
                     response.headers.get('woocommerce-session');
    
    const result = NextResponse.json(data, {
      status: response.status,
    });

    // Set/update token cookie if we got one
    if (newToken) {
      console.log('✅ New Cart-Token received from WordPress:', newToken.substring(0, 20) + '...');
      result.cookies.set('woocommerce-session', newToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60, // 7 days
        path: '/',
      });
      console.log('💾 Token stored in cookie');
    } else if (cartToken) {
      console.log('ℹ️ No new token from WordPress, keeping existing token');
      // Keep the existing token by re-setting it
      result.cookies.set('woocommerce-session', cartToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/',
      });
    }

    return result;
  } catch (error) {
    console.error('❌ GraphQL Proxy Error:', error);
    return NextResponse.json(
      { errors: [{ message: 'GraphQL proxy error: ' + (error as Error).message }] },
      { status: 500 }
    );
  }
}
