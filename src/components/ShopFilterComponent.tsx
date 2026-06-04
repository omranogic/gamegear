"use client";

import { useState, useMemo } from "react";
import { SlidersHorizontal, Star } from "lucide-react";

interface Product {
  id: string;
  name: string;
  slug: string;
  price?: string;
  image?: { sourceUrl: string };
}

interface ShopFilterComponentProps {
  products: Product[];
}

export default function ShopFilterComponent({ products }: ShopFilterComponentProps) {
  const [selectedCategories, setSelectedCategories] = useState<Set<string>>(new Set());
  const [selectedBrands, setSelectedBrands] = useState<Set<string>>(new Set());
  const [selectedPrices, setSelectedPrices] = useState<Set<string>>(new Set());
  const [inStockOnly, setInStockOnly] = useState(false);

  // Static filter options
  const staticCategories = ["Keyboards", "Mice", "Headsets", "Controllers", "Monitors", "Chairs"];
  const staticBrands = ["Logitech G", "Razer", "Corsair", "SteelSeries", "HyperX"];
  const priceRanges = [
    { label: "Under ₹2,500", min: 0, max: 2500 },
    { label: "₹2,500 - ₹5,000", min: 2500, max: 5000 },
    { label: "₹5,000 - ₹10,000", min: 5000, max: 10000 },
    { label: "Over ₹10,000", min: 10000, max: Infinity },
  ];

  // Parse price from product
  const parsePrice = (priceStr?: string): number => {
    if (!priceStr) return 0;
    const num = parseFloat(priceStr.replace(/[^0-9.-]+/g, ""));
    return isNaN(num) ? 0 : num;
  };

  // Filter products based on selected filters
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      // Category filter (mock: just check if categories are selected)
      if (selectedCategories.size > 0) {
        // Since we don't have actual category data, we'll skip category filtering
        // In a real app, products would have a category field
      }

      // Brand filter (mock: just check if brands are selected)
      if (selectedBrands.size > 0) {
        // Similarly, we'd check product.brand against selectedBrands
      }

      // Price range filter
      if (selectedPrices.size > 0) {
        const price = parsePrice(product.price);
        let inRange = false;

        for (const priceLabel of selectedPrices) {
          const range = priceRanges.find((r) => r.label === priceLabel);
          if (range && price >= range.min && price < range.max) {
            inRange = true;
            break;
          }
        }

        if (!inRange) return false;
      }

      return true;
    });
  }, [products, selectedCategories, selectedBrands, selectedPrices]);

  const toggleCategory = (cat: string) => {
    setSelectedCategories((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cat)) {
        newSet.delete(cat);
      } else {
        newSet.add(cat);
      }
      return newSet;
    });
  };

  const toggleBrand = (brand: string) => {
    setSelectedBrands((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(brand)) {
        newSet.delete(brand);
      } else {
        newSet.add(brand);
      }
      return newSet;
    });
  };

  const togglePrice = (label: string) => {
    setSelectedPrices((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(label)) {
        newSet.delete(label);
      } else {
        newSet.add(label);
      }
      return newSet;
    });
  };

  return (
    <div className="gg-shop-container">
      {/* ─── FILTERS SIDEBAR ──────────────────────── */}
      <aside className="gg-filter-sidebar">
        <div className="flex items-center gap-3 text-gray-400 font-medium">
          <SlidersHorizontal size={16} />
          <span className="text-sm uppercase tracking-wider font-semibold">Filter & Sort</span>
        </div>

        {/* Category Filter */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Category</h3>
          <div className="gg-filter-list">
            {staticCategories.map((cat) => (
              <label key={cat} className="gg-filter-item cursor-pointer">
                <input
                  type="checkbox"
                  className="gg-checkbox"
                  checked={selectedCategories.has(cat)}
                  onChange={() => toggleCategory(cat)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <span>{cat}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Brand Filter */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Brand</h3>
          <div className="gg-filter-list">
            {staticBrands.map((brand) => (
              <label key={brand} className="gg-filter-item cursor-pointer">
                <input
                  type="checkbox"
                  className="gg-checkbox"
                  checked={selectedBrands.has(brand)}
                  onChange={() => toggleBrand(brand)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <span>{brand}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Price Filter */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Price Range</h3>
          <div className="gg-filter-list">
            {priceRanges.map((range) => (
              <label key={range.label} className="gg-filter-item cursor-pointer">
                <input
                  type="checkbox"
                  className="gg-checkbox"
                  checked={selectedPrices.has(range.label)}
                  onChange={() => togglePrice(range.label)}
                  style={{ cursor: "pointer", width: "16px", height: "16px" }}
                />
                <span>{range.label}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Availability Filter */}
        <div className="gg-filter-box">
          <h3 className="gg-filter-title">Availability</h3>
          <div className="gg-filter-list">
            <label className="gg-filter-item cursor-pointer">
              <input
                type="checkbox"
                className="gg-checkbox"
                checked={inStockOnly}
                onChange={() => setInStockOnly(!inStockOnly)}
                style={{ cursor: "pointer", width: "16px", height: "16px" }}
              />
              <span>In Stock Only</span>
            </label>
            <label className="gg-filter-item cursor-pointer">
              <input
                type="checkbox"
                className="gg-checkbox"
                disabled
                style={{ cursor: "not-allowed", width: "16px", height: "16px" }}
              />
              <span className="opacity-50">Include Out of Stock</span>
            </label>
          </div>
        </div>
      </aside>

      {/* ─── PRODUCTS DISPLAY ────────────────────── */}
      <main className="gg-products-main">
        <div className="flex justify-between items-center border-b border-white/5 pb-4">
          <div className="text-xs text-gray-400 tracking-wider uppercase">
            Showing <span className="text-[#00ffc2] font-mono">{filteredProducts.length}</span> of{" "}
            <span className="text-[#00ffc2] font-mono">{products.length}</span> products
          </div>
        </div>

        {/* Product Grid */}
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
              <p className="text-sm">No products match your filters. Try adjusting your selection.</p>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
