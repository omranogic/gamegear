"use client";

import { useState } from "react";
import { ShoppingCart, Check, Plus, Minus } from "lucide-react";
import { useCart } from "@/context/CartContext";
import { addToWooCommerceCart } from "@/lib/cartService";

interface AddToCartProps {
  product: {
    id: string;
    databaseId: string;
    name: string;
    price: string;
    slug: string;
    image?: {
      sourceUrl: string;
    };
  };
}

export default function AddToCartSection({ product }: AddToCartProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const [loading, setLoading] = useState(false);
  const { addToCart } = useCart();

  const increment = () => setQuantity((prev) => prev + 1);
  const decrement = () => setQuantity((prev) => (prev > 1 ? prev - 1 : 1));

  const handleAddToCart = async () => {
    setLoading(true);

    // Parse product ID
    let numericId;
    try {
      const decoded = atob(product.id);
      numericId = parseInt(decoded.split(':')[1]);
    } catch {  // Error decoding ID, using fallback
      numericId = parseInt(product.databaseId);
    }

    if (!numericId || isNaN(numericId)) {
      alert("Sorry, this product cannot be added right now. Please try again.");
      setLoading(false);
      return;
    }

    try {
      // Add to WooCommerce cart (includes session token handling)
      const wooResult = await addToWooCommerceCart(numericId, quantity);

      if (!wooResult) {
        alert("Failed to add to cart. Please try again.");
        setLoading(false);
        return;
      }

      // Update local cart state for immediate UI feedback
      const rawPrice = parseFloat(product.price?.replace(/[^0-9.-]+/g, "")) || 0;
      addToCart({
        id: product.id,
        name: product.name,
        price: product.price,
        rawPrice: rawPrice,
        image: product.image?.sourceUrl || "",
        slug: product.slug,
        quantity: quantity,
      });

      setAdded(true);
      setTimeout(() => setAdded(false), 2000);
    } catch (err) {
      console.error("Error adding to cart:", err);
      alert("Connection failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="gg-action-container">
      <div className="gg-qty-container">
        <button 
          type="button" 
          className="gg-qty-action-btn" 
          onClick={decrement}
          disabled={loading}
        >
          <Minus size={16} />
        </button>
        <div className="gg-qty-display-value">{quantity}</div>
        <button 
          type="button" 
          className="gg-qty-action-btn" 
          onClick={increment}
          disabled={loading}
        >
          <Plus size={16} />
        </button>
      </div>

      <button
        type="button"
        className="gg-add-cart-master-btn"
        onClick={handleAddToCart}
        disabled={added || loading}
      >
        {added ? (
          <>
            <Check size={18} /> <span>Added</span>
          </>
        ) : loading ? (
          <>
            <ShoppingCart size={18} /> <span>Adding...</span>
          </>
        ) : (
          <>
            <ShoppingCart size={18} /> <span>Add to Cart</span>
          </>
        )}
      </button>
    </div>
  );
}