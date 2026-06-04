"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { Trash2, ArrowRight, ShoppingCart, AlertCircle } from "lucide-react";

export default function CartPage() {
  const { cart, removeFromCart, updateQuantity, cartTotal, clearCart } = useCart();
  const { isAuthenticated } = useAuth();
  const router = useRouter();

  const handleCheckout = () => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    } else {
      router.push("/checkout");
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center bg-[#04060c] text-white px-4">
        <ShoppingCart size={48} className="text-gray-600 mb-6" />
        <h1 className="text-2xl font-bold font-['Rajdhani'] tracking-wider mb-2">Your Cart is Empty</h1>
        <p className="text-gray-400 text-sm mb-8">Add items to get started.</p>
        <Link href="/shop" className="px-6 py-3 bg-[#00ffc2] text-[#04060c] font-bold rounded-lg hover:bg-[#00e6af] transition-colors uppercase tracking-widest text-sm">
          Return to Shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Exo+2:wght@400;500;600&display=swap');
        .gg-cart-wrapper { font-family: 'Exo 2', sans-serif; min-height: calc(100vh - 68px); background: #04060c; padding: 48px 24px; color: #fff; }
        .gg-cart-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 380px; gap: 40px; }
        .gg-cart-header { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 24px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; }
        .gg-cart-item { display: grid; grid-template-columns: 100px 1fr auto auto; gap: 24px; align-items: center; padding: 24px 0; border-bottom: 1px solid rgba(255,255,255,0.05); }
        .gg-item-img { width: 100px; height: 100px; background: rgba(255,255,255,0.02); border-radius: 8px; border: 1px solid rgba(255,255,255,0.05); object-fit: contain; padding: 8px; }
        .gg-item-title { font-weight: 600; font-size: 16px; margin-bottom: 4px; color: #fff; text-decoration: none; display: block; }
        .gg-item-title:hover { color: #00ffc2; }
        .gg-item-price { color: rgba(255,255,255,0.6); font-size: 14px; }
        .gg-qty-box { display: flex; align-items: center; background: rgba(0,0,0,0.4); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; overflow: hidden; }
        .gg-qty-btn { width: 32px; height: 32px; display: flex; align-items: center; justify-content: center; background: transparent; border: none; color: #fff; cursor: pointer; }
        .gg-qty-btn:hover { background: rgba(255,255,255,0.1); }
        .gg-qty-val { width: 40px; text-align: center; font-size: 14px; font-weight: 600; border-left: 1px solid rgba(255,255,255,0.1); border-right: 1px solid rgba(255,255,255,0.1); }
        .gg-remove-btn { color: rgba(255,59,107,0.7); background: transparent; border: none; cursor: pointer; padding: 8px; border-radius: 6px; }
        .gg-remove-btn:hover { color: #ff3b6b; background: rgba(255,59,107,0.1); }
        .gg-summary-panel { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 32px; height: max-content; position: sticky; top: 100px; }
        .gg-summary-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; letter-spacing: 0.05em; }
        .gg-summary-row { display: flex; justify-content: space-between; margin-bottom: 16px; font-size: 14px; color: rgba(255,255,255,0.7); }
        .gg-summary-total { display: flex; justify-content: space-between; margin-top: 24px; padding-top: 24px; border-top: 1px solid rgba(255,255,255,0.1); font-size: 18px; font-weight: 700; color: #fff; }
        .gg-checkout-btn { width: 100%; display: flex; align-items: center; justify-content: center; gap: 8px; padding: 16px; background: #00ffc2; color: #04060c; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; letter-spacing: 0.1em; cursor: pointer; margin-top: 32px; transition: all 0.2s; }
        .gg-checkout-btn:hover { background: #00e6af; transform: translateY(-2px); box-shadow: 0 8px 24px rgba(0,255,194,0.2); }
        .gg-guest-warning { display: flex; gap: 12px; background: rgba(0,184,255,0.1); border: 1px solid rgba(0,184,255,0.2); padding: 16px; border-radius: 8px; margin-top: 24px; font-size: 12px; color: rgba(255,255,255,0.8); line-height: 1.5; }
        .gg-guest-warning svg { color: #00b8ff; flex-shrink: 0; }
        @media (max-width: 900px) {
          .gg-cart-container { grid-template-columns: 1fr; }
          .gg-cart-item { grid-template-columns: 80px minmax(0, 1fr) auto; gap: 16px; align-items: start; }
          .gg-remove-btn { justify-self: end; }
          .gg-summary-panel { position: static; top: auto; }
        }
        @media (max-width: 680px) {
          .gg-cart-wrapper { padding: 32px 16px; }
          .gg-cart-item { grid-template-columns: 72px minmax(0, 1fr); }
          .gg-item-img { width: 72px; height: 72px; }
          .gg-item-title { font-size: 14px; }
          .gg-item-price { font-size: 13px; }
          .gg-qty-box { width: 100%; justify-content: space-between; }
          .gg-qty-val { width: 36px; font-size: 13px; }
          .gg-summary-panel { padding: 24px; margin-top: 24px; }
        }
        @media (max-width: 480px) {
          .gg-cart-wrapper { padding: 24px 12px; }
          .gg-cart-header { font-size: 24px; }
          .gg-cart-item { grid-template-columns: 68px minmax(0, 1fr); }
          .gg-item-img { width: 68px; height: 68px; }
          .gg-qty-btn { width: 28px; height: 28px; }
          .gg-checkout-btn { padding: 14px; font-size: 13px; }
          .gg-summary-row, .gg-summary-total { font-size: 13px; }
          .gg-summary-panel { border-radius: 12px; }
        }
      `}</style>

      <div className="gg-cart-wrapper">
        <div className="gg-cart-container">
          <div>
            <h1 className="gg-cart-header">Shopping Cart</h1>
            <div className="gg-cart-list">
              {cart.map((item) => (
                <div key={item.id} className="gg-cart-item">
                  <img src={item.image} alt={item.name} className="gg-item-img" />
                  <div>
                    <Link href={`/product/${item.slug}`} className="gg-item-title">{item.name}</Link>
                    <div className="gg-item-price">₹{item.rawPrice.toFixed(2)}</div>
                  </div>
                  <div className="gg-qty-box">
                    <button className="gg-qty-btn" onClick={() => updateQuantity(item.id, item.quantity - 1)}>-</button>
                    <div className="gg-qty-val">{item.quantity}</div>
                    <button className="gg-qty-btn" onClick={() => updateQuantity(item.id, item.quantity + 1)}>+</button>
                  </div>
                  <button className="gg-remove-btn" onClick={() => removeFromCart(item.id)}>
                    <Trash2 size={18} />
                  </button>
                </div>
              ))}
            </div>
            <button onClick={clearCart} className="mt-8 text-xs uppercase tracking-widest text-red-400 hover:text-red-300">
              Clear Cart
            </button>
          </div>

          <div>
            <div className="gg-summary-panel">
              <h2 className="gg-summary-title">Order Summary</h2>
              <div className="gg-summary-row">
                <span>Subtotal</span>
                <span>₹{cartTotal.toFixed(2)}</span>
              </div>
              <div className="gg-summary-row">
                <span>Shipping</span>
                <span>Calculated at next step</span>
              </div>
              <div className="gg-summary-total">
                <span>Total Payload</span>
                <span className="text-[#00ffc2]">₹{cartTotal.toFixed(2)}</span>
              </div>
              <button className="gg-checkout-btn" onClick={handleCheckout}>
                Proceed to Checkout <ArrowRight size={18} />
              </button>
              {!isAuthenticated && (
                <div className="gg-guest-warning">
                  <AlertCircle size={16} />
                  <div><strong>Sign In Required.</strong> Please log in to your account to complete your purchase.</div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}