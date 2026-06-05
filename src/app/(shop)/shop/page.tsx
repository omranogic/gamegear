import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Grid, ArrowUpRight, ShieldCheck } from "lucide-react";
import ShopFilterComponent from "@/components/ShopFilterComponent";

// GraphQL query to fetch active WooCommerce product items with categories
const GET_SHOP_PRODUCTS = gql`
  query GetShopProducts {
    products(first: 24) {
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
        productCategories(first: 5) {
          nodes {
            id
            name
            slug
          }
        }
      }
    }
  }
`;

export default async function Shop() {
  let products = [];

  try {
    const client = getClient();
    const { data } = await client.query({ query: GET_SHOP_PRODUCTS });
    products = data?.products?.nodes || [];
  } catch (err) {
    console.error("❌ GraphQL Error on shop page:", err);
  }

  // Products data is passed to ShopFilterComponent

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-shop-page {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          color: #fff;
          min-height: 100vh;
          padding-bottom: 100px;
        }

        /* ─── SECTION 1: PAGE BANNER ──────────────── */
        .gg-shop-banner {
          position: relative;
          background: linear-gradient(135deg, #050d18 0%, #040911 100%);
          border-bottom: 1px solid rgba(0, 255, 194, 0.1);
          padding: 60px 24px;
          overflow: hidden;
          text-align: center;
        }

        .gg-shop-banner-grid {
          position: absolute;
          inset: 0;
          background-image:
            linear-gradient(rgba(0,255,194,0.02) 1px, transparent 1px),
            linear-gradient(90deg, rgba(0,255,194,0.02) 1px, transparent 1px);
          background-size: 40px 40px;
          mask-image: radial-gradient(circle at 50% 50%, black, transparent);
        }

        .gg-shop-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: clamp(36px, 5vw, 54px);
          text-transform: uppercase;
          letter-spacing: 0.05em;
          margin-bottom: 12px;
          background: linear-gradient(90deg, #fff 30%, #00ffc2 100%);
          -webkit-background-clip: text;
          -webkit-text-fill-color: transparent;
        }

        /* ─── CONTAINER CORE ───────────────────────── */
        .gg-shop-container {
          max-width: 1400px;
          margin: 0 auto;
          padding: 48px 24px;
          display: grid;
          grid-template-columns: 280px 1fr;
          gap: 40px;
        }

        /* ─── SECTION 2: PRODUCT FILTERS ───────────── */
        .gg-filter-sidebar {
          display: flex;
          flex-direction: column;
          gap: 32px;
        }

        .gg-filter-box {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          padding: 24px;
        }

        .gg-filter-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          color: #00ffc2;
          margin-bottom: 18px;
          border-bottom: 1px solid rgba(255,255,255,0.06);
          padding-bottom: 8px;
        }

        .gg-filter-list {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .gg-filter-item {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 13px;
          color: rgba(255,255,255,0.6);
          cursor: pointer;
          transition: color 0.2s;
        }

        .gg-filter-item:hover {
          color: #00ffc2;
        }

        .gg-checkbox {
          width: 16px;
          height: 16px;
          border: 1px solid rgba(255,255,255,0.2);
          border-radius: 4px;
          background: rgba(4,6,12,0.6);
        }

        /* ─── SECTION 3: PRODUCT GRID ──────────────── */
        .gg-products-main {
          display: flex;
          flex-direction: column;
          gap: 24px;
        }

        .gg-shop-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 24px;
        }

        .gg-shop-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 16px;
          overflow: hidden;
          transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
          position: relative;
        }

        .gg-shop-card:hover {
          border-color: rgba(0, 255, 194, 0.25);
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0,0,0,0.6), 0 0 30px rgba(0,255,194,0.04);
        }

        .gg-shop-img-holder {
          width: 100%;
          aspect-ratio: 1.1;
          background: linear-gradient(135deg, rgba(255,255,255,0.03), rgba(255,255,255,0.005));
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 24px;
        }

        .gg-shop-img-holder img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
          transition: transform 0.4s ease;
        }

        .gg-shop-card:hover .gg-shop-img-holder img {
          transform: scale(1.06);
        }

        .gg-shop-card-info {
          padding: 20px;
          border-top: 1px solid rgba(255,255,255,0.03);
        }

        .gg-shop-card-name {
          font-size: 14px;
          font-weight: 600;
          color: rgba(255,255,255,0.9);
          margin-bottom: 12px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .gg-shop-card-meta {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .gg-shop-card-price {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 20px;
          color: #00ffc2;
        }

        .gg-shop-card-rating {
          display: flex;
          align-items: center;
          gap: 4px;
          font-size: 11px;
          color: #ffb800;
          font-weight: 600;
        }

        .gg-shop-buy-btn {
          width: 100%;
          padding: 12px;
          background: rgba(255,255,255,0.04);
          border: 1px solid rgba(255,255,255,0.08);
          color: #fff;
          font-size: 12px;
          font-weight: 700;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          transition: all 0.25s ease;
        }

        .gg-shop-buy-btn:hover {
          background: linear-gradient(135deg, rgba(0,255,194,0.15), rgba(0,184,255,0.05));
          border-color: #00ffc2;
          color: #00ffc2;
          box-shadow: 0 0 20px rgba(0,255,194,0.1);
        }

        /* ─── SECTION 4: FEATURED COLLECTION ───────── */
        .gg-featured-collection {
          max-width: 1400px;
          margin: 64px auto 0;
          padding: 0 24px;
        }

        .gg-feat-banner {
          background: linear-gradient(135deg, #0a101f 0%, #050811 100%);
          border: 1px solid rgba(0,184,255,0.15);
          border-radius: 20px;
          padding: 48px;
          display: grid;
          grid-template-columns: 1fr 350px;
          gap: 40px;
          align-items: center;
        }

        /* ─── SECTION 5: NEWSLETTER SUBSCRIPTION ───── */
        .gg-shop-news {
          background: linear-gradient(180deg, transparent 0%, rgba(0,255,194,0.02) 100%);
          border-top: 1px solid rgba(255,255,255,0.03);
          margin-top: 100px;
          padding: 80px 24px;
          text-align: center;
        }

        .gg-news-input-group {
          max-width: 500px;
          margin: 32px auto 0;
          display: flex;
          border: 1px solid rgba(255,255,255,0.1);
          border-radius: 8px;
          overflow: hidden;
          background: rgba(255,255,255,0.03);
        }

        .gg-news-input {
          flex: 1;
          background: transparent;
          border: none;
          outline: none;
          padding: 14px 20px;
          color: #fff;
          font-size: 14px;
        }

        .gg-news-btn {
          background: linear-gradient(135deg, #00ffc2, #00b8ff);
          color: #04060c;
          border: none;
          padding: 0 28px;
          font-weight: 800;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.1em;
          cursor: pointer;
        }

        @media (max-width: 1100px) {
          .gg-shop-container { grid-template-columns: 1fr; }
          .gg-filter-sidebar { display: none; }
          .gg-shop-grid { grid-template-columns: repeat(2, 1fr); }
          .gg-feat-banner { grid-template-columns: 1fr; text-align: center; }
        }

        @media (max-width: 650px) {
          .gg-shop-grid { grid-template-columns: 1fr; }
        }
      `}</style>

      <div className="gg-shop-page">

        {/* ─── SECTION 1: PAGE BANNER ──────────────── */}
        <section className="gg-shop-banner">
          <div className="gg-shop-banner-grid" />
          <h1 className="gg-shop-title">Gaming Gear Store</h1>
          <p className="text-sm text-gray-400 max-w-md mx-auto">
            Premium gaming peripherals optimized for performance. Filter products to find your perfect gear.
          </p>
        </section>

        {/* Core Frame with Interactive Filters */}
        <ShopFilterComponent products={products} />

        {/* ─── SECTION 4: FEATURED COLLECTION ───────── */}
        <section className="gg-featured-collection">
          <div className="gg-feat-banner">
            <div>
              <span className="gg-section-label">Featured Collections</span>
              <h2 className="font-bold text-3xl mb-4 uppercase tracking-wide font-['Rajdhani']">
                PRO SERIES BUNDLE DROP
              </h2>
              <p className="text-sm text-gray-400 max-w-xl leading-relaxed mb-6">
                Equip matching peripheral lines. Combined sensor hardware synchronization maximizes response accuracy. High competitive advantage.
              </p>
              <a href="/shop?bundle=true" className="inline-flex items-center gap-2 text-xs font-bold text-[#00b8ff] uppercase tracking-wider border-b border-[#00b8ff]/40 pb-1 hover:text-white hover:border-white transition-all">
                Acquire Bundle Config <ArrowUpRight size={14} />
              </a>
            </div>
            <div className="flex justify-center border border-white/5 bg-black/40 p-6 rounded-xl">
              <ShieldCheck size={80} className="text-[#00b8ff] drop-shadow-[0_0_20px_rgba(0,184,255,0.2)]" />
            </div>
          </div>
        </section>

        {/* ─── SECTION 5: NEWSLETTER SUBSCRIPTION ───── */}
        <section className="gg-shop-news">
          <span className="gg-section-label">Secure Data Intel</span>
          <h2 className="font-bold text-2xl uppercase tracking-wider font-['Rajdhani']">
            Join Intel Network
          </h2>
          <p className="text-xs text-gray-500 max-w-xs mx-auto mt-2">
            Get automated logs regarding flash inventory modifications and price point variations.
          </p>
          <div className="gg-news-input-group">
            <input type="email" placeholder="your@email.com" className="gg-news-input" />
            <button className="gg-news-btn">Link</button>
          </div>
        </section>

      </div>
    </>
  );
}