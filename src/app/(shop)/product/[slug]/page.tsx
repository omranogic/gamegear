import { getClient } from "@/lib/apollo-client";
import { gql } from "@apollo/client";
import { Star, ShoppingCart, ShieldCheck, Cpu, Zap, Activity } from "lucide-react";
import AddToCartSection from "./AddToCartSection";

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

// Unified GraphQL query mapping all 6 critical business sectors
const GET_PRODUCT_DETAILS = gql`
  query GetProductDetails($slug: ID!) {
    product(id: $slug, idType: SLUG) {
      id
      databaseId
      name
      description
      shortDescription
      image {
        sourceUrl
        altText
      }
      galleryImages {
        nodes {
          sourceUrl
          altText
        }
      }
      ... on SimpleProduct {
        price
        stockStatus
      }
      ... on VariableProduct {
        price
        stockStatus
      }
      
      # SECTION 3: Advanced Custom Fields
      acfProductSpecs {
        brand
        connectivity
        rgbLighting
        switchType
        weight
        warranty
      }
      
      # SECTION 6: Cross-Sell Recommendations
      related(first: 4) {
        nodes {
          id
          name
          slug
          ... on SimpleProduct {
            price
          }
          ... on VariableProduct {
            price
          }
          image {
            sourceUrl
            altText
          }
        }
      }
    }
  }
`;

export default async function ProductDetailsPage({ params }: ProductPageProps) {
  const { slug } = await params;
  let product = null;

  try {
    const client = getClient();
    
    const { data } = await client.query({
      query: GET_PRODUCT_DETAILS,
      variables: { slug },
    });

    product = data?.product;
  } catch (err) {
    console.error("❌ GraphQL Error loading product:", slug, err);
    // Product will be null, showing fallback
  }

  // Structural arrays parsing data down into the UI template matrices
  const specs = product?.acfProductSpecs;
  const gallery = product?.galleryImages?.nodes || [];
  const reviews = product?.reviews?.nodes || [];
  const relatedProducts = product?.related?.nodes || [];

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Rajdhani:wght@500;600;700&family=Exo+2:wght@300;400;600;800&display=swap');

        .gg-product-page {
          font-family: 'Exo 2', sans-serif;
          background: #04060c;
          color: #fff;
          min-height: 100vh;
          padding: 40px 24px 120px;
        }

        .gg-details-container {
          max-width: 1400px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: 1.2fr 1fr;
          gap: 60px;
          align-items: start;
        }

        /* ─── SECTION 1: PRODUCT GALLERY ──────────── */
        .gg-gallery-box {
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .gg-main-img-wrap {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(0, 255, 194, 0.1);
          border-radius: 16px;
          aspect-ratio: 1.2;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 40px;
          box-shadow: 0 0 40px rgba(0,255,194,0.02);
        }

        .gg-main-img-wrap img {
          max-width: 100%;
          max-height: 100%;
          object-fit: contain;
        }

        .gg-thumb-grid {
          display: grid;
          grid-template-columns: repeat(5, 1fr);
          gap: 12px;
        }

        .gg-thumb-card {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 8px;
          aspect-ratio: 1;
          padding: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
        }

        .gg-thumb-card:hover {
          border-color: #00ffc2;
        }

        /* ─── SECTION 2: PRODUCT INFORMATION ──────── */
        .gg-info-panel {
          display: flex;
          flex-direction: column;
        }

        .gg-stock-badge {
          display: inline-flex;
          align-items: center;
          align-self: flex-start;
          font-size: 10px;
          font-weight: 800;
          letter-spacing: 0.15em;
          text-transform: uppercase;
          padding: 4px 12px;
          border-radius: 100px;
          margin-bottom: 16px;
        }

        .gg-stock-in {
          background: rgba(0,255,194,0.1);
          color: #00ffc2;
          border: 1px solid rgba(0,255,194,0.2);
        }

        .gg-stock-out {
          background: rgba(255,59,107,0.1);
          color: #ff3b6b;
          border: 1px solid rgba(255,59,107,0.2);
        }

        .gg-prod-name {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: clamp(28px, 4vw, 42px);
          line-height: 1.1;
          text-transform: uppercase;
          margin-bottom: 12px;
        }

        .gg-prod-price {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 32px;
          color: #00ffc2;
          margin-bottom: 24px;
        }

        .gg-prod-desc {
          font-size: 14px;
          line-height: 1.7;
          color: rgba(255,255,255,0.5);
          margin-bottom: 32px;
        }

        /* ─── SECTION 3: PRODUCT SPECIFICATIONS ───── */
        .gg-specs-matrix {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 32px;
          margin-bottom: 40px;
        }

        .gg-specs-title {
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.2em;
          text-transform: uppercase;
          color: #00b8ff;
          margin-bottom: 20px;
        }

        .gg-specs-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 16px;
        }

        .gg-spec-row {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          padding: 14px 18px;
          border-radius: 8px;
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 13px;
        }

        .gg-spec-label {
          color: rgba(255,255,255,0.3);
          font-weight: 500;
        }

        .gg-spec-value {
          color: rgba(255,255,255,0.85);
          font-weight: 600;
        }

        .gg-cart-action-box {
          display: flex;
          gap: 16px;
          margin-bottom: 40px;
        }

        /* ─── ADD TO CART BUTTON STYLING ──────────── */
        .gg-action-container {
          display: flex;
          gap: 16px;
          width: 100%;
        }

        .gg-qty-container {
          display: flex;
          align-items: center;
          gap: 0;
          background: rgba(0, 255, 194, 0.05);
          border: 1.5px solid rgba(0, 255, 194, 0.2);
          border-radius: 8px;
          padding: 0;
          min-width: 140px;
        }

        .gg-qty-action-btn {
          background: transparent;
          border: none;
          color: #00ffc2;
          cursor: pointer;
          padding: 12px 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: all 0.2s ease;
          flex-shrink: 0;
        }

        .gg-qty-action-btn:hover:not(:disabled) {
          background: rgba(0, 255, 194, 0.1);
          color: #00ffc2;
        }

        .gg-qty-action-btn:active:not(:disabled) {
          transform: scale(0.95);
        }

        .gg-qty-action-btn:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .gg-qty-display-value {
          flex: 1;
          text-align: center;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 16px;
          color: #00ffc2;
          letter-spacing: 0.05em;
          padding: 12px 0;
        }

        .gg-add-cart-master-btn {
          flex: 1.5;
          background: linear-gradient(135deg, #00ffc2 0%, #00b8ff 100%);
          border: none;
          color: #04060c;
          font-family: 'Rajdhani', sans-serif;
          font-weight: 700;
          font-size: 14px;
          letter-spacing: 0.1em;
          text-transform: uppercase;
          padding: 14px 24px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 10px;
          transition: all 0.3s ease;
          box-shadow: 0 4px 20px rgba(0, 255, 194, 0.2);
          position: relative;
          overflow: hidden;
        }

        .gg-add-cart-master-btn::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: rgba(255, 255, 255, 0.1);
          transition: left 0.3s ease;
        }

        .gg-add-cart-master-btn:hover:not(:disabled)::before {
          left: 100%;
        }

        .gg-add-cart-master-btn:hover:not(:disabled) {
          box-shadow: 0 6px 30px rgba(0, 255, 194, 0.35);
          transform: translateY(-2px);
        }

        .gg-add-cart-master-btn:active:not(:disabled) {
          transform: translateY(0);
          box-shadow: 0 2px 10px rgba(0, 255, 194, 0.2);
        }

        .gg-add-cart-master-btn:disabled {
          opacity: 0.8;
          cursor: not-allowed;
          background: linear-gradient(135deg, #00ffc2 0%, #00b8ff 100%);
        }

        .gg-add-cart-master-btn span {
          position: relative;
          z-index: 1;
        }

        .gg-add-cart-master-btn svg {
          position: relative;
          z-index: 1;
        }

        @media (max-width: 600px) {
          .gg-action-container {
            flex-direction: column;
          }
          
          .gg-qty-container {
            min-width: auto;
          }
          
          .gg-add-cart-master-btn {
            flex: 1;
            width: 100%;
          }
        }

        /* ─── SECTION 5: REVIEWS ──────────────────── */
        .gg-reviews-panel {
          border-top: 1px solid rgba(255,255,255,0.06);
          padding-top: 40px;
          margin-top: 20px;
        }

        .gg-review-item {
          background: rgba(255,255,255,0.01);
          border: 1px solid rgba(255,255,255,0.03);
          border-radius: 12px;
          padding: 24px;
          margin-bottom: 16px;
        }

        /* ─── SECTION 6: RELATED PRODUCTS ─────────── */
        .gg-related-panel {
          max-width: 1400px;
          margin: 80px auto 0;
        }

        .gg-related-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: 20px;
          margin-top: 24px;
        }

        .gg-related-card {
          background: rgba(255,255,255,0.02);
          border: 1px solid rgba(255,255,255,0.05);
          border-radius: 12px;
          overflow: hidden;
          padding: 16px;
          text-decoration: none;
          transition: all 0.25s;
        }

        .gg-related-card:hover {
          border-color: rgba(0,255,194,0.2);
          transform: translateY(-4px);
        }

        @media (max-width: 1024px) {
          .gg-details-container { grid-template-columns: 1fr; gap: 40px; }
          .gg-related-grid { grid-template-columns: repeat(2, 1fr); }
        }

        @media (max-width: 768px) {
          .gg-product-page {
            padding: 24px 16px 80px;
          }

          .gg-details-container {
            gap: 32px;
          }

          .gg-prod-name {
            font-size: clamp(20px, 3vw, 32px);
          }

          .gg-prod-price {
            font-size: 24px;
          }

          .gg-thumb-grid {
            grid-template-columns: repeat(4, 1fr);
          }

          .gg-specs-grid {
            grid-template-columns: 1fr;
          }

          .gg-related-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 16px;
          }

          .gg-action-container {
            gap: 12px;
          }

          .gg-qty-container {
            min-width: 120px;
          }

          .gg-qty-action-btn {
            padding: 10px 14px;
          }

          .gg-qty-display-value {
            font-size: 14px;
            padding: 10px 0;
          }

          .gg-add-cart-master-btn {
            padding: 12px 20px;
            font-size: 13px;
            gap: 8px;
          }

          .gg-add-cart-master-btn svg {
            width: 16px;
            height: 16px;
          }
        }

        @media (max-width: 600px) {
          .gg-product-page {
            padding: 20px 12px 60px;
          }

          .gg-details-container {
            gap: 24px;
          }

          .gg-main-img-wrap {
            padding: 24px;
          }

          .gg-prod-name {
            font-size: clamp(18px, 2.5vw, 26px);
            margin-bottom: 8px;
          }

          .gg-prod-price {
            font-size: 20px;
            margin-bottom: 16px;
          }

          .gg-prod-desc {
            font-size: 13px;
            margin-bottom: 20px;
          }

          .gg-stock-badge {
            font-size: 9px;
            padding: 3px 10px;
            margin-bottom: 12px;
          }

          .gg-thumb-grid {
            grid-template-columns: repeat(3, 1fr);
            gap: 8px;
          }

          .gg-thumb-card {
            padding: 6px;
          }

          /* ─── MOBILE BUTTON RESPONSIVENESS ──────── */
          .gg-action-container {
            flex-direction: column;
            gap: 10px;
            width: 100%;
          }

          .gg-qty-container {
            min-width: auto;
            width: 100%;
          }

          .gg-qty-action-btn {
            padding: 12px 12px;
            font-size: 12px;
          }

          .gg-qty-display-value {
            font-size: 13px;
            padding: 12px 0;
          }

          .gg-add-cart-master-btn {
            flex: 1;
            width: 100%;
            padding: 14px 16px;
            font-size: 12px;
            letter-spacing: 0.08em;
            gap: 6px;
          }

          .gg-add-cart-master-btn svg {
            width: 14px;
            height: 14px;
          }

          /* Better touch targets */
          .gg-add-cart-master-btn:active:not(:disabled) {
            transform: scale(0.98);
          }

          .gg-qty-action-btn:active:not(:disabled) {
            transform: scale(0.92);
          }

          .gg-specs-matrix {
            padding-top: 20px;
            margin-bottom: 24px;
          }

          .gg-specs-title {
            font-size: 12px;
            margin-bottom: 14px;
          }

          .gg-specs-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .gg-spec-row {
            padding: 12px 14px;
            font-size: 12px;
          }

          .gg-reviews-panel {
            padding-top: 20px;
            margin-top: 16px;
          }

          .gg-review-item {
            padding: 16px;
            margin-bottom: 12px;
          }

          .gg-related-grid {
            grid-template-columns: 1fr;
            gap: 12px;
          }

          .gg-related-panel {
            margin: 40px auto 0;
          }

          .gg-related-card {
            padding: 12px;
          }
        }

        @media (max-width: 480px) {
          .gg-product-page {
            padding: 16px 10px 50px;
          }

          .gg-prod-name {
            font-size: 18px;
          }

          .gg-prod-price {
            font-size: 18px;
          }

          .gg-thumb-grid {
            grid-template-columns: repeat(2, 1fr);
            gap: 6px;
          }

          .gg-action-container {
            gap: 8px;
          }

          .gg-add-cart-master-btn {
            padding: 12px 12px;
            font-size: 11px;
          }

          .gg-qty-action-btn {
            padding: 10px 10px;
          }

          .gg-specs-grid {
            gap: 8px;
          }

          .gg-spec-row {
            padding: 10px 12px;
            font-size: 11px;
          }
        }

        @media (max-width: 600px) {
          .gg-specs-grid, .gg-related-grid { grid-template-columns: 1fr; }
          .gg-cart-action-box { flex-direction: column; }
        }
      `}</style>

      <div className="gg-product-page">
        <div className="gg-details-container">
          
          {/* LEFT SIDE: SECTION 1 (PRODUCT GALLERY) */}
          <div className="gg-gallery-box">
            <div className="gg-main-img-wrap">
              {product?.image?.sourceUrl ? (
                <img src={product.image.sourceUrl} alt={product.image.altText || product.name} />
              ) : (
                <span className="text-5xl">🎮</span>
              )}
            </div>
            
            {gallery.length > 0 && (
              <div className="gg-thumb-grid">
                {gallery.map((img: any, i: number) => (
                  <div key={i} className="gg-thumb-card">
                    <img src={img.sourceUrl} alt={img.altText || "Thumbnail"} className="max-w-full max-h-full object-contain" />
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* RIGHT SIDE: SECTIONS 2, 3, 4, 5 */}
          <div className="gg-info-panel">
            
            {/* SECTION 2: PRODUCT INFORMATION */}
            <div className={`gg-stock-badge ${product?.stockStatus === "IN_STOCK" ? "gg-stock-in" : "gg-stock-out"}`}>
              {product?.stockStatus === "IN_STOCK" ? "System Active / In Stock" : "Depleted / Out of Stock"}
            </div>

            <h1 className="gg-prod-name">{product?.name || "Product"}</h1>
            <div className="gg-prod-price">{product?.price || "₹0"}</div>
            <div 
              className="gg-prod-desc" 
              dangerouslySetInnerHTML={{ __html: product?.shortDescription || product?.description || "Specification data processing continuous." }} 
            />

            {/* SECTION 4: ADD TO CART CONNECTOR */}
            <AddToCartSection 
              product={{
                id: product?.id || slug,
                name: product?.name || "Premium Gaming Accessory",
                price: product?.price || "₹0",
                slug: slug,
                image: product?.image
              }} 
            />

            {/* SECTION 3: ACF DYNAMIC PRODUCT SPECIFICATIONS */}
            <div className="gg-specs-matrix">
              <h2 className="gg-specs-title">Hardware Specifications</h2>
              <div className="gg-specs-grid">
                <div className="gg-spec-row">
                  <span className="gg-spec-label">Brand</span>
                  <span className="gg-spec-value">{specs?.brand || "Generic Pro"}</span>
                </div>
                <div className="gg-spec-row">
                  <span className="gg-spec-label">Connectivity</span>
                  <span className="gg-spec-value">{specs?.connectivity || "Wired USB-C"}</span>
                </div>
                <div className="gg-spec-row">
                  <span className="gg-spec-label">RGB Lighting</span>
                  <span className="gg-spec-value">{specs?.rgbLighting || "None"}</span>
                </div>
                <div className="gg-spec-row">
                  <span className="gg-spec-label">Switch Type</span>
                  <span className="gg-spec-value">{specs?.switchType || "Mechanical"}</span>
                </div>
                <div className="gg-spec-row">
                  <span className="gg-spec-label">Net Weight</span>
                  <span className="gg-spec-value">{specs?.weight || "85g"}</span>
                </div>
                <div className="gg-spec-row">
                  <span className="gg-spec-label">Warranty</span>
                  <span className="gg-spec-value">{specs?.warranty || "1 Year Warranty"}</span>
                </div>
              </div>
            </div>

            {/* SECTION 5: LIVE REVIEWS ARRAY */}
            <div className="gg-reviews-panel">
              <h2 className="gg-specs-title">Customer Reviews ({reviews.length})</h2>
              {reviews.length > 0 ? (
                reviews.map((rev: any) => (
                  <div key={rev.id} className="gg-review-item">
                    <div className="flex gap-1 text-[#ffb800] mb-2">
                      {Array.from({ length: rev.rating || 5 }).map((_, i) => (
                        <Star key={i} size={12} fill="#ffb800" strokeWidth={0} />
                      ))}
                    </div>
                    <div className="text-sm text-gray-400 font-light italic mb-3" dangerouslySetInnerHTML={{ __html: rev.content }} />
                    <div className="text-[10px] font-bold tracking-wider text-gray-500 uppercase">— {rev.author?.node?.name || "Verified Buyer"}</div>
                  </div>
                ))
              ) : (
                <div className="text-sm text-gray-500 italic">No historical validation entries compiled for this item.</div>
              )}
            </div>

          </div>
        </div>

        {/* BOTTOM AXIS: SECTION 6 (RELATED PRODUCTS GRID) */}
        {relatedProducts.length > 0 && (
          <section className="gg-related-panel">
            <span className="text-xs uppercase font-bold tracking-widest text-[#00ffc2] block mb-2">Complete the Set</span>
            <h2 className="font-['Rajdhani'] font-bold text-2xl uppercase tracking-wide">Related Products</h2>
            
            <div className="gg-related-grid">
              {relatedProducts.map((prod: any) => (
                <a key={prod.id} href={`/product/${prod.slug}`} className="gg-related-card">
                  <div className="w-full aspect-square bg-white/5 rounded-lg flex items-center justify-center p-4 mb-4">
                    {prod.image?.sourceUrl ? (
                      <img src={prod.image.sourceUrl} alt={prod.name} className="max-w-full max-h-full object-contain" />
                    ) : (
                      <span className="text-2xl">📦</span>
                    )}
                  </div>
                  <h3 className="text-sm font-semibold truncate text-gray-300 mb-2">{prod.name}</h3>
                  <span className="font-mono text-xs font-bold text-[#00ffc2]">{prod.price || "₹0"}</span>
                </a>
              ))}
            </div>
          </section>
        )}
      </div>
    </>
  );
}