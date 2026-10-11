import React from 'react';
import { ShoppingBag } from 'lucide-react';

export type ActiveTab = 'home' | 'catalog' | 'new-arrivals' | 'orders';

interface NavbarProps {
  activeTab: ActiveTab;
  onSelectTab: (tab: ActiveTab) => void;
  onSelectWatches: () => void;
  cartCount: number;
  onOpenCart: () => void;
  orderCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeTab,
  onSelectTab,
  onSelectWatches,
  cartCount,
  onOpenCart,
  orderCount,
}) => {
  return (
    <header className="sticky top-0 z-30 bg-[#FAF8F5]/95 backdrop-blur-md border-b border-[#E6E1D6] no-print">
      <div className="max-w-[1360px] mx-auto flex items-center justify-between gap-8 px-6 py-4">
        {/* Zone 1: Single text element wordmark */}
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className="font-display text-2xl font-bold tracking-tight text-[#18181B] whitespace-nowrap shrink-0 text-left focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#9A6F38] cursor-pointer"
        >
          Aurelius Atelier
        </button>

        {/* Zone 2: 4–5 clean single-line text navigation links */}
        <nav
          aria-label="Primary Navigation"
          className="hidden md:flex items-center gap-7 text-sm font-medium text-[#57534E]"
        >
          <button
            type="button"
            onClick={() => onSelectTab('home')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'home'
                ? 'text-[#18181B] border-[#18181B]'
                : 'border-transparent hover:text-[#18181B] hover:border-[#D6D0C4]'
            }`}
          >
            Storefront
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('catalog')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'catalog'
                ? 'text-[#18181B] border-[#18181B]'
                : 'border-transparent hover:text-[#18181B] hover:border-[#D6D0C4]'
            }`}
          >
            All Collections
          </button>
          <button
            type="button"
            onClick={onSelectWatches}
            className="py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 border-transparent hover:text-[#18181B] hover:border-[#D6D0C4] cursor-pointer"
          >
            Horology
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('new-arrivals')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'new-arrivals'
                ? 'text-[#18181B] border-[#18181B]'
                : 'border-transparent hover:text-[#18181B] hover:border-[#D6D0C4]'
            }`}
          >
            New Arrivals
          </button>
          <button
            type="button"
            onClick={() => onSelectTab('orders')}
            className={`py-1 transition-colors whitespace-nowrap shrink-0 border-b-2 cursor-pointer ${
              activeTab === 'orders'
                ? 'text-[#18181B] border-[#18181B]'
                : 'border-transparent hover:text-[#18181B] hover:border-[#D6D0C4]'
            }`}
          >
            Orders ({orderCount})
          </button>
        </nav>

        {/* Zone 3: 1 primary action */}
        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onOpenCart}
            className="inline-flex items-center gap-2.5 px-4 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded-md hover:bg-[#27272A] transition-colors whitespace-nowrap shrink-0 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#9A6F38]"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-[#C89D66]" />
            <span>Shopping Bag ({cartCount})</span>
          </button>
        </div>
      </div>

      {/* Mobile compact navigation strip */}
      <div className="flex md:hidden items-center justify-between gap-4 px-6 py-2.5 border-t border-[#E6E1D6] overflow-x-auto text-xs font-medium text-[#57534E]">
        <button
          type="button"
          onClick={() => onSelectTab('home')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'home' ? 'text-[#18181B] font-semibold underline underline-offset-4' : ''
          }`}
        >
          Storefront
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('catalog')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'catalog' ? 'text-[#18181B] font-semibold underline underline-offset-4' : ''
          }`}
        >
          Catalog
        </button>
        <button
          type="button"
          onClick={onSelectWatches}
          className="whitespace-nowrap shrink-0"
        >
          Horology
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('new-arrivals')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'new-arrivals' ? 'text-[#18181B] font-semibold underline underline-offset-4' : ''
          }`}
        >
          New Arrivals
        </button>
        <button
          type="button"
          onClick={() => onSelectTab('orders')}
          className={`whitespace-nowrap shrink-0 ${
            activeTab === 'orders' ? 'text-[#18181B] font-semibold underline underline-offset-4' : ''
          }`}
        >
          Orders ({orderCount})
        </button>
      </div>
    </header>
  );
};
