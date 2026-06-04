import { NextResponse } from 'next/server';

const WP_GRAPHQL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://wed.usewebs.com/gamegear/backend/graphql';

export async function POST(req: Request) {
  try {
    const { query, variables, authToken } = await req.json();

    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    if (authToken) {
      headers['Authorization'] = `Bearer ${authToken}`;
    }

    const res = await fetch(WP_GRAPHQL, {
      method: 'POST',
      headers,
      body: JSON.stringify({ query, variables }),
    });

    const text = await res.text();
    let data: any;

    try {
      data = JSON.parse(text);
    } catch {
      return NextResponse.json(
        { error: 'Invalid JSON response', raw: text.substring(0, 500) },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (err) {
    return NextResponse.json({ error: String(err) }, { status: 500 });
  }
}
