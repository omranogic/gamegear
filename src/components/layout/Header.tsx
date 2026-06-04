"use client";

import Link from "next/link";
import { ShoppingCart, User, Zap, Menu, X, LogOut, LayoutDashboard } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext"; // 🌟 FIX 1: Import Cart context hooks

export function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  
  // Extract global authentication state parameters
  const { isAuthenticated, logout, loading } = useAuth();
  
  // 🌟 FIX 2: Pull real-time cart counts from global context
  const { cart } = useCart();
  
  // Calculate total count of items safely (accounting for item quantities)
  const totalCartItems = cart.reduce((total, item) => total + item.quantity, 0);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-header {
          position: sticky;
          top: 0;
          z-index: 100;
          font-family: 'Exo 2', sans-serif;
          transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
          background: ${scrolled
            ? "rgba(4, 6, 12, 0.92)"
            : "rgba(4, 6, 12, 0.6)"};
          backdrop-filter: blur(24px);
          border-bottom: 1px solid rgba(0, 255, 194, 0.12);
        }

        .gg-header::before {
          content: '';
          position: absolute;
          inset: 0;
          background: linear-gradient(90deg,
            transparent 0%,
            rgba(0, 255, 194, 0.03) 50%,
            transparent 100%);
          pointer-events: none;
        }

        .gg-header-inner {
          max-width: 1400px;
          margin: 0 auto;
          padding: 0 24px;
          height: 68px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 32px;
        }

        /* Logo */
        .gg-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          flex-shrink: 0;
        }

        .gg-logo-icon {
          width: 34px;
          height: 34px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #04060c;
          box-shadow: 0 0 20px rgba(0, 255, 194, 0.5);
          flex-shrink: 0;
        }

        .gg-logo-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.12em;
          color: #ffffff;
          line-height: 1;
        }

        .gg-logo-text span {
          color: #00ffc2;
        }

        .gg-logo-sub {
          font-size: 8px;
          letter-spacing: 0.3em;
          color: rgba(0, 255, 194, 0.6);
          display: block;
          margin-top: 2px;
          font-weight: 600;
        }

        /* Nav */
        .gg-nav {
          display: flex;
          align-items: center;
          gap: 4px;
          flex: 1;
          justify-content: center;
        }

        .gg-nav-link {
          position: relative;
          padding: 8px 16px;
          color: rgba(255, 255, 255, 0.55);
          text-decoration: none;
          font-size: 13px;
          font-weight: 600;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          transition: color 0.25s ease;
          border-radius: 4px;
        }

        .gg-nav-link::after {
          content: '';
          position: absolute;
          bottom: 4px;
          left: 50%;
          transform: translateX(-50%) scaleX(0);
          width: calc(100% - 24px);
          height: 1.5px;
          background: linear-gradient(90deg, #00ffc2, #00b8ff);
          transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
          box-shadow: 0 0 8px rgba(0, 255, 194, 0.8);
        }

        .gg-nav-link:hover {
          color: #ffffff;
        }

        .gg-nav-link:hover::after {
          transform: translateX(-50%) scaleX(1);
        }

        /* Actions */
        .gg-actions {
          display: flex;
          align-items: center;
          gap: 8px;
          flex-shrink: 0;
        }

        .gg-icon-btn {
          position: relative;
          width: 40px;
          height: 40px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255, 255, 255, 0.65);
          border-radius: 8px;
          border: 1px solid rgba(255, 255, 255, 0.08);
          text-decoration: none;
          transition: all 0.2s ease;
          background: rgba(255, 255, 255, 0.03);
          cursor: pointer;
        }

        .gg-icon-btn:hover {
          color: #00ffc2;
          border-color: rgba(0, 255, 194, 0.35);
          background: rgba(0, 255, 194, 0.06);
          box-shadow: 0 0 16px rgba(0, 255, 194, 0.15);
        }

        .gg-icon-btn.logout:hover {
          color: #ff3b6b;
          border-color: rgba(255, 59, 107, 0.35);
          background: rgba(255, 59, 107, 0.06);
          box-shadow: 0 0 16px rgba(255, 59, 107, 0.15);
        }

        .gg-cart-badge {
          position: absolute;
          top: -4px;
          right: -4px;
          background: linear-gradient(135deg, #ff3b6b, #ff6b3b);
          color: #fff;
          font-size: 9px;
          font-weight: 800;
          width: 17px;
          height: 17px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          border: 1.5px solid #04060c;
          letter-spacing: 0;
          box-shadow: 0 0 10px rgba(255, 59, 107, 0.5);
        }

        /* CTA button */
        .gg-cta {
          padding: 8px 20px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          color: #04060c;
          font-size: 12px;
          font-weight: 800;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.25s ease;
          box-shadow: 0 0 20px rgba(0, 255, 194, 0.25);
          white-space: nowrap;
        }

        .gg-cta:hover {
          box-shadow: 0 0 32px rgba(0, 255, 194, 0.5);
          transform: translateY(-1px);
        }

        /* Mobile menu */
        .gg-hamburger {
          display: none;
          width: 40px;
          height: 40px;
          align-items: center;
          justify-content: center;
          background: transparent;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          color: rgba(255,255,255,0.7);
          cursor: pointer;
          transition: all 0.2s ease;
        }

        .gg-hamburger:hover {
          border-color: rgba(0,255,194,0.4);
          color: #00ffc2;
        }

        .gg-mobile-nav {
          display: none;
          position: fixed;
          inset: 68px 0 0 0;
          background: rgba(4, 6, 12, 0.97);
          backdrop-filter: blur(32px);
          padding: 32px 24px;
          flex-direction: column;
          gap: 8px;
          border-top: 1px solid rgba(0,255,194,0.1);
          z-index: 99;
        }

        .gg-mobile-nav.open {
          display: flex;
        }

        .gg-mobile-link {
          padding: 16px 20px;
          color: rgba(255,255,255,0.6);
          text-decoration: none;
          font-size: 16px;
          font-weight: 600;
          letter-spacing: 0.12em;
          text-transform: uppercase;
          border-radius: 8px;
          border: 1px solid transparent;
          transition: all 0.2s ease;
        }

        .gg-mobile-link:hover {
          color: #00ffc2;
          border-color: rgba(0,255,194,0.2);
          background: rgba(0,255,194,0.04);
          padding-left: 28px;
        }

        .gg-mobile-actions {
          display: flex;
          gap: 12px;
          margin-top: 24px;
          padding-top: 24px;
          border-top: 1px solid rgba(255,255,255,0.07);
        }

        @media (max-width: 900px) {
          .gg-nav { display: none; }
          .gg-cta { display: none; }
          .gg-hamburger { display: flex; }
        }

        @media (max-width: 480px) {
          .gg-header-inner { padding: 0 16px; }
        }
      `}</style>

      <header className="gg-header">
        <div className="gg-header-inner">

          {/* Logo */}
          <Link href="/" className="gg-logo">
            <div className="gg-logo-icon">
              <Zap size={16} strokeWidth={2.5} />
            </div>
            <div>
              <div className="gg-logo-text">GAME<span>GEAR</span></div>
              <span className="gg-logo-sub">PRO SERIES 2026</span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="gg-nav">
            {["Home", "Shop",  "About", "Contact"].map((item) => (
              <Link
                key={item}
                href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
                className="gg-nav-link"
              >
                {item}
              </Link>
            ))}
          </nav>

          {/* Desktop Actions */}
          <div className="gg-actions">
            {!loading && isAuthenticated ? (
              <>
                {/* 🌟 FIX 3: Changed /account to /dashboard to bypass 404 pages */}
                <Link href="/dashboard" className="gg-icon-btn" title="Dashboard">
                  <LayoutDashboard size={18} strokeWidth={1.75} />
                </Link>
                <button onClick={logout} className="gg-icon-btn logout" title="Disconnect">
                  <LogOut size={18} strokeWidth={1.75} />
                </button>
              </>
            ) : (
              <Link href="/login" className="gg-icon-btn" title="Initialize Identity">
                <User size={18} strokeWidth={1.75} />
              </Link>
            )}
            
            <Link href="/cart" className="gg-icon-btn" title="Cart">
              <ShoppingCart size={18} strokeWidth={1.75} />
              {/* 🌟 FIX 4: Dynamically map real-time item counts */}
              {totalCartItems > 0 && (
                <span className="gg-cart-badge">{totalCartItems}</span>
              )}
            </Link>
            <Link href="/shop" className="gg-cta">
              Shop Now
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button
            className="gg-hamburger"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </header>

      {/* Mobile Nav */}
      <div className={`gg-mobile-nav ${menuOpen ? "open" : ""}`}>
        {["Home", "Shop", "Blog", "About", "Contact"].map((item) => (
          <Link
            key={item}
            href={item === "Home" ? "/" : `/${item.toLowerCase()}`}
            className="gg-mobile-link"
            onClick={() => setMenuOpen(false)}
          >
            {item}
          </Link>
        ))}
        <div className="gg-mobile-actions">
          {!loading && isAuthenticated ? (
            <>
              <Link href="/dashboard" className="gg-mobile-link flex items-center justify-center p-2 border border-white/10 rounded-lg" title="Dashboard" onClick={() => setMenuOpen(false)}>
                <LayoutDashboard size={18} />
              </Link>
              <button onClick={() => { logout(); setMenuOpen(false); }} className="gg-icon-btn logout" title="Disconnect">
                <LogOut size={18} />
              </button>
            </>
          ) : (
            <Link href="/login" className="gg-icon-btn" title="Initialize Identity" onClick={() => setMenuOpen(false)}>
              <User size={18} />
            </Link>
          )}
          
          <Link href="/cart" className="gg-icon-btn" title="Cart" onClick={() => setMenuOpen(false)}>
            <ShoppingCart size={18} />
            {/* 🌟 FIX 5: Dynamically map mobile count badge */}
            {totalCartItems > 0 && (
              <span className="gg-cart-badge">{totalCartItems}</span>
            )}
          </Link>
        </div>
      </div>
    </>
  );
}