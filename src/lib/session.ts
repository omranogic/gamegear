// lib/session.ts
import Cookies from 'js-cookie';

export const SESSION_TOKEN = 'woocommerce-session';

export const getSessionToken = () => Cookies.get(SESSION_TOKEN);

export const setSessionToken = (token: string) => {
  // Keep client-side token for compatibility (non-HttpOnly fallback)
  Cookies.set(SESSION_TOKEN, token, { expires: 7, sameSite: 'Lax' });
};

export const clearSessionToken = () => {
  Cookies.remove(SESSION_TOKEN);
  // Also request server to clear HttpOnly cookie (best-effort)
  if (typeof window !== 'undefined') {
    fetch('/api/session/clear', { method: 'POST', credentials: 'include' }).catch(() => {});
  }
};