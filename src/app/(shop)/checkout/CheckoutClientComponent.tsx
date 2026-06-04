'use client';

import { useState, useEffect } from 'react';
import { syncLocalStorageToWooCommerce, getLocalStorageCart, clearFrontendCartData } from '@/lib/cartService';
import { fetchGraphQL } from '@/lib/apollo-client';
import { CHECKOUT_MUTATION, checkoutVariables } from '@/lib/graphql-queries';
import { useRouter } from 'next/navigation';

export default function CheckoutClientComponent() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [cartItems, setCartItems] = useState<any[]>([]);

  useEffect(() => {
    // Load local cart on mount
    setCartItems(getLocalStorageCart());
  }, []);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      // 1. Force a sync of local cart to WooCommerce before placing the order
      await syncLocalStorageToWooCommerce();

      // 2. Gather form data
      const formData = new FormData(e.currentTarget);
      const billingData = {
        firstName: formData.get('firstName') as string,
        lastName: formData.get('lastName') as string,
        address1: formData.get('address1') as string,
        city: formData.get('city') as string,
        state: formData.get('state') as string,
        postcode: formData.get('postcode') as string,
        country: formData.get('country') as string,
        email: formData.get('email') as string,
        phone: formData.get('phone') as string,
      };

      // 3. Execute the checkout mutation
      const { data, errors } = await fetchGraphQL(
        CHECKOUT_MUTATION,
        checkoutVariables(billingData)
      );

      if (errors && errors.length > 0) {
        throw new Error(errors[0].message);
      }

      if (data?.checkout?.order?.databaseId) {
        // 4. Success! Clear the local cart since order is placed
        clearFrontendCartData();
        alert(`Order placed successfully! WooCommerce Order ID: ${data.checkout.order.databaseId}`);
        router.push('/'); // Redirect back to home
      } else {
        throw new Error('Checkout failed. Please try again.');
      }
    } catch (err: any) {
      console.error('Checkout error:', err);
      setError(err.message || 'An unexpected error occurred during checkout.');
    } finally {
      setLoading(false);
    }
  };

  if (cartItems.length === 0) {
    return <div className="p-8 text-center text-white">Your cart is empty.</div>;
  }

  return (
    <div className="max-w-2xl mx-auto p-4 md:p-8 bg-gaming-card text-white rounded-lg mt-8">
      <h1 className="text-2xl font-bold mb-6 text-gaming-neon">Checkout</h1>
      
      {error && (
        <div className="bg-red-500/20 border border-red-500 text-red-500 p-3 rounded mb-6">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm mb-1">First Name</label>
            <input name="firstName" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" />
          </div>
          <div>
            <label className="block text-sm mb-1">Last Name</label>
            <input name="lastName" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" />
          </div>
        </div>

        {/* Add standard form fields */}
        <div><label className="block text-sm mb-1">Email</label><input name="email" type="email" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div>
        <div><label className="block text-sm mb-1">Phone</label><input name="phone" type="tel" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div>
        <div><label className="block text-sm mb-1">Address</label><input name="address1" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1">City</label><input name="city" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div><div><label className="block text-sm mb-1">State</label><input name="state" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div></div>
        <div className="grid grid-cols-2 gap-4"><div><label className="block text-sm mb-1">Postcode</label><input name="postcode" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" /></div><div><label className="block text-sm mb-1">Country</label><input name="country" type="text" required className="w-full bg-gaming-bg border border-gray-700 rounded p-2" defaultValue="IN" /></div></div>

        <button type="submit" disabled={loading} className="w-full bg-gaming-accent hover:bg-red-600 text-white font-bold py-3 rounded mt-6 transition-colors disabled:opacity-50">
          {loading ? 'Processing Order...' : 'Place Order'}
        </button>
      </form>
    </div>
  );
}