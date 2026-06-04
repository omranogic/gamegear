import type { Metadata } from "next";
import "./globals.css";
import { ApolloWrapper } from "@/lib/apollo-wrapper";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext"; // 🌟 Import the Cart Provider

export const metadata: Metadata = {
  title: "GameGear | Premium Gaming Accessories",
  description: "Gaming Keyboards, Mice, Headsets, and Chairs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen flex flex-col bg-[var(--color-gaming-bg)] text-white">
        <AuthProvider>
          {/* 🌟 Wrap the application tree with the CartProvider */}
          <CartProvider>
            <ApolloWrapper>
              <Header />
              <main className="flex-grow">
                {children}
              </main>
              <Footer />
            </ApolloWrapper>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}