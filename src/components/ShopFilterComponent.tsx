"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price?: string;
  image?: { sourceUrl: string };
  productCategories?: {
    nodes: Array<{
      id: string;
      name: string;
      slug: string;
    }>;
  };
}

interface ShopFilterComponentProps {
  products: Product[];
}

// ✅ Moved outside component — stable reference
const PRICE_RANGES = [
  { label: "Under ₹2,500", min: 0, max: 2500 },
  { label: "₹100 - ₹1,500", min: 100, max: 150 },
  { label: "₹150 - ₹300", min: 150, max: 300 },
  { label: "Over ₹10,000", min: 10000, max: Infinity },
];

const parsePrice = (priceStr?: string): number => {
  if (!priceStr) return 0;
  // Handle HTML entities like &#8377; and strip currency symbols + commas
  const decoded = priceStr.replace(/&[^;]+;/g, "").replace(/[^\d.]/g, "");
  const num = parseFloat(decoded);
  return isNaN(num) ? 0 : num;
};

export default function ShopFilterComponent({ products }: ShopFilterComponentProps) {
  const [selectedPrices, setSelectedPrices] = useState<Set<string>>(new Set());
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [searchTerm, setSearchTerm] = useState("");

  // Extract unique categories from all products
  const allCategories = useMemo(() => {
    const categoryMap = new Map<string, { id: string; name: string; slug: string }>();
    products.forEach((product) => {
      product.productCategories?.nodes?.forEach((cat) => {
        if (!categoryMap.has(cat.slug)) {
          categoryMap.set(cat.slug, cat);
        }
      });
    });
    return Array.from(categoryMap.values()).sort((a, b) => a.name.localeCompare(b.name));
  }, [products]);

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Search filter
      if (searchTerm.trim()) {
        if (!product.name.toLowerCase().includes(searchTerm.toLowerCase())) {
          return false;
        }
      }

      // Category filter
      if (selectedCategories.size > 0) {
        const productCategorySlugs = product.productCategories?.nodes?.map((c) => c.slug) || [];
        const hasSelectedCategory = [...selectedCategories].some((slug) =>
          productCategorySlugs.includes(slug)
        );
        if (!hasSelectedCategory) return false;
      }

      // Price filter — now actually works
      if (selectedPrices.size > 0) {
        const price = parsePrice(product.price);
        const inRange = [...selectedPrices].some((label) => {
          const range = PRICE_RANGES.find((r) => r.label === label);
          return range && price >= range.min && price < range.max;
        });
        if (!inRange) return false;
      }

      return true;
    });
  }, [products, selectedPrices, searchTerm, selectedCategories]); // Added selectedCategories

  const togglePrice = (label: string) => {
    setSelectedPrices((prev) => {
      const next = new Set(prev);
      next.has(label) ? next.delete(label) : next.add(label);
      return next;
    });
  };

  const toggleCategory = (slug: string) => {
    setSelectedCategories((prev) => {
      const next = new Set(prev);
      next.has(slug) ? next.delete(slug) : next.add(slug);
      return next;
    });
  };

  const clearFilters = () => {
    setSelectedPrices(new Set());
    setSelectedCategories(new Set());
    setSearchTerm("");
  };

  const isFiltering = selectedPrices.size > 0 || selectedCategories.size > 0 || searchTerm.trim().length > 0;

  return (
    <div className="gg-shop-container">
      {/* FILTERS SIDEBAR */}
      <aside className="gg-filter-sidebar">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 text-gray-400 font-medium">
            <SlidersHorizontal size={16} />
            <span className="text-sm uppercase tracking-wider font-semibold">Filters</span>
          </div>
          {isFiltering && (
            <button
              onClick={clearFilters}
              className="text-xs text-[#00ffc2] uppercase tracking-wider hover:underline"
            >
              Clear all
            </button>
          )}
        </div>

        {/* Search */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Search</h3>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products..."
            suppressHydrationWarning
            style={{
              width: "100%",
              background: "rgba(0,0,0,0.4)",
              border: "1px solid rgba(255,255,255,0.1)",
              borderRadius: "6px",
              padding: "10px 12px",
              color: "#fff",
              fontSize: "13px",
              outline: "none",
            }}
          />
        </div>

        {/* Category Filter */}
        {allCategories.length > 0 && (
          <div className="gg-filter-box">
            <h3 className="gg-filter-title">Category</h3>
            <div className="gg-filter-list">
              {allCategories.map((category) => (
                <label
                  key={category.slug}
                  className="gg-filter-item cursor-pointer flex items-center gap-2"
                >
                  <input
                    type="checkbox"
                    checked={selectedCategories.has(category.slug)}
                    onChange={() => toggleCategory(category.slug)}
                    suppressHydrationWarning
                    style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#00ffc2" }}
                  />
                  <span>{category.name}</span>
                </label>
              ))}
            </div>
          </div>
        )}

        {/* Price Filter */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Price Range</h3>
          <div className="gg-filter-list">
            {PRICE_RANGES.map((range) => (
              <label
                key={range.label}
                className="gg-filter-item cursor-pointer flex items-center gap-2"
              >
                <input
                  type="checkbox"
                  checked={selectedPrices.has(range.label)}
                  onChange={() => togglePrice(range.label)}
                  suppressHydrationWarning
                  style={{ cursor: "pointer", width: "16px", height: "16px", accentColor: "#00ffc2" }}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>
      </aside>

      {/* PRODUCTS */}
      <main className="gg-products-main">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="text-xs text-gray-400 tracking-wider uppercase">
            Showing <span className="text-[#00ffc2] font-mono">{filteredProducts.length}</span> of{" "}
            <span className="text-[#00ffc2] font-mono">{products.length}</span> products
          </div>
        </div>

        <div className="gg-shop-grid">
          {filteredProducts.length > 0 ? (
            filteredProducts.map((product) => (
              <a
                key={product.id}
                href={`/product/${product.slug}`}
                className="gg-shop-card block no-underline"
              >
                <div className="gg-shop-img-holder">
                  {product.image?.sourceUrl ? (
                    <img src={product.image.sourceUrl} alt={product.name} />
                  ) : (
                    <span className="text-4xl">📦</span>
                  )}
                </div>
                <div className="gg-shop-card-info">
                  <h2 className="gg-shop-card-name" title={product.name}>
                    {product.name}
                  </h2>
                  <div className="gg-shop-card-meta">
                    <span className="gg-shop-card-price">{product.price || "₹3,499"}</span>
                    <div className="gg-shop-card-rating">
                      <Star size={12} fill="#ffb800" strokeWidth={0} />
                      <span>4.8</span>
                    </div>
                  </div>
                  <span className="gg-shop-buy-btn">View Product</span>
                </div>
              </a>
            ))
          ) : (
            <div className="col-span-3 text-center py-16 text-gray-400">
              <p className="text-sm">No products match your filters.</p>
              <button onClick={clearFilters} className="mt-4 text-xs text-[#00ffc2] underline">
                Clear filters
              </button>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}