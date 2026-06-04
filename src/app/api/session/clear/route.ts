import { NextResponse } from 'next/server';

export async function POST() {
  const response = NextResponse.json({ ok: true });
  // Clear the HttpOnly cookie
  response.headers.set('Set-Cookie', 'woocommerce-session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0');
  return response;
}
