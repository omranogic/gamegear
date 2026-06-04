"use client";

import { createContext, useContext, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { syncWooCommerceToLocalStorage } from "@/lib/cartService";

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
    localStorage.setItem("gg_user_token", jwtToken);
    localStorage.setItem("gg_user_profile", JSON.stringify(userProfile));
    setToken(jwtToken);
    setUser(userProfile);
    
    // 🔄 Sync cart from WooCommerce backend after login
    console.log("📦 User logged in, syncing cart from WooCommerce backend...");
    try {
      await syncWooCommerceToLocalStorage();
      console.log("✅ Cart synced from WooCommerce backend after login");
    } catch (error) {
      console.error("❌ Error syncing cart after login:", error);
      // Continue to dashboard even if sync fails
    }
    
    router.push("/dashboard");
  };

  const logout = () => {
    localStorage.removeItem("gg_user_token");
    localStorage.removeItem("gg_user_profile");
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