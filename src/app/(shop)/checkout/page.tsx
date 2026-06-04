"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { getSessionToken } from "@/lib/session";
import { fetchGraphQL, clearWooCommerceCart, addToWooCommerceCart } from "@/lib/cartService";
import { CreditCard, Truck, ShieldCheck } from "lucide-react";

// Utility to load Razorpay SDK dynamically
const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) return resolve(true);
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

export default function CheckoutPage() {
  const { cart, cartTotal, clearCart } = useCart();
  const { isAuthenticated, token } = useAuth();
  const router = useRouter();

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"razorpay" | "cod">("razorpay");
  
  const [billingData, setBillingData] = useState({
    firstName: "", lastName: "", address1: "", city: "", state: "", postcode: "", phone: "", email: ""
  });

  useEffect(() => {
    if (!isAuthenticated) {
      router.push("/login?redirect=/checkout");
    }
  }, [isAuthenticated, router]);

  // Synchronize local React cart with the WooCommerce backend cart
  const syncServerCart = async () => {
    // 1. Clear backend cart first to prevent duplication
    await clearWooCommerceCart();

    // 2. Add all local items to the server cart
    for (const item of cart) {
      let numericId = 0;
      
      // Safely decode the Base64 product ID
      try {
        const decoded = atob(item.id);
        numericId = parseInt(decoded.split(':')[1]);
      } catch (e) {
        console.error("Error decoding base64 ID for item:", item);
      }
      
      if (numericId) {
        await addToWooCommerceCart(numericId, item.quantity);
      }
    }
  };

  // Reusable function to push the final order to WooCommerce
  const executeWooCommerceCheckout = async (method: string, note: string, isPaid: boolean) => {

    // Sync the cart before checking out
    await syncServerCart();
      
    // Execute the final checkout mutation
    const { data, errors } = await fetchGraphQL(`
      mutation ProcessCheckout($input: CheckoutInput!) {
        checkout(input: $input) {
          order {
            databaseId
          }
        }
      }
    `, {
      input: {
        billing: {
          firstName: billingData.firstName,
          lastName: billingData.lastName,
          address1: billingData.address1,
          city: billingData.city,
          state: billingData.state,
          postcode: billingData.postcode,
          country: "IN",
          email: billingData.email,
          phone: billingData.phone
        },
        isPaid: isPaid,
        paymentMethod: method,
        customerNote: note
      }
    });

    if (errors || !data?.checkout?.order) {
      throw new Error(errors?.[0]?.message || "WooCommerce transaction processing failed. Check your gateway IDs and state codes.");
    }

    return data.checkout.order.databaseId;
  };

  const processRazorpayPayment = async () => {
    const isLoaded = await loadRazorpayScript();
    if (!isLoaded) {
      throw new Error("Razorpay SDK failed to load. Please check your internet connection.");
    }

    const res = await fetch("/api/razorpay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: cartTotal }),
    });
    
    const data = await res.json();
    if (!data.success) throw new Error(data.error || "Failed to initialize payment gateway.");

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
      amount: data.order.amount,
      currency: data.order.currency,
      name: "GameGear",
      description: "Esports Hardware Order",
      order_id: data.order.id,
      prefill: {
        name: `${billingData.firstName} ${billingData.lastName}`,
        email: billingData.email,
        contact: billingData.phone,
      },
      theme: { color: "#00ffc2" },
      handler: async function (response: any) {
        try {
          setLoading(true);
          const paymentNote = `Razorpay TXN ID: ${response.razorpay_payment_id}`;
          const orderId = await executeWooCommerceCheckout("razorpay", paymentNote, true);
          
          clearCart();
          router.push(`/order-success?orderId=${orderId}`);
        } catch (err: any) {
          setError(err.message);
          setLoading(false);
        }
      },
      modal: {
        ondismiss: function () {
          setLoading(false);
          setError("Payment was cancelled by the user.");
        }
      }
    };

    const paymentObject = new (window as any).Razorpay(options);
    paymentObject.open();
  };

  const handleOrderSubmission = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (paymentMethod === "cod") {
        const orderId = await executeWooCommerceCheckout("cod", "Cash on Delivery Order", false);
        clearCart();
        router.push(`/order-success?orderId=${orderId}`);
      } else {
        await processRazorpayPayment();
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during processing.");
      setLoading(false);
    }
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@600;700&family=Exo+2:wght@400;500;600&display=swap');
        .gg-chk-wrapper { font-family: 'Exo 2', sans-serif; min-height: calc(100vh - 68px); background: #04060c; color: #fff; padding: 48px 24px; }
        .gg-chk-container { max-width: 1200px; margin: 0 auto; display: grid; grid-template-columns: 1fr 400px; gap: 40px; }
        .gg-chk-header { font-family: 'Rajdhani', sans-serif; font-size: 32px; font-weight: 700; text-transform: uppercase; margin-bottom: 32px; border-bottom: 1px solid rgba(255,255,255,0.1); padding-bottom: 16px; }
        .gg-form-card { background: rgba(255,255,255,0.01); border: 1px solid rgba(255,255,255,0.05); border-radius: 16px; padding: 32px; }
        .gg-form-section-title { font-family: 'Rajdhani', sans-serif; font-size: 20px; font-weight: 700; text-transform: uppercase; margin-bottom: 24px; color: #00ffc2; display: flex; align-items: center; gap: 10px; }
        .gg-grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        .gg-field { margin-bottom: 20px; }
        .gg-label { display: block; font-size: 11px; text-transform: uppercase; color: rgba(255,255,255,0.4); margin-bottom: 6px; font-weight: 600; }
        .gg-input { width: 100%; background: rgba(0,0,0,0.3); border: 1px solid rgba(255,255,255,0.1); border-radius: 6px; padding: 12px; color: #fff; font-size: 14px; }
        .gg-input:focus { outline: none; border-color: #00ffc2; }
        
        .gg-pm-box { border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.02); padding: 16px; border-radius: 8px; display: flex; align-items: center; gap: 12px; font-size: 14px; font-weight: 600; margin-bottom: 12px; cursor: pointer; transition: 0.2s; }
        .gg-pm-box:hover { border-color: rgba(0,255,194,0.3); }
        .gg-pm-box.active { border-color: #00ffc2; background: rgba(0,255,194,0.05); color: #00ffc2; }
        
        .gg-side-summary { background: rgba(255,255,255,0.02); border: 1px solid rgba(255,255,255,0.08); border-radius: 12px; padding: 24px; height: max-content; }
        .gg-submit-btn { width: 100%; padding: 16px; background: #00ffc2; color: #04060c; border: none; border-radius: 8px; font-weight: 700; font-size: 14px; text-transform: uppercase; cursor: pointer; margin-top: 24px; transition: all 0.2s; }
        .gg-submit-btn:hover { background: #00e6af; box-shadow: 0 4px 16px rgba(0,255,194,0.2); }
        .gg-submit-btn:disabled { background: #444; color: #888; cursor: not-allowed; box-shadow: none; }
        .gg-err { background: rgba(255,59,107,0.1); border: 1px solid rgba(255,59,107,0.2); color: #ff3b6b; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 20px; text-align: center; }
        @media (max-width: 980px) {
          .gg-chk-container { grid-template-columns: 1fr; gap: 24px; }
          .gg-chk-header { font-size: 28px; }
          .gg-form-card, .gg-side-summary { width: 100%; }
        }
        @media (max-width: 700px) {
          .gg-chk-wrapper { padding: 32px 16px 60px; }
          .gg-form-card { padding: 24px; }
          .gg-side-summary { padding: 20px; }
          .gg-form-section-title { font-size: 18px; gap: 8px; margin-bottom: 18px; }
          .gg-grid-2 { grid-template-columns: 1fr; gap: 16px; }
          .gg-input { font-size: 13px; padding: 12px; }
          .gg-pm-box { flex-direction: column; align-items: stretch; gap: 10px; }
          .gg-pm-box input { width: 24px; }
          .gg-submit-btn { padding: 14px; font-size: 13px; }
        }
        @media (max-width: 480px) {
          .gg-chk-wrapper { padding: 24px 12px 50px; }
          .gg-chk-header { font-size: 24px; }
          .gg-form-card { padding: 20px; }
          .gg-side-summary { padding: 18px; }
          .gg-label { font-size: 10px; }
          .gg-input { font-size: 13px; padding: 10px; }
          .gg-pm-box { padding: 14px; font-size: 13px; }
          .gg-submit-btn { padding: 14px; font-size: 13px; }
        }
      `}</style>

      <div className="gg-chk-wrapper">
        <div className="gg-chk-container">
          <form onSubmit={handleOrderSubmission} className="gg-form-card">
            <h1 className="gg-chk-header">Checkout</h1>
            {error && <div className="gg-err">{error}</div>}

            <h2 className="gg-form-section-title"><Truck size={20}/> Shipping Address</h2>
            <div className="gg-grid-2">
              <div className="gg-field">
                <label className="gg-label">First Name</label>
                <input type="text" required className="gg-input" value={billingData.firstName} onChange={e => setBillingData({...billingData, firstName: e.target.value})} />
              </div>
              <div className="gg-field">
                <label className="gg-label">Last Name</label>
                <input type="text" required className="gg-input" value={billingData.lastName} onChange={e => setBillingData({...billingData, lastName: e.target.value})} />
              </div>
            </div>

            <div className="gg-field">
              <label className="gg-label">Street Address</label>
              <input type="text" required className="gg-input" value={billingData.address1} onChange={e => setBillingData({...billingData, address1: e.target.value})} />
            </div>

            <div className="gg-grid-2">
              <div className="gg-field">
                <label className="gg-label">City</label>
                <input type="text" required className="gg-input" value={billingData.city} onChange={e => setBillingData({...billingData, city: e.target.value})} />
              </div>
              <div className="gg-field">
                <label className="gg-label">State/Province</label>
                <input type="text" required className="gg-input" value={billingData.state} onChange={e => setBillingData({...billingData, state: e.target.value})} />
              </div>
            </div>

            <div className="gg-grid-2">
              <div className="gg-field">
                <label className="gg-label">Postal Code</label>
                <input type="text" required className="gg-input" value={billingData.postcode} onChange={e => setBillingData({...billingData, postcode: e.target.value})} />
              </div>
              <div className="gg-field">
                <label className="gg-label">Phone Number</label>
                <input type="tel" required className="gg-input" value={billingData.phone} onChange={e => setBillingData({...billingData, phone: e.target.value})} />
              </div>
            </div>

            <div className="gg-field">
              <label className="gg-label">Email Address</label>
              <input type="email" required className="gg-input" value={billingData.email} onChange={e => setBillingData({...billingData, email: e.target.value})} />
            </div>

            <h2 className="gg-form-section-title mt-8"><CreditCard size={20}/> Payment Method</h2>
            
            <div 
              className={`gg-pm-box ${paymentMethod === 'razorpay' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('razorpay')}
            >
              <input type="radio" checked={paymentMethod === 'razorpay'} readOnly />
              <span>Online Payment (Razorpay)</span>
            </div>

            <div 
              className={`gg-pm-box ${paymentMethod === 'cod' ? 'active' : ''}`}
              onClick={() => setPaymentMethod('cod')}
            >
              <input type="radio" checked={paymentMethod === 'cod'} readOnly />
              <span>Cash on Delivery (COD)</span>
            </div>

            <button type="submit" disabled={loading || cart.length === 0} className="gg-submit-btn">
              {loading 
                ? "Processing..." 
                : paymentMethod === 'razorpay' 
                  ? "Proceed to Payment" 
                  : "Place Order"
              }
            </button>
          </form>

          <div className="gg-side-summary">
            <h3 className="font-['Rajdhani'] text-lg font-bold uppercase tracking-wider border-b border-white/10 pb-4 mb-4">Order Summary</h3>
            {cart.map(item => (
              <div key={item.id} className="flex justify-between items-center text-sm mb-3">
                <span className="text-gray-400 truncate max-width-[200px]">{item.name} <b className="text-[#00ffc2]">x{item.quantity}</b></span>
                <span>₹{(item.rawPrice * item.quantity).toFixed(2)}</span>
              </div>
            ))}
            <div className="border-t border-white/10 pt-4 mt-4 flex justify-between font-bold text-lg text-[#00ffc2]">
              <span>Final Total</span>
              <span>₹{cartTotal.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}