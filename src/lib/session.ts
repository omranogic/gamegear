// lib/session.ts
import Cookies from 'js-cookie';

export const SESSION_TOKEN = 'woocommerce-session';

export const getSessionToken = () => Cookies.get(SESSION_TOKEN);

export const setSessionToken = (token: string) => {
  Cookies.set(SESSION_TOKEN, token, { expires: 7, sameSite: 'Lax' });
};

export const clearSessionToken = () => {
  Cookies.remove(SESSION_TOKEN);
};