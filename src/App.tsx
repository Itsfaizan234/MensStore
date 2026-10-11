import React, { useState, useEffect, useMemo } from 'react';
import {
  Search,
  SlidersHorizontal,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  ShieldCheck,
  Award,
  Clock,
  Truck,
} from 'lucide-react';
import {
  Product,
  ProductCategory,
  CartItem,
  Order,
  OrderCustomer,
  OrderStatus,
  FilterState,
  SortOption,
} from './types/store';
import {
  PRODUCTS,
  CATEGORIES_INFO,
  GENERATED_ASSETS,
} from './data/products';
import {
  loadCartFromStorage,
  saveCartToStorage,
  loadPromoFromStorage,
  savePromoToStorage,
  loadOrdersFromStorage,
  saveOrdersToStorage,
  calculateCartSummary,
  formatCurrency,
} from './utils/storage';
import { Navbar, ActiveTab } from './components/Navbar';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { OrdersAndInvoiceView } from './components/OrdersAndInvoiceView';
import { ProductImage } from './components/ProductImage';

const ALL_CATEGORIES: (ProductCategory | 'All')[] = [
  'All',
  'Watches',
  "Men's Clothing",
  'Accessories',
  'Wallets',
  'Perfumes',
];

export default function App() {
  // Navigation & View State
  const [activeTab, setActiveTab] = useState<ActiveTab>('home');
  const [homeShowcaseMode, setHomeShowcaseMode] = useState<'featured' | 'new'>('featured');

  // Local Storage Backed States
  const [cart, setCart] = useState<CartItem[]>(() => loadCartFromStorage());
  const [promoCode, setPromoCode] = useState<string>(() => loadPromoFromStorage());
  const [orders, setOrders] = useState<Order[]>(() => loadOrdersFromStorage());
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(() => {
    const initial = loadOrdersFromStorage();
    return initial[0]?.id || null;
  });

  // Modals & Drawers
  const [inspectedProduct, setInspectedProduct] = useState<Product | null>(null);
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [cartInitialStep, setCartInitialStep] = useState<'cart' | 'checkout'>('cart');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Catalog Filter & Search State
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'All',
    brand: 'All Brands',
    minPrice: 0,
    maxPrice: 4500,
    onlyInStock: false,
    sortBy: 'featured',
  });

  // Sync Cart to Local Storage
  useEffect(() => {
    saveCartToStorage(cart);
  }, [cart]);

  // Sync Promo Code to Local Storage
  useEffect(() => {
    savePromoToStorage(promoCode);
  }, [promoCode]);

  // Sync Orders to Local Storage
  useEffect(() => {
    saveOrdersToStorage(orders);
  }, [orders]);

  // Auto-dismiss Toast
  useEffect(() => {
    if (!toastMessage) return;
    const timer = setTimeout(() => setToastMessage(null), 3500);
    return () => clearTimeout(timer);
  }, [toastMessage]);

  const brands = useMemo(() => {
    const unique = Array.from(new Set(PRODUCTS.map((p) => p.brand)));
    return ['All Brands', ...unique];
  }, []);

  // Filtered & Sorted Products
  const filteredProducts = useMemo(() => {
    return PRODUCTS.filter((product) => {
      if (activeTab === 'new-arrivals' && !product.isNewArrival) {
        return false;
      }
      if (filters.category !== 'All' && product.category !== filters.category) {
        return false;
      }
      if (filters.brand !== 'All Brands' && product.brand !== filters.brand) {
        return false;
      }
      if (product.price < filters.minPrice || product.price > filters.maxPrice) {
        return false;
      }
      if (filters.onlyInStock && product.stock <= 0) {
        return false;
      }
      if (filters.searchQuery.trim()) {
        const q = filters.searchQuery.toLowerCase();
        const matchesTitle = product.title.toLowerCase().includes(q);
        const matchesBrand = product.brand.toLowerCase().includes(q);
        const matchesCategory = product.category.toLowerCase().includes(q);
        const matchesSubtitle = product.subtitle.toLowerCase().includes(q);
        const matchesSku = product.sku.toLowerCase().includes(q);
        if (
          !matchesTitle &&
          !matchesBrand &&
          !matchesCategory &&
          !matchesSubtitle &&
          !matchesSku
        ) {
          return false;
        }
      }
      return true;
    }).sort((a, b) => {
      switch (filters.sortBy) {
        case 'newest':
          return (
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          );
        case 'price-asc':
          return a.price - b.price;
        case 'price-desc':
          return b.price - a.price;
        case 'rating-desc':
          return b.rating - a.rating;
        case 'featured':
        default:
          return Number(b.isFeatured) - Number(a.isFeatured);
      }
    });
  }, [filters, activeTab]);

  const homeShowcaseProducts = useMemo(() => {
    if (homeShowcaseMode === 'featured') {
      return PRODUCTS.filter((p) => p.isFeatured).slice(0, 6);
    }
    return PRODUCTS.filter((p) => p.isNewArrival).slice(0, 6);
  }, [homeShowcaseMode]);

  const totalCartItems = useMemo(
    () => cart.reduce((sum, item) => sum + item.quantity, 0),
    [cart]
  );

  // Cart Handlers
  const handleAddToCart = (
    product: Product,
    quantity = 1,
    variant?: string
  ) => {
    const chosenVariant = variant || product.variants[0] || 'Standard Edition';
    setCart((prev) => {
      const existingIndex = prev.findIndex(
        (item) =>
          item.product.id === product.id &&
          item.selectedVariant === chosenVariant
      );
      if (existingIndex > -1) {
        const updated = [...prev];
        const nextQty = Math.min(
          product.stock,
          updated[existingIndex].quantity + quantity
        );
        updated[existingIndex] = {
          ...updated[existingIndex],
          quantity: nextQty,
        };
        return updated;
      }
      return [
        ...prev,
        {
          product,
          quantity: Math.min(product.stock, quantity),
          selectedVariant: chosenVariant,
        },
      ];
    });
    setToastMessage(`Added "${product.title}" to Shopping Bag`);
  };

  const handleBuyNow = (
    product: Product,
    quantity = 1,
    variant?: string
  ) => {
    handleAddToCart(product, quantity, variant);
    setInspectedProduct(null);
    setCartInitialStep('checkout');
    setIsCartOpen(true);
  };

  const handleUpdateCartQuantity = (
    productId: string,
    variant: string,
    delta: number
  ) => {
    setCart((prev) =>
      prev
        .map((item) => {
          if (
            item.product.id === productId &&
            item.selectedVariant === variant
          ) {
            const nextQty = Math.min(
              item.product.stock,
              item.quantity + delta
            );
            return nextQty > 0 ? { ...item, quantity: nextQty } : null;
          }
          return item;
        })
        .filter((item): item is CartItem => item !== null)
    );
  };

  const handleRemoveCartItem = (productId: string, variant: string) => {
    setCart((prev) =>
      prev.filter(
        (item) =>
          !(
            item.product.id === productId &&
            item.selectedVariant === variant
          )
      )
    );
  };

  const handleClearCart = () => {
    setCart([]);
    setPromoCode('');
  };

  const handlePlaceOrder = (customer: OrderCustomer) => {
    const summary = calculateCartSummary(
      cart,
      promoCode,
      customer.shippingMethod
    );
    const randomNum = Math.floor(1000 + Math.random() * 9000);
    const newOrder: Order = {
      id: `ORD-2026-${randomNum}`,
      invoiceNumber: `INV-AA-2026-${randomNum}`,
      createdAt: new Date().toISOString(),
      status: 'Confirmed',
      customer,
      items: [...cart],
      subtotal: summary.subtotal,
      productSavings: summary.productSavings,
      promoCode: summary.promoCode,
      promoDiscount: summary.promoDiscount,
      shippingCost: summary.shippingCost,
      grandTotal: summary.grandTotal,
    };

    setOrders((prev) => [newOrder, ...prev]);
    setSelectedOrderId(newOrder.id);
    setCart([]);
    setPromoCode('');
    setIsCartOpen(false);
    setActiveTab('orders');
    setToastMessage(
      `Order ${newOrder.id} confirmed! Official invoice ready to print.`
    );
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleUpdateOrderStatus = (orderId: string, status: OrderStatus) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
  };

  const handleDeleteOrder = (orderId: string) => {
    setOrders((prev) => {
      const remaining = prev.filter((o) => o.id !== orderId);
      if (selectedOrderId === orderId) {
        setSelectedOrderId(remaining[0]?.id || null);
      }
      return remaining;
    });
  };

  const navigateToCategory = (category: ProductCategory | 'All') => {
    setFilters((prev) => ({
      ...prev,
      category,
      searchQuery: '',
    }));
    setActiveTab('catalog');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const resetFilters = () => {
    setFilters({
      searchQuery: '',
      category: 'All',
      brand: 'All Brands',
      minPrice: 0,
      maxPrice: 4500,
      onlyInStock: false,
      sortBy: 'featured',
    });
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#FAF8F5] text-[#18181B]">
      {/* Top Navigation Bar */}
      <Navbar
        activeTab={activeTab}
        onSelectTab={(tab) => {
          setActiveTab(tab);
          if (tab === 'catalog') {
            setFilters((prev) => ({ ...prev, category: 'All' }));
          }
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onSelectWatches={() => navigateToCategory('Watches')}
        cartCount={totalCartItems}
        onOpenCart={() => {
          setCartInitialStep('cart');
          setIsCartOpen(true);
        }}
        orderCount={orders.length}
      />

      {/* Action Feedback Toast */}
      {toastMessage && (
        <div className="no-print fixed bottom-6 right-6 z-40 flex items-center gap-3 px-4 py-3 rounded-lg bg-[#18181B] text-[#FAF8F5] shadow-xl border border-[#3F3F46] text-xs font-medium">
          <CheckCircle2 className="w-4 h-4 text-[#C89D66] shrink-0" />
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => {
              setCartInitialStep('cart');
              setIsCartOpen(true);
              setToastMessage(null);
            }}
            className="underline text-[#C89D66] hover:text-white ml-2 whitespace-nowrap cursor-pointer"
          >
            View Bag
          </button>
        </div>
      )}

      {/* Main Content Router */}
      <main className="flex-1">
        {activeTab === 'orders' ? (
          <OrdersAndInvoiceView
            orders={orders}
            selectedOrderId={selectedOrderId}
            onSelectOrder={setSelectedOrderId}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onDeleteOrder={handleDeleteOrder}
            onContinueShopping={() => setActiveTab('catalog')}
          />
        ) : activeTab === 'home' ? (
          <>
            {/* SECTION 1: Storefront Hero (2-Column Split + Full-Width KPI Assurance Row) */}
            <section className="border-b border-[#E6E1D6]">
              <div className="max-w-[1360px] mx-auto px-6 py-10 md:py-14">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch">
                  {/* Left Editorial Column */}
                  <div className="lg:col-span-6 flex flex-col justify-between space-y-6 py-2">
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-xs font-medium text-[#9A6F38]">
                        <span>Geneva & Milan Atelier</span>
                        <span aria-hidden="true">·</span>
                        <span>Autumn / Winter 2026 Collection</span>
                      </div>

                      <h1
                        className="font-display font-bold text-[#18181B] tracking-tight leading-[1.08]"
                        style={{
                          fontSize: 'clamp(2.35rem, 4vw, 3.75rem)',
                          textWrap: 'balance',
                        }}
                      >
                        Precision Horology & Sartorial Permanence for the Modern Collector.
                      </h1>

                      <p className="text-base text-[#57534E] leading-relaxed max-w-[60ch]">
                        From Poinçon de Genève mechanical chronographs to double-faced Biella cashmere, English bridle leathergoods, and oak-aged extraits de parfum—each piece is individually numbered and regulated.
                      </p>
                    </div>

                    {/* Hero Search & Primary Actions */}
                    <div className="space-y-5 pt-2">
                      <div className="flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => navigateToCategory('All')}
                          className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Explore All Collections</span>
                          <ArrowRight className="w-4 h-4 text-[#C89D66]" />
                        </button>

                        <button
                          type="button"
                          onClick={() => setInspectedProduct(PRODUCTS[0])}
                          className="px-5 py-3 text-xs font-semibold text-[#18181B] bg-[#F5F2EB] border border-[#D4CFC3] rounded hover:border-[#18181B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          Inspect Overseas Calibre 5200
                        </button>
                      </div>

                      {/* Quick Category Links — Clean Unboxed Typography */}
                      <div className="pt-3 border-t border-[#E6E1D6] flex items-center flex-wrap gap-y-2 gap-x-3 text-xs text-[#57534E]">
                        <span className="font-semibold text-[#18181B]">
                          Departments:
                        </span>
                        {CATEGORIES_INFO.map((cat, idx) => (
                          <React.Fragment key={cat.name}>
                            <button
                              type="button"
                              onClick={() => navigateToCategory(cat.name)}
                              className="hover:text-[#9A6F38] underline decoration-[#D4CFC3] underline-offset-4 transition-colors cursor-pointer"
                            >
                              {cat.name}
                            </button>
                            {idx < CATEGORIES_INFO.length - 1 && (
                              <span aria-hidden="true">·</span>
                            )}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Right Hero Media Card */}
                  <div className="lg:col-span-6">
                    <div
                      onClick={() => setInspectedProduct(PRODUCTS[0])}
                      className="relative h-full min-h-[340px] rounded-lg overflow-hidden border border-[#DED8CC] bg-[#18181B] group cursor-pointer"
                    >
                      <ProductImage
                        src={GENERATED_ASSETS.heroChronograph}
                        alt="Overseas Calibre 5200 Rose Gold Chronograph"
                        category="Watches"
                        className="w-full h-full lg:h-full object-cover transition-transform duration-500 ease-out group-hover:scale-[1.02]"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-8">
                        <div className="flex items-end justify-between gap-4 text-[#FAF8F5]">
                          <div className="space-y-1">
                            <div className="text-xs text-[#D6B384] font-medium">
                              Flagship Timepiece · Vacheron & Sons
                            </div>
                            <div className="font-display text-2xl font-bold">
                              Overseas Calibre 5200 Rose Gold
                            </div>
                            <div className="text-xs text-[#D4D4D8]">
                              18K 5N Rose Gold · Column-Wheel Chronograph · 15 ATM
                            </div>
                          </div>
                          <div className="text-right shrink-0">
                            <div className="text-lg font-bold font-mono-tabular text-[#FAF8F5]">
                              {formatCurrency(PRODUCTS[0].price)}
                            </div>
                            <span className="text-xs text-[#D6B384] underline underline-offset-4">
                              Inspect Spec →
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Full-Width 4-Column Assurance & Provenance Strip Below Hero Split */}
                <div className="mt-10 pt-8 border-t border-[#E6E1D6] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  <div className="flex items-start gap-3">
                    <Award className="w-4 h-4 text-[#9A6F38] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">
                        COSC & Geneva Seal Certified
                      </div>
                      <p className="text-xs text-[#6E6A63] mt-0.5">
                        Regulated to -1/+2 seconds per day across 5 positions.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <ShieldCheck className="w-4 h-4 text-[#9A6F38] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">
                        5-Year International Warranty
                      </div>
                      <p className="text-xs text-[#6E6A63] mt-0.5">
                         serialized certificate & printable invoice with every order.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Truck className="w-4 h-4 text-[#9A6F38] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">
                        Complimentary Insured Courier
                      </div>
                      <p className="text-xs text-[#6E6A63] mt-0.5">
                        Free global delivery on orders over $500; COD supported.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-[#9A6F38] shrink-0 mt-0.5" />
                    <div>
                      <div className="text-xs font-semibold text-[#18181B]">
                        Persistent Local Vault
                      </div>
                      <p className="text-xs text-[#6E6A63] mt-0.5">
                        Shopping bag and client invoices saved in Local Storage.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* SECTION 2: Curated Departments & Featured / New Arrivals Collection */}
            <section className="max-w-[1360px] mx-auto px-6 py-14 space-y-12">
              {/* 5 Product Categories Row */}
              <div className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="text-xs font-medium text-[#9A6F38]">
                      Five Pillars of the Atelier
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-[#18181B]">
                      Shop by Department
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateToCategory('All')}
                    className="text-xs font-semibold text-[#18181B] hover:text-[#9A6F38] underline underline-offset-4 transition-colors self-start sm:self-auto cursor-pointer"
                  >
                    Browse Complete Catalog ({PRODUCTS.length} Items) →
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
                  {CATEGORIES_INFO.map((cat) => {
                    const count = PRODUCTS.filter(
                      (p) => p.category === cat.name
                    ).length;
                    return (
                      <button
                        key={cat.name}
                        type="button"
                        onClick={() => navigateToCategory(cat.name)}
                        className="group text-left bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg overflow-hidden hover:border-[#18181B] transition-all cursor-pointer flex flex-col justify-between"
                      >
                        <div className="aspect-[4/3] w-full bg-[#EBE6DC] overflow-hidden">
                          <ProductImage
                            src={cat.image}
                            alt={cat.name}
                            category={cat.name}
                            className="w-full h-full transition-transform duration-300 group-hover:scale-105"
                          />
                        </div>
                        <div className="p-4 space-y-1">
                          <div className="text-[11px] text-[#6E6A63]">
                            {cat.kicker} · {count} pieces
                          </div>
                          <div className="text-sm font-semibold text-[#18181B] group-hover:text-[#9A6F38] transition-colors flex items-center justify-between">
                            <span>{cat.name}</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Featured Products / New Arrivals 3-Column Grid */}
              <div className="space-y-8 pt-6 border-t border-[#E6E1D6]">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div className="space-y-1">
                    <div className="text-xs font-medium text-[#9A6F38]">
                      Curated Editions
                    </div>
                    <h2 className="font-display text-2xl md:text-3xl font-bold text-[#18181B]">
                      {homeShowcaseMode === 'featured'
                        ? 'Featured Atelier Creations'
                        : 'New Season Arrivals'}
                    </h2>
                  </div>

                  {/* Interactive Segmented Filter Control */}
                  <div className="flex items-center gap-1 p-1 bg-[#EBE6DC] rounded-lg self-start sm:self-auto">
                    <button
                      type="button"
                      onClick={() => setHomeShowcaseMode('featured')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        homeShowcaseMode === 'featured'
                          ? 'bg-[#FAF8F5] text-[#18181B] shadow-xs'
                          : 'text-[#57534E] hover:text-[#18181B]'
                      }`}
                    >
                      Featured Pieces
                    </button>
                    <button
                      type="button"
                      onClick={() => setHomeShowcaseMode('new')}
                      className={`px-3.5 py-1.5 text-xs font-semibold rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        homeShowcaseMode === 'new'
                          ? 'bg-[#FAF8F5] text-[#18181B] shadow-xs'
                          : 'text-[#57534E] hover:text-[#18181B]'
                      }`}
                    >
                      New Arrivals
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {homeShowcaseProducts.map((product) => (
                    <ProductCard
                      key={product.id}
                      product={product}
                      onInspect={setInspectedProduct}
                      onAddToCart={(p) => handleAddToCart(p, 1)}
                      onBuyNow={(p) => handleBuyNow(p, 1)}
                    />
                  ))}
                </div>

                <div className="flex justify-center pt-2">
                  <button
                    type="button"
                    onClick={() => navigateToCategory('All')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-xs font-semibold text-[#18181B] bg-[#F5F2EB] border border-[#18181B] rounded hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                  >
                    <span>Explore Full Catalog & Advanced Filters</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </section>

            {/* SECTION 3: Craftsmanship & Quantitative Provenance Proof */}
            <section className="bg-[#F2EFE9] border-t border-[#E6E1D6] py-14">
              <div className="max-w-[1360px] mx-auto px-6 grid grid-cols-1 lg:grid-cols-12 gap-10 items-center">
                <div className="lg:col-span-7 space-y-4">
                  <div className="text-xs font-medium text-[#9A6F38]">
                    01. Horological & Sartorial Standard
                  </div>
                  <h2
                    className="font-display text-2xl md:text-4xl font-bold text-[#18181B] leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    Uncompromising Material Integrity, Verified to the Micron.
                  </h2>
                  <p className="text-sm text-[#57534E] leading-relaxed max-w-[65ch]">
                    Unlike mass-market luxury retailers, Aurelius Atelier sources directly from family-owned Swiss movement manufactures in Le Brassus, cashmere mills in Biella, and oak-bark bridle tanneries in Walsall. Every acquisition generates an immediate, print-ready commercial invoice and provenance record.
                  </p>

                  <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#DED8CC]">
                    <div>
                      <div className="text-xl md:text-2xl font-bold font-mono-tabular text-[#18181B]">
                        99.98%
                      </div>
                      <div className="text-xs text-[#6E6A63] mt-0.5">
                        Chronometric Isochronism Rate (-1/+2 sec/day)
                      </div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold font-mono-tabular text-[#18181B]">
                        15.5 μm
                      </div>
                      <div className="text-xs text-[#6E6A63] mt-0.5">
                        Ultra-Fine Biella Cashmere & Mulberry Silk Fiber
                      </div>
                    </div>
                    <div>
                      <div className="text-xl md:text-2xl font-bold font-mono-tabular text-[#18181B]">
                        5 Years
                      </div>
                      <div className="text-xs text-[#6E6A63] mt-0.5">
                        Transferable International Movement Guarantee
                      </div>
                    </div>
                  </div>
                </div>

                {/* Attributable Collector Testimonial */}
                <div className="lg:col-span-5 bg-[#FAF8F5] border border-[#E5E0D5] rounded-lg p-6 md:p-8 space-y-4">
                  <p className="font-display italic text-lg md:text-xl text-[#18181B] leading-relaxed">
                    “Prior to Aurelius Atelier, sourcing a Geneva-hallmarked rose gold chronograph alongside bespoke Italian cashmere required separate private appointments in Zurich and Milan. My Overseas Calibre 5200 arrived in 36 hours with a complete chronometric certificate and itemized VAT invoice.”
                  </p>
                  <div className="pt-3 border-t border-[#E5E0D5] text-xs">
                    <div className="font-semibold text-[#18181B]">
                      Dr. Henrik Lindqvist
                    </div>
                    <div className="text-[#6E6A63]">
                      Managing Partner, Nordisk Horology Fund · Stockholm
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </>
        ) : (
          /* CATALOG & NEW ARRIVALS VIEW WITH ADVANCED SEARCH & FILTERS */
          <section className="max-w-[1360px] mx-auto px-6 py-10 space-y-8">
            {/* Catalog Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 pb-6 border-b border-[#E5E0D5]">
              <div className="space-y-1">
                <div className="text-xs font-medium text-[#9A6F38]">
                  {activeTab === 'new-arrivals'
                    ? 'Autumn / Winter 2026 Releases'
                    : 'Complete Atelier Archive'}
                </div>
                <h1 className="font-display text-3xl md:text-4xl font-bold text-[#18181B]">
                  {activeTab === 'new-arrivals'
                    ? 'New Season Arrivals'
                    : filters.category === 'All'
                    ? 'Watches & Sartorial Menswear'
                    : filters.category}
                </h1>
              </div>

              <div className="text-xs text-[#57534E] font-mono-tabular">
                Showing {filteredProducts.length} of {PRODUCTS.length} pieces
              </div>
            </div>

            {/* Advanced Search & Filter Bar */}
            <div className="bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg p-5 space-y-5">
              {/* Top Row: Search Input, Brand Select, Sort Select */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                {/* Search Input */}
                <div className="md:col-span-5 relative">
                  <Search className="w-4 h-4 text-[#8C867B] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="search"
                    value={filters.searchQuery}
                    onChange={(e) =>
                      setFilters({ ...filters, searchQuery: e.target.value })
                    }
                    placeholder="Search watch model, cashmere, leather, SKU..."
                    className="w-full pl-10 pr-4 py-2 text-xs bg-[#FAF8F5] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                {/* Brand Filter */}
                <div className="md:col-span-3">
                  <select
                    aria-label="Filter by Brand"
                    value={filters.brand}
                    onChange={(e) =>
                      setFilters({ ...filters, brand: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B] text-[#18181B]"
                  >
                    {brands.map((b) => (
                      <option key={b} value={b}>
                        {b === 'All Brands' ? 'All Atelier Maisons' : b}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Sorting Select */}
                <div className="md:col-span-4">
                  <select
                    aria-label="Sort products by"
                    value={filters.sortBy}
                    onChange={(e) =>
                      setFilters({
                        ...filters,
                        sortBy: e.target.value as SortOption,
                      })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#FAF8F5] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B] text-[#18181B]"
                  >
                    <option value="featured">Sort: Featured Curations</option>
                    <option value="newest">Sort: Newest Arrivals First</option>
                    <option value="price-asc">Sort: Price (Low to High)</option>
                    <option value="price-desc">Sort: Price (High to Low)</option>
                    <option value="rating-desc">Sort: Highest Collector Rating</option>
                  </select>
                </div>
              </div>

              {/* Bottom Row: Category Tabs, Price Ceiling Slider, In-Stock Toggle, Reset */}
              <div className="pt-4 border-t border-[#E5E0D5] flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                {/* Category Buttons */}
                <div className="flex items-center flex-wrap gap-1.5">
                  {ALL_CATEGORIES.map((category) => (
                    <button
                      key={category}
                      type="button"
                      onClick={() => setFilters({ ...filters, category })}
                      className={`px-3 py-1.5 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        filters.category === category
                          ? 'bg-[#18181B] text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#57534E] border border-[#D4CFC3] hover:text-[#18181B]'
                      }`}
                    >
                      {category}
                    </button>
                  ))}
                </div>

                {/* Price Range & Stock Controls */}
                <div className="flex flex-wrap items-center gap-5 text-xs">
                  <div className="flex items-center gap-3">
                    <SlidersHorizontal className="w-3.5 h-3.5 text-[#9A6F38]" />
                    <label
                      htmlFor="max-price-slider"
                      className="text-[#57534E] whitespace-nowrap"
                    >
                      Max Price:{' '}
                      <span className="font-semibold font-mono-tabular text-[#18181B]">
                        {formatCurrency(filters.maxPrice)}
                      </span>
                    </label>
                    <input
                      id="max-price-slider"
                      type="range"
                      min={150}
                      max={4500}
                      step={50}
                      value={filters.maxPrice}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          maxPrice: Number(e.target.value),
                        })
                      }
                      className="w-28 accent-[#18181B] cursor-pointer"
                    />
                  </div>

                  <label className="inline-flex items-center gap-2 text-[#18181B] cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={filters.onlyInStock}
                      onChange={(e) =>
                        setFilters({
                          ...filters,
                          onlyInStock: e.target.checked,
                        })
                      }
                      className="rounded accent-[#18181B]"
                    />
                    <span>In-Stock Only</span>
                  </label>

                  <button
                    type="button"
                    onClick={resetFilters}
                    className="inline-flex items-center gap-1 text-[#6E6A63] hover:text-[#18181B] underline underline-offset-4 transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Reset</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Product Listing Grid */}
            {filteredProducts.length === 0 ? (
              <div className="py-16 text-center bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg space-y-4">
                <p className="text-base font-semibold text-[#18181B]">
                  No pieces match your current filter criteria
                </p>
                <p className="text-xs text-[#6E6A63] max-w-md mx-auto">
                  Try expanding your maximum price ceiling or clearing your search query to view all available timepieces and sartorial items.
                </p>
                <button
                  type="button"
                  onClick={resetFilters}
                  className="px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors cursor-pointer"
                >
                  Reset All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onInspect={setInspectedProduct}
                    onAddToCart={(p) => handleAddToCart(p, 1)}
                    onBuyNow={(p) => handleBuyNow(p, 1)}
                  />
                ))}
              </div>
            )}
          </section>
        )}
      </main>

      {/* Quiet Editorial Footer */}
      <footer className="no-print bg-[#FAF8F5] border-t border-[#E6E1D6] py-12 mt-16">
        <div className="max-w-[1360px] mx-auto px-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-8">
          <div className="space-y-1.5">
            <div className="font-display text-xl font-bold text-[#18181B]">
              Aurelius Atelier
            </div>
            <p className="text-xs text-[#6E6A63]">
              Geneva · Milan · London — Watches, Sartorial Menswear, Bridle Leather & Haute Parfumerie.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-6 text-xs text-[#57534E]">
            {CATEGORIES_INFO.map((cat) => (
              <button
                key={cat.name}
                type="button"
                onClick={() => navigateToCategory(cat.name)}
                className="hover:text-[#18181B] transition-colors cursor-pointer"
              >
                {cat.name}
              </button>
            ))}
            <button
              type="button"
              onClick={() => {
                setActiveTab('orders');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="hover:text-[#18181B] transition-colors cursor-pointer"
            >
              Order Lookup & Invoices
            </button>
          </div>

          <div className="text-xs text-[#8C867B] font-mono-tabular">
            © {new Date().getFullYear()} Aurelius Atelier S.A.
          </div>
        </div>
      </footer>

      {/* Product Detail Contiguous Purchase Modal */}
      <ProductDetailModal
        product={inspectedProduct}
        onClose={() => setInspectedProduct(null)}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
      />

      {/* Shopping Bag & Private Client Checkout Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        initialStep={cartInitialStep}
        onClose={() => setIsCartOpen(false)}
        cart={cart}
        promoCode={promoCode}
        onApplyPromo={setPromoCode}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
        onClearCart={handleClearCart}
        onPlaceOrder={handlePlaceOrder}
      />
    </div>
  );
}
