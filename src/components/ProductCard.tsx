import React from 'react';
import { Star } from 'lucide-react';
import { Product } from '../types/store';
import { formatCurrency } from '../utils/storage';
import { ProductImage } from './ProductImage';

interface ProductCardProps {
  product: Product;
  onInspect: (product: Product) => void;
  onAddToCart: (product: Product) => void;
  onBuyNow: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onInspect,
  onAddToCart,
  onBuyNow,
}) => {
  const isOutOfStock = product.stock <= 0;
  const discountPercentage =
    product.oldPrice && product.oldPrice > product.price
      ? Math.round(((product.oldPrice - product.price) / product.oldPrice) * 100)
      : null;

  return (
    <article className="group flex flex-col bg-[#F5F2EB] border border-[#E5E0D5] rounded-lg overflow-hidden transition-transform duration-150 ease-out hover:-translate-y-0.5">
      {/* Product Imagery Slot — 4:3 uniform aspect ratio */}
      <div
        onClick={() => onInspect(product)}
        className="relative aspect-[4/3] w-full bg-[#EBE6DC] overflow-hidden cursor-pointer"
      >
        <ProductImage
          src={product.image}
          alt={product.title}
          category={product.category}
          imageFocus={product.imageFocus}
          className="w-full h-full transition-transform duration-300 ease-out group-hover:scale-[1.03]"
        />
      </div>

      {/* Content & Purchase Area */}
      <div className="flex flex-col flex-1 p-5 justify-between gap-4">
        <div className="space-y-1.5">
          {/* Clean Unboxed Metadata Line — Zero-Pill Discipline */}
          <div className="flex items-center flex-wrap gap-1.5 text-xs text-[#6E6A63]">
            <span className="font-medium text-[#18181B]">{product.brand}</span>
            <span aria-hidden="true">·</span>
            <span>{product.category}</span>
            <span aria-hidden="true">·</span>
            <span
              className={
                isOutOfStock
                  ? 'text-[#991B1B] font-medium'
                  : product.stock <= 5
                  ? 'text-[#9A6F38] font-medium'
                  : 'text-[#3F6212]'
              }
            >
              {isOutOfStock
                ? 'Out of Stock'
                : product.stock <= 5
                ? `Only ${product.stock} Left`
                : `In Stock (${product.stock})`}
            </span>
          </div>

          {/* Product Name in 16px SemiBold */}
          <h3 className="text-base font-semibold text-[#18181B] leading-snug">
            <button
              type="button"
              onClick={() => onInspect(product)}
              className="text-left hover:text-[#9A6F38] transition-colors line-clamp-1 cursor-pointer"
            >
              {product.title}
            </button>
          </h3>

          {/* Quiet Subtitle */}
          <p className="text-xs text-[#6E6A63] line-clamp-1">{product.subtitle}</p>

          {/* Rating & SKU Metadata — Unboxed Text */}
          <div className="flex items-center gap-2 pt-1 text-xs text-[#57534E]">
            <span className="inline-flex items-center gap-1 font-medium text-[#18181B]">
              <Star className="w-3.5 h-3.5 fill-[#9A6F38] text-[#9A6F38]" />
              <span className="font-mono-tabular">{product.rating.toFixed(1)}</span>
            </span>
            <span>({product.reviewCount} reviews)</span>
            {product.isNewArrival && (
              <>
                <span aria-hidden="true">·</span>
                <span className="text-[#9A6F38] font-medium">New Arrival</span>
              </>
            )}
          </div>
        </div>

        {/* Pricing & Action Controls */}
        <div className="pt-3 border-t border-[#E5E0D5] space-y-3">
          <div className="flex items-baseline justify-between gap-2">
            <div className="flex items-baseline gap-2">
              <span className="text-[15px] font-semibold font-mono-tabular text-[#18181B]">
                {formatCurrency(product.price)}
              </span>
              {product.oldPrice && product.oldPrice > product.price && (
                <span className="text-xs font-mono-tabular text-[#8C867B] line-through">
                  {formatCurrency(product.oldPrice)}
                </span>
              )}
            </div>
            {discountPercentage && (
              <span className="text-xs font-medium font-mono-tabular text-[#9A6F38]">
                Save {discountPercentage}%
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onAddToCart(product)}
              className="px-3.5 py-2 text-xs font-semibold text-[#18181B] bg-[#FAF8F5] border border-[#D4CFC3] rounded hover:border-[#18181B] hover:bg-[#EBE6DC]/60 disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Add to Bag
            </button>
            <button
              type="button"
              disabled={isOutOfStock}
              onClick={() => onBuyNow(product)}
              className="px-3.5 py-2 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] disabled:opacity-40 disabled:pointer-events-none transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </article>
  );
};
