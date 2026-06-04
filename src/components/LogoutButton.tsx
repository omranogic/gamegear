'use client';

import { clearFrontendCartData } from '@/lib/cartService';

export default function LogoutButton() {
  const handleLogout = () => {
    // 1. Wipe the local cart and WooCommerce session
    clearFrontendCartData();
    
    // 2. Add your existing logout logic here (e.g. clearing user login auth tokens)
    // localStorage.removeItem('user_token');
    
    // 3. Force a hard reload so the UI resets completely and the empty cart is shown
    window.location.href = '/login'; 
  };

  return (
    <button onClick={handleLogout} className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded">
      Log Out
    </button>
  );
}