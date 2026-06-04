"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncWooCommerceToLocalStorage, syncLocalStorageToWooCommerce, clearFrontendCartData } from "@/lib/cartService";

interface UserProfile {
  username: string;
  email: string;
}

interface AuthContextType {
  isAuthenticated: boolean;
  user: UserProfile | null;
  token: string | null;
  login: (token: string, user: UserProfile) => void;
  logout: () => void;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Sync session on initialization mount
    const savedToken = localStorage.getItem("gg_user_token");
    const savedUser = localStorage.getItem("gg_user_profile");

    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
    }
    setLoading(false);
  }, []);

  const login = async (jwtToken: string, userProfile: UserProfile) => {
    console.log("🔐 Login initiated for user:", userProfile.email);
    
    // Store guest cart BEFORE login (if exists)
    const guestCart = localStorage.getItem("gg_cart_data");
    console.log("📋 Guest cart before login:", guestCart ? "exists" : "empty");

    // Save auth token and user profile
    localStorage.setItem("gg_user_token", jwtToken);
    localStorage.setItem("gg_user_profile", JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
    
    // 🔄 Merge guest cart with user's existing cart from backend
    console.log("📦 Merging guest cart with user's backend cart...");
    try {
      // 1. First, sync guest cart UP to backend (if guest had items)
      if (guestCart) {
        console.log("⬆️ Uploading guest cart to backend...");
        await syncLocalStorageToWooCommerce();
      }
      
      // 2. Then fetch the complete merged cart from backend
      const mergedCart = await syncWooCommerceToLocalStorage();
      console.log("✅ Cart merged and synced from backend:", mergedCart.length, "items");
    } catch (error) {
      console.error("❌ Error merging cart after login:", error);
      // Continue to dashboard even if sync fails
    }
    
    router.push("/dashboard");
  };

  const logout = () => {
    console.log("🚪 Logging out user...");
    localStorage.removeItem("gg_user_token");
    localStorage.removeItem("gg_user_profile");
    
    // 🔴 DO NOT clear guest cart data on logout
    // Guest can continue shopping with their local cart
    // Only clear WooCommerce session after intentional logout
    clearFrontendCartData();
    
    setToken(null);
    setUser(null);
    router.push("/login");
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated: !!token, user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be nested within an AuthProvider layer.");
  return context;
}