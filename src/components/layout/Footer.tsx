"use client";

import Link from "next/link";
import { Zap,  ArrowUpRight } from "lucide-react";
import { FaXTwitter, FaYoutube, FaTwitch, FaDiscord } from "react-icons/fa6";

export function Footer() {
  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-footer {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          border-top: 1px solid rgba(0, 255, 194, 0.1);
          position: relative;
          overflow: hidden;
          margin-top: 0;
        }

        .gg-footer::before {
          content: '';
          position: absolute;
          top: 0;
          left: 50%;
          transform: translateX(-50%);
          width: 800px;
          height: 1px;
          background: linear-gradient(90deg,
            transparent,
            rgba(0, 255, 194, 0.4) 30%,
            rgba(0, 184, 255, 0.4) 70%,
            transparent);
        }

        .gg-footer::after {
          content: '';
          position: absolute;
          bottom: -120px;
          right: -120px;
          width: 400px;
          height: 400px;
          background: radial-gradient(circle, rgba(0, 184, 255, 0.04) 0%, transparent 70%);
          pointer-events: none;
        }

        /* Marquee strip */
        .gg-footer-marquee {
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding: 12px 0;
          overflow: hidden;
          white-space: nowrap;
          background: rgba(0, 255, 194, 0.02);
        }

        .gg-marquee-inner {
          display: inline-block;
          animation: gg-marquee 24s linear infinite;
        }

        .gg-marquee-inner span {
          display: inline-block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.25em;
          text-transform: uppercase;
          color: rgba(0, 255, 194, 0.45);
          padding: 0 40px;
        }

        .gg-marquee-inner span::before {
          content: '✦';
          margin-right: 40px;
          color: rgba(0, 184, 255, 0.35);
        }

        @keyframes gg-marquee {
          from { transform: translateX(0); }
          to { transform: translateX(-50%); }
        }

        /* Main footer grid */
        .gg-footer-main {
          max-width: 1400px;
          margin: 0 auto;
          padding: 64px 24px 48px;
          display: grid;
          grid-template-columns: 1.8fr 1fr 1fr 1fr;
          gap: 48px;
        }

        /* Brand column */
        .gg-footer-brand {}

        .gg-footer-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          text-decoration: none;
          margin-bottom: 20px;
        }

        .gg-footer-logo-icon {
          width: 36px;
          height: 36px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          clip-path: polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%);
          display: flex;
          align-items: center;
          justify-content: center;
          color: #04060c;
          box-shadow: 0 0 24px rgba(0, 255, 194, 0.4);
          flex-shrink: 0;
        }

        .gg-footer-logo-text {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 22px;
          letter-spacing: 0.1em;
          color: #ffffff;
        }

        .gg-footer-logo-text span { color: #00ffc2; }

        .gg-footer-tagline {
          font-size: 13px;
          line-height: 1.7;
          color: rgba(255,255,255,0.35);
          margin-bottom: 28px;
          max-width: 280px;
        }

        /* Newsletter */
        .gg-newsletter-label {
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(0,255,194,0.6);
          margin-bottom: 12px;
        }

        .gg-newsletter-form {
          display: flex;
          gap: 0;
          border-radius: 8px;
          overflow: hidden;
          border: 1px solid rgba(255,255,255,0.1);
          transition: border-color 0.2s ease;
        }

        .gg-newsletter-form:focus-within {
          border-color: rgba(0,255,194,0.4);
          box-shadow: 0 0 20px rgba(0,255,194,0.08);
        }

        .gg-newsletter-input {
          flex: 1;
          background: rgba(255,255,255,0.04);
          border: none;
          outline: none;
          padding: 11px 16px;
          color: #fff;
          font-size: 13px;
          font-family: 'Exo 2', sans-serif;
          min-width: 0;
        }

        .gg-newsletter-input::placeholder { color: rgba(255,255,255,0.2); }

        .gg-newsletter-btn {
          padding: 11px 18px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          color: #04060c;
          font-weight: 800;
          font-size: 12px;
          letter-spacing: 0.08em;
          border: none;
          cursor: pointer;
          transition: opacity 0.2s ease;
          font-family: 'Exo 2', sans-serif;
          white-space: nowrap;
        }

        .gg-newsletter-btn:hover { opacity: 0.85; }

        /* Social icons */
        .gg-social-row {
          display: flex;
          gap: 8px;
          margin-top: 20px;
        }

        .gg-social-link {
          width: 38px;
          height: 38px;
          border-radius: 8px;
          border: 1px solid rgba(255,255,255,0.08);
          display: flex;
          align-items: center;
          justify-content: center;
          color: rgba(255,255,255,0.4);
          text-decoration: none;
          transition: all 0.2s ease;
          background: rgba(255,255,255,0.02);
        }

        .gg-social-link:hover {
          color: #00ffc2;
          border-color: rgba(0,255,194,0.35);
          background: rgba(0,255,194,0.06);
          transform: translateY(-2px);
        }

        /* Nav columns */
        .gg-footer-col-title {
          font-size: 11px;
          font-weight: 800;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: rgba(255,255,255,0.9);
          margin-bottom: 20px;
          padding-bottom: 12px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
        }

        .gg-footer-links {
          display: flex;
          flex-direction: column;
          gap: 10px;
        }

        .gg-footer-link {
          display: flex;
          align-items: center;
          justify-content: space-between;
          color: rgba(255,255,255,0.35);
          text-decoration: none;
          font-size: 13px;
          font-weight: 400;
          transition: all 0.2s ease;
          padding: 3px 0;
          group: true;
        }

        .gg-footer-link:hover {
          color: rgba(255,255,255,0.9);
          padding-left: 6px;
        }

        .gg-footer-link svg {
          opacity: 0;
          transition: opacity 0.2s ease;
          flex-shrink: 0;
        }

        .gg-footer-link:hover svg { opacity: 0.5; }

        /* Status badges */
        .gg-status-badge {
          font-size: 9px;
          font-weight: 800;
          padding: 2px 7px;
          border-radius: 100px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
        }

        .gg-status-new {
          background: rgba(0,255,194,0.12);
          color: #00ffc2;
          border: 1px solid rgba(0,255,194,0.25);
        }

        .gg-status-hot {
          background: rgba(255,59,107,0.12);
          color: #ff3b6b;
          border: 1px solid rgba(255,59,107,0.25);
        }

        /* Bottom bar */
        .gg-footer-bottom {
          max-width: 1400px;
          margin: 0 auto;
          padding: 20px 24px;
          border-top: 1px solid rgba(255,255,255,0.05);
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
        }

        .gg-footer-bottom-left {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
        }

        .gg-footer-bottom-left span {
          color: rgba(0,255,194,0.4);
        }

        .gg-footer-bottom-right {
          display: flex;
          gap: 24px;
        }

        .gg-footer-legal-link {
          font-size: 12px;
          color: rgba(255,255,255,0.2);
          text-decoration: none;
          transition: color 0.2s ease;
        }

        .gg-footer-legal-link:hover { color: rgba(255,255,255,0.6); }

        /* Payment icons strip */
        .gg-payment-row {
          display: flex;
          gap: 6px;
          margin-top: 16px;
          flex-wrap: wrap;
        }

        .gg-payment-tag {
          padding: 4px 10px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.06);
          border-radius: 4px;
          font-size: 10px;
          font-weight: 600;
          color: rgba(255,255,255,0.2);
          letter-spacing: 0.05em;
        }

        @media (max-width: 1024px) {
          .gg-footer-main {
            grid-template-columns: 1fr 1fr;
            gap: 40px;
          }
        }

        @media (max-width: 600px) {
          .gg-footer-main {
            grid-template-columns: 1fr;
            padding: 40px 16px 32px;
            gap: 32px;
          }
          .gg-footer-bottom {
            flex-direction: column;
            align-items: flex-start;
            gap: 12px;
          }
        }
      `}</style>

      <footer className="gg-footer">

        {/* Marquee */}
        <div className="gg-footer-marquee">
          <div className="gg-marquee-inner">
            {"Free Shipping on Orders Over ₹2999 · Pro Gaming Gear · Exclusive Deals · New Arrivals Weekly · Warranty Support · Fast Delivery Across India · Free Shipping on Orders Over ₹2999 · Pro Gaming Gear · Exclusive Deals · New Arrivals Weekly · Warranty Support · Fast Delivery Across India · ".repeat(2).split("·").map((text, i) => (
              <span key={i}>{text.trim() || "·"}</span>
            ))}
          </div>
        </div>

        {/* Main grid */}
        <div className="gg-footer-main">

          {/* Brand */}
          <div className="gg-footer-brand">
            <Link href="/" className="gg-footer-logo">
              <div className="gg-footer-logo-icon">
                <Zap size={17} strokeWidth={2.5} />
              </div>
              <div className="gg-footer-logo-text">GAME<span>GEAR</span></div>
            </Link>

            <p className="gg-footer-tagline">
              Premium gaming peripherals engineered for next-level performance. Trusted by 50,000+ gamers across India.
            </p>

            <div className="gg-newsletter-label">Subscribe to Newsletter</div>
            <div className="gg-newsletter-form">
              <input
                type="email"
                placeholder="your@email.com"
                className="gg-newsletter-input"
                suppressHydrationWarning
              />
              <button
                className="gg-newsletter-btn"
                suppressHydrationWarning
              >
                Subscribe
              </button>
            </div>

            <div className="gg-social-row">
              {[
                { icon: <FaXTwitter size={15} />, href: "#" },
                { icon: <FaYoutube size={15} />, href: "#" },
                { icon: <FaTwitch size={15} />, href: "#" },
                { icon: <FaDiscord size={15} />, href: "#" },
              ].map((s, i) => (
                <a key={i} href={s.href} className="gg-social-link">{s.icon}</a>
              ))}
            </div>

            <div className="gg-payment-row">
              {["UPI", "Visa", "Mastercard", "Razorpay", "COD"].map((p) => (
                <div key={p} className="gg-payment-tag">{p}</div>
              ))}
            </div>
          </div>

          {/* Shop */}
          <div>
            <div className="gg-footer-col-title">Shop</div>
            <div className="gg-footer-links">
              {[
                { label: "Keyboards", badge: null },
                { label: "Mice & Mousepads", badge: null },
                { label: "Headsets", badge: "HOT" },
                { label: "Controllers", badge: null },
                { label: "Monitors", badge: "NEW" },
                { label: "PC Accessories", badge: null },
                { label: "Bundle Deals", badge: "HOT" },
              ].map(({ label, badge }) => (
                <Link key={label} href="/shop" className="gg-footer-link">
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    {label}
                    {badge && (
                      <span className={`gg-status-badge ${badge === "NEW" ? "gg-status-new" : "gg-status-hot"}`}>
                        {badge}
                      </span>
                    )}
                  </span>
                  <ArrowUpRight size={12} />
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <div className="gg-footer-col-title">Account</div>
            <div className="gg-footer-links">
              {["My Orders", "Wishlist", "Track Shipment", "Return & Refund", "Loyalty Points", "Refer a Friend"].map((item) => (
                <Link key={item} href="/dashboard" className="gg-footer-link">
                  {item}
                  <ArrowUpRight size={12} />
                </Link>
              ))}
            </div>
          </div>

          {/* Support */}
          <div>
            <div className="gg-footer-col-title">Support</div>
            <div className="gg-footer-links">
              {["Help Center", "Contact Us", "Live Chat", "Warranty Policy", "Shipping Info", "Privacy Policy"].map((item) => (
                <Link key={item} href="/contact" className="gg-footer-link">
                  {item}
                  <ArrowUpRight size={12} />
                </Link>
              ))}
            </div>
          </div>

        </div>

        {/* Bottom bar */}
        <div className="gg-footer-bottom">
          <div className="gg-footer-bottom-left">
            © 2026 <span>GameGear</span>. All rights reserved. Designed for champions.
          </div>
          <div className="gg-footer-bottom-right">
            {["Privacy", "Terms", "Cookies", "Sitemap"].map((item) => (
              <a key={item} href="#" className="gg-footer-legal-link">{item}</a>
            ))}
          </div>
        </div>

      </footer>
    </>
  );
}
