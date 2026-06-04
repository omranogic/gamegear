import { NextResponse } from 'next/server';

const WP_GRAPHQL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wed.usewebs.com/gamegear/backend/graphql';

export async function GET(req: Request) {
  try {
    const incomingCookies = req.headers.get('cookie') || '';
    const authHeader = req.headers.get('authorization') || '';

    return NextResponse.json({
      message: 'Session Debug Info',
      incomingCookies: incomingCookies ? incomingCookies.split(';').map(c => c.trim().split('=')[0]) : [],
      hasAuth: !!authHeader,
      authPrefix: authHeader ? authHeader.substring(0, 30) : 'NONE',
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { testQuery } = await req.json();

    const incomingCookies = req.headers.get('cookie') || '';
    const authHeader = req.headers.get('authorization') || '';

    const query = testQuery || `
      query TestCustomer {
        customer {
          id
          email
          firstName
          orders(first: 1) {
            nodes {
              databaseId
              orderNumber
            }
          }
        }
      }
    `;

    console.log('🧪 Debug Test Query');
    console.log('Cookies sent:', incomingCookies.split(';').map(c => c.trim().split('=')[0]));
    console.log('Has Auth header:', !!authHeader);

    const res = await fetch(WP_GRAPHQL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(authHeader ? { Authorization: authHeader } : {}),
        ...(incomingCookies ? { Cookie: incomingCookies } : {}),
      },
      body: JSON.stringify({ query }),
    });

    const data = await res.json();
    const wpSetCookies = res.headers.getSetCookie?.() || [];

    return NextResponse.json({
      message: 'Debug Query Result',
      requestDetails: {
        cookiesSent: incomingCookies.split(';').map(c => c.trim()).filter(c => c),
        hasAuthHeader: !!authHeader,
      },
      wordpressResponse: {
        hasErrors: !!data.errors,
        errors: data.errors,
        dataKeys: data.data ? Object.keys(data.data) : [],
        customer: data.data?.customer ? { id: data.data.customer.id, email: data.data.customer.email, orders: data.data.customer.orders?.nodes?.length } : null,
      },
      wordpressSetCookies: wpSetCookies.map(c => c.split(';')[0].split('=')[0]),
      timestamp: new Date().toISOString(),
    });
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
