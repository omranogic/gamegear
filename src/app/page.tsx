import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Truck, ShieldCheck, Wrench, Trophy, Star, Zap } from "lucide-react";
import Image from "next/image";

// GraphQL query combining WooCommerce Products + all 5 ACF page settings
const GET_HOME_DATA = gql`
  query GetHomeACFData {
    page(id: "/", idType: URI) {
      homePageSettings {
        heroBanner {
          heroTitle
          heroSubtitle
          ctaButtonText
          ctaButtonLink
          heroBackground {
            node {
              sourceUrl
            }
          }
        }
        featuredCategories
        whyChooseUs {
          feature1 { title description icon }
          feature2 { title description icon }
          feature3 { title description icon }
          feature4 { title description icon }
        }
        testimonials {
          review1 { customerName rating reviewText }
          review2 { customerName rating reviewText }
          review3 { customerName rating reviewText }
        }
      }
    }
    products(first: 8) {
      nodes {
        id
        name
        slug
        ... on SimpleProduct {
          price
        }
        image {
          sourceUrl
          altText
        }
      }
    }
  }
`;

// Maps WordPress text values (e.g. "Truck") → Lucide React components
const iconMap: { [key: string]: React.ElementType } = {
  Truck, ShieldCheck, Wrench, Trophy, Zap,
};

// Category slug → display emoji map
const categoryIconMap: { [key: string]: string } = {
  "gaming-keyboard": "⌨️", "keyboards": "⌨️",
  "gaming-mouse": "🖱️", "mice": "🖱️",
  "headsets": "🎧", "headset": "🎧",
  "controllers": "🕹️", "controller": "🕹️",
  "monitors": "🖥️", "monitor": "🖥️",
  "chairs": "💺", "gaming-chair": "💺",
};

export default async function Home() {
  let data = null;
  let error = null;

  try {
    const client = getClient();
    const result = await client.query({ query: GET_HOME_DATA });
    data = result.data;
  } catch (err) {
    console.error("❌ GraphQL Error on home page:", err);
    error = err;
    // Continue rendering with fallback data
  }

  const acf = data?.page?.homePageSettings;
  const products = data?.products?.nodes || [];
  const hero = acf?.heroBanner;

  // 🌟 FIX: Aggressive URL extraction to catch multiple WPGraphQL return shapes
  // Sometimes ACF returns the URL directly as a string if configured improperly in WP.
  const heroImageUrl = 
    hero?.heroBackground?.node?.sourceUrl || 
    hero?.heroBackground?.sourceUrl || 
    (typeof hero?.heroBackground === 'string' ? hero?.heroBackground : "");

  let categoriesArray: string[] = ["Keyboards", "Mice", "Headsets", "Controllers", "Monitors", "Chairs"];
  
  if (acf?.featuredCategories) {
    if (Array.isArray(acf.featuredCategories)) {
      categoriesArray = acf.featuredCategories;
    } else if (typeof acf.featuredCategories === "string") {
      categoriesArray = acf.featuredCategories.split(",").map((c: string) => c.trim()).filter(Boolean);
    }
  }

  const features = acf?.whyChooseUs
    ? [acf.whyChooseUs.feature1, acf.whyChooseUs.feature2, acf.whyChooseUs.feature3, acf.whyChooseUs.feature4].filter(Boolean)
    : [];

  const reviews = acf?.testimonials
    ? [acf.testimonials.review1, acf.testimonials.review2, acf.testimonials.review3].filter(Boolean)
    : [];

  const renderIcon = (iconName: string) => {
    const IconComponent = iconMap[iconName] || Trophy;
    return <IconComponent size={22} strokeWidth={1.75} />;
  };

  const formatCategoryLabel = (slug: string) =>
    slug.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700;800&family=Exo+2:ital,wght@0,300;0,400;0,600;0,800;1,300&display=swap');

        *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

        .gg-page {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          color: #fff;
          min-height: 100vh;
          overflow-x: hidden;
        }

        /* ─── SHARED UTILITIES ──────────────────────── */
        .gg-section-label {
          display: block;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.3em;
          text-transform: uppercase;
          color: rgba(0, 255, 194, 0.65);
          margin-bottom: 8px;
        }
        .gg-section-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 4vw, 44px);
          line-height: 1.1;
          color: #fff;
          margin-bottom: 0;
        }
        .gg-section-header {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          margin-bottom: 48px;
          flex-wrap: wrap;
          gap: 16px;
        }
        .gg-view-all {
          font-size: 13px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          color: #00ffc2;
          text-decoration: none;
          border-bottom: 1px solid rgba(0, 255, 194, 0.3);
          padding-bottom: 4px;
          transition: all 0.2s ease;
          white-space: nowrap;
        }
        .gg-view-all:hover { border-color: #00ffc2; text-shadow: 0 0 10px rgba(0,255,194,0.5); }

        /* ─── HERO ──────────────────────────────────── */
        .gg-hero {
          position: relative;
          min-height: 90vh;
          display: flex;
          align-items: center;
          overflow: hidden;
          padding: 80px 24px;
        }
        .gg-hero-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,194,0.04) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,194,0.04) 1px, transparent 1px);
          background-size: 60px 60px;
          mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
          -webkit-mask-image: radial-gradient(ellipse 80% 80% at 50% 50%, black 30%, transparent 100%);
        }
        .gg-hero-inner {
          position: relative; z-index: 2;
          max-width: 1400px; margin: 0 auto; width: 100%;
          display: grid; grid-template-columns: 1fr 1fr;
          gap: 80px; align-items: center;
        }
        .gg-hero-eyebrow {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 11px; font-weight: 700; letter-spacing: 0.3em;
          text-transform: uppercase; color: #00ffc2;
          margin-bottom: 24px; padding: 6px 16px;
          border: 1px solid rgba(0,255,194,0.25); border-radius: 100px;
          background: rgba(0,255,194,0.05);
        }
        .gg-hero-h1 {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 800;
          font-size: clamp(48px, 6vw, 84px);
          line-height: 0.95;
          letter-spacing: 0.02em;
          margin-bottom: 24px;
          text-transform: uppercase;
        }
        .gg-hero-h1 .glow-text {
          background: linear-gradient(90deg, #00ffc2 0%, #00b8ff 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
          background-clip: text;
          display: inline-block;
        }
        .gg-btn-cyber {
          display: inline-flex;
          align-items: center;
          gap: 12px;
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          color: #04060c;
          padding: 18px 40px;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 800;
          font-size: 16px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          border-radius: 6px;
          text-decoration: none;
          transition: all 0.3s ease;
          box-shadow: 0 0 20px rgba(0, 255, 194, 0.4);
        }
        .gg-btn-cyber:hover {
          box-shadow: 0 0 40px rgba(0, 255, 194, 0.6);
          transform: translateY(-2px);
        }
        .gg-hero-image-wrapper {
          position: relative;
          z-index: 10;
          border-radius: 16px;
          padding: 4px;
          background: linear-gradient(135deg, rgba(0,255,194,0.3), rgba(0,184,255,0.1));
          box-shadow: 0 0 50px rgba(0, 255, 194, 0.15);
        }

        /* ─── CATEGORIES ────────────────────────────── */
        .gg-categories-section { padding: 80px 24px; max-width: 1400px; margin: 0 auto; }
        .gg-categories-grid {
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
          gap: 20px;
        }
        .gg-cat-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px; padding: 32px 16px;
          text-decoration: none; display: flex; flex-direction: column; align-items: center; gap: 16px;
          transition: all 0.3s ease; text-align: center;
        }
        .gg-cat-card:hover {
          background: rgba(0,255,194,0.03);
          border-color: rgba(0,255,194,0.3);
          transform: translateY(-4px);
        }
        .gg-cat-icon { font-size: 36px; line-height: 1; }
        .gg-cat-name {
          font-size: 12px; font-weight: 700; letter-spacing: 0.15em;
          text-transform: uppercase; color: rgba(255,255,255,0.7);
          transition: color 0.2s;
        }
        .gg-cat-card:hover .gg-cat-name { color: #00ffc2; }

        /* ─── PRODUCTS ──────────────────────────────── */
        .gg-products-section { padding: 40px 24px 80px; max-width: 1400px; margin: 0 auto; }
        .gg-products-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .gg-product-card {
          background: #0a0e1a;
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; overflow: hidden;
          transition: all 0.3s ease;
          position: relative; display: flex; flex-direction: column; text-decoration: none;
        }
        .gg-product-card:hover {
          border-color: rgba(0,255,194,0.3);
          transform: translateY(-6px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.4), 0 0 20px rgba(0,255,194,0.05);
        }
        .gg-product-img-wrap {
          width: 100%; aspect-ratio: 1;
          background: radial-gradient(circle at center, rgba(255,255,255,0.05) 0%, transparent 70%);
          display: flex; align-items: center; justify-content: center;
          padding: 24px;
        }
        .gg-product-img-wrap img {
          width: 100%; height: 100%; object-fit: contain;
          transition: transform 0.5s ease;
        }
        .gg-product-card:hover .gg-product-img-wrap img { transform: scale(1.08); }
        .gg-product-info { padding: 20px 24px 24px; display: flex; flex-direction: column; flex-grow: 1; }
        .gg-product-name {
          font-size: 15px; font-weight: 600; color: #fff;
          margin-bottom: 16px; white-space: nowrap;
          overflow: hidden; text-overflow: ellipsis;
        }
        
        /* 🌟 FIX: Premium "View Details" Button Styling */
        .gg-product-btn-view {
          font-size: 10px; font-weight: 800; text-transform: uppercase;
          letter-spacing: 0.15em; padding: 8px 16px;
          border: 1px solid rgba(0, 255, 194, 0.3);
          color: #00ffc2; background: rgba(0, 255, 194, 0.05);
          border-radius: 4px; transition: all 0.3s ease;
        }
        .gg-product-card:hover .gg-product-btn-view {
          background: #00ffc2; color: #04060c;
          box-shadow: 0 0 15px rgba(0, 255, 194, 0.4);
        }

        /* ─── WHY CHOOSE US ─────────────────────────── */
        .gg-why-section {
          background: rgba(255,255,255,0.01);
          border-top: 1px solid rgba(255,255,255,0.04);
          border-bottom: 1px solid rgba(255,255,255,0.04);
          padding: 100px 24px;
        }
        .gg-why-inner { max-width: 1400px; margin: 0 auto; }
        .gg-why-header { text-align: center; margin-bottom: 64px; }
        .gg-features-grid {
          display: grid; grid-template-columns: repeat(4, 1fr); gap: 24px;
        }
        .gg-feature-card {
          background: rgba(255, 255, 255, 0.02);
          border: 1px solid rgba(255, 255, 255, 0.05);
          padding: 40px 32px;
          border-radius: 16px;
          transition: all 0.3s ease;
          display: flex; flex-direction: column; align-items: flex-start;
        }
        .gg-feature-card:hover {
          border-color: #00ffc2;
          background: rgba(0, 255, 194, 0.02);
          transform: translateY(-5px);
        }
        .gg-feature-icon-box {
          width: 56px; height: 56px;
          background: rgba(0,255,194,0.08);
          border: 1px solid rgba(0,255,194,0.2);
          border-radius: 12px; display: flex; align-items: center; justify-content: center;
          margin-bottom: 24px; color: #00ffc2;
        }
        .gg-feature-title { font-family: 'Rajdhani', sans-serif; font-weight: 700; font-size: 20px; letter-spacing: 0.05em; margin-bottom: 12px; color: #fff; }
        .gg-feature-desc { font-size: 14px; color: rgba(255,255,255,0.4); line-height: 1.7; font-weight: 400; }

        /* ─── TESTIMONIALS ──────────────────────────── */
        .gg-reviews-section { padding: 100px 24px; max-width: 1400px; margin: 0 auto; }
        .gg-reviews-header { text-align: center; margin-bottom: 64px; }
        .gg-reviews-grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 32px; }
        .gg-review-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px; padding: 40px;
          transition: all 0.3s ease;
        }
        .gg-review-card:hover { border-color: rgba(0,255,194,0.2); transform: translateY(-4px); }
        .gg-review-stars { display: flex; gap: 4px; margin-bottom: 20px; }
        .gg-review-text { font-size: 15px; color: rgba(255,255,255,0.6); font-style: italic; line-height: 1.8; margin-bottom: 32px; }
        .gg-review-author-row { display: flex; align-items: center; gap: 16px; }
        .gg-review-avatar {
          width: 44px; height: 44px; border-radius: 50%;
          background: linear-gradient(135deg, rgba(0,255,194,0.2), rgba(0,184,255,0.15));
          border: 1px solid rgba(0,255,194,0.3);
          display: flex; align-items: center; justify-content: center;
          font-size: 16px; font-weight: 800; color: #00ffc2; font-family: 'Rajdhani', sans-serif;
        }
        .gg-review-name { font-size: 13px; font-weight: 700; letter-spacing: 0.12em; text-transform: uppercase; color: #fff; }
        .gg-review-verified { font-size: 11px; color: rgba(0,255,194,0.6); letter-spacing: 0.05em; margin-top: 4px; }

        /* ─── RESPONSIVE ────────────────────────────── */
        @media (max-width: 1200px) {
          .gg-products-grid { grid-template-columns: repeat(3, 1fr); }
          .gg-features-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 900px) {
          .gg-hero-inner { grid-template-columns: 1fr; gap: 40px; text-align: center; }
          .gg-hero-eyebrow { margin: 0 auto 24px; }
          .gg-hero-desc { margin: 0 auto 40px; }
          .gg-hero-actions { justify-content: center; }
          .gg-products-grid { grid-template-columns: repeat(2, 1fr); }
          .gg-reviews-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .gg-products-grid { grid-template-columns: 1fr; }
          .gg-reviews-grid { grid-template-columns: 1fr; }
          .gg-features-grid { grid-template-columns: 1fr; }
          .gg-categories-grid { grid-template-columns: repeat(2, 1fr); }
        }
      `}</style>

      <div className="gg-page">
        {/* ── SECTION 1: HERO BANNER ──────────────── */}
        <section className="gg-hero">
          <div className="gg-hero-grid" />
          <div className="gg-hero-inner grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-8 items-center max-w-[1400px] mx-auto px-6 relative z-10">
            
            <div className="max-w-xl">
              <div className="gg-hero-eyebrow">Esports Hardware - 2026</div>
              <h1 className="gg-hero-h1">
                {hero?.heroTitle ? (
                  <span dangerouslySetInnerHTML={{ __html: hero.heroTitle }} />
                ) : (
                  <><span className="text-white block">Level Up</span><span className="glow-text block mt-2">Your Setup</span></>
                )}
              </h1>
              <p className="text-lg text-gray-400 font-light leading-relaxed mb-10 max-w-md">
                {hero?.heroSubtitle || "Premium gaming peripherals engineered for peak performance. Every millisecond matters. Gear that keeps up."}
              </p>
              <div className="gg-hero-actions pt-2">
                <a href={hero?.ctaButtonLink || "/shop"} className="gg-btn-cyber">
                  {hero?.ctaButtonText || "Shop Gear"}
                  <Zap size={20} fill="currentColor" />
                </a>
              </div>
            </div>

            <div className="relative flex justify-center lg:justify-end w-full">
              <div className="gg-hero-image-wrapper w-full max-w-2xl">
                {heroImageUrl ? (
                  <Image src={heroImageUrl} alt="Hero Background Gear" priority width={800} height={450} className="w-full h-auto object-cover rounded-xl border border-white/10 relative z-10" />
                ) : (
                  <div className="w-full h-[450px] bg-[#0a0e1a] rounded-xl border border-dashed border-[#00ffc2]/30 flex flex-col items-center justify-center relative z-10">
                    <span className="text-6xl mb-4">🎮</span>
                    <span className="text-[#00ffc2]/50 text-xs font-mono uppercase tracking-widest">Loading Product Image...</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* ── SECTION 2: FEATURED CATEGORIES ─ */}
        <section className="gg-categories-section">
          <div className="gg-section-header">
            <div>
              <span className="gg-section-label">Featured Categories</span>
              <h2 className="gg-section-title">Shop by Category</h2>
            </div>
          </div>
          <div className="gg-categories-grid">
            {categoriesArray.map((slug) => {
              const icon = categoryIconMap[slug.toLowerCase()] || "⚡";
              const label = formatCategoryLabel(slug);
              return (
                <a key={slug} href={`/shop?category=${encodeURIComponent(slug.toLowerCase())}`} className="gg-cat-card">
                  <span className="gg-cat-icon">{icon}</span>
                  <span className="gg-cat-name">{label}</span>
                </a>
              );
            })}
          </div>
        </section>

        {/* ── SECTION 3: FEATURED PRODUCTS ────── */}
        <section className="gg-products-section">
          <div className="gg-section-header">
            <div>
              <span className="gg-section-label">Premium Selection</span>
              <h2 className="gg-section-title">Featured Products</h2>
            </div>
            <a href="/shop" className="gg-view-all">View All →</a>
          </div>

          <div className="gg-products-grid">
            {products.map((product: { id: string; slug: string; name: string; price?: string; image?: { sourceUrl?: string } }) => (
              <a key={product.id} href={`/product/${product.slug}`} className="gg-product-card">
                <div className="gg-product-img-wrap">
                  {product.image?.sourceUrl ? (
                    <Image src={product.image.sourceUrl} alt={product.name} width={300} height={300} />
                  ) : (
                    <span className="text-4xl opacity-50">📦</span>
                  )}
                </div>
                <div className="gg-product-info">
                  <h3 className="gg-product-name">{product.name}</h3>
                  <div className="flex justify-between items-center mt-auto pt-2">
                    <span className="font-bold text-white font-mono text-lg">{product.price || "₹0"}</span>
                    {/* 🌟 FIX: Updated View Details Cyber Button */}
                    <span className="gg-product-btn-view">View Details</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>

        {/* ── SECTION 4: WHY CHOOSE US */}
        <section className="gg-why-section">
          <div className="gg-why-inner">
            <div className="gg-why-header">
              <span className="gg-section-label">Our Advantage</span>
              <h2 className="gg-section-title">Why Choose GameGear</h2>
            </div>

            {features.length > 0 ? (
              <div className="gg-features-grid">
                {features.map((feature: { icon?: string; title?: string; description?: string }, index: number) => (
                  <div key={index} className="gg-feature-card">
                    <div className="gg-feature-icon-box">{renderIcon(feature?.icon || "Trophy")}</div>
                    <div className="gg-feature-title">{feature?.title || "Premium Service"}</div>
                    <p className="gg-feature-desc">{feature?.description || "Built for competitive performance."}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="gg-features-grid">
                {[
                  { icon: "Truck", title: "Fast Delivery", desc: "Pan-India shipping with same-day dispatch on orders placed before 2 PM." },
                  { icon: "ShieldCheck", title: "2-Year Warranty", desc: "Every product backed by a comprehensive manufacturer warranty." },
                  { icon: "Wrench", title: "Expert Support", desc: "Dedicated hardware specialists available 7 days a week." },
                  { icon: "Trophy", title: "Enterprise-Grade Quality", desc: "Gear trusted by esports professionals and tournament teams.", },
                ].map(({ icon, title, desc }, i) => (
                  <div key={i} className="gg-feature-card">
                    <div className="gg-feature-icon-box">{renderIcon(icon)}</div>
                    <div className="gg-feature-title">{title}</div>
                    <p className="gg-feature-desc">{desc}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        {/* ── SECTION 5: TESTIMONIALS ── */}
        <section className="gg-reviews-section">
          <div className="gg-reviews-header">
            <span className="gg-section-label">Customer Feedback</span>
            <h2 className="gg-section-title">Verified Reviews</h2>
          </div>

          <div className="gg-reviews-grid">
            {(reviews.length > 0 ? reviews : [
              { customerName: "Arjun K.", rating: 5, reviewText: "Insane build quality. My response time improved the moment I switched to this keyboard." },
              { customerName: "Priya S.", rating: 5, reviewText: "Fast delivery and the headset audio is studio-grade. Worth every rupee." },
              { customerName: "Rahul M.", rating: 4, reviewText: "Great selection of pro gear. Support team was super helpful with my order." },
            ]).map((review: { customerName?: string; rating?: number; reviewText?: string }, index: number) => {
              const rating = Number(review?.rating ?? 5);
              const name = review?.customerName || "Anonymous Gamer";
              const initial = name.charAt(0).toUpperCase();

              return (
                <div key={index} className="gg-review-card">
                  <div className="gg-review-stars">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} size={16} fill={i < rating ? "#ffb800" : "none"} stroke={i < rating ? "#ffb800" : "rgba(255,184,0,0.25)"} strokeWidth={1.5} />
                    ))}
                  </div>
                  <p className="gg-review-text">&quot;{review?.reviewText || "Outstanding peripheral selection."}&quot;</p>
                  <div className="gg-review-author-row">
                    <div className="gg-review-avatar">{initial}</div>
                    <div>
                      <div className="gg-review-name">{name}</div>
                      <div className="gg-review-verified">✓ Verified Purchase</div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

      </div>
    </>
  );
}