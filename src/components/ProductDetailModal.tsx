import React, { useState, useEffect } from 'react';
import { X, Star, Minus, Plus, ShieldCheck, Truck } from 'lucide-react';
import { Product } from '../types/store';
import { formatCurrency } from '../utils/storage';
import { ProductImage } from './ProductImage';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onAddToCart: (product: Product, quantity: number, variant: string) => void;
  onBuyNow: (product: Product, quantity: number, variant: string) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onAddToCart,
  onBuyNow,
}) => {
  const [selectedVariant, setSelectedVariant] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);

  useEffect(() => {
    if (product) {
      setSelectedVariant(product.variants[0] || 'Standard Edition');
      setQuantity(1);
    }
  }, [product]);

  if (!product) return null;

  const isOutOfStock = product.stock <= 0;
  const discountAmount =
    product.oldPrice && product.oldPrice > product.price
      ? product.oldPrice - product.price
      : 0;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 md:p-6 overflow-y-auto no-print"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pdp-modal-title"
    >
      <div className="relative w-full max-w-4xl bg-[#FAF8F5] border border-[#DED8CC] rounded-lg overflow-hidden my-auto">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          aria-label="Close product details"
          className="absolute top-4 right-4 z-10 p-2 rounded-md bg-[#FAF8F5]/90 text-[#18181B] border border-[#DED8CC] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 items-stretch">
          {/* Left: Gallery Column */}
          <div className="md:col-span-6 bg-[#EBE6DC] flex flex-col justify-between">
            <div className="aspect-[4/3] md:aspect-auto md:h-full w-full overflow-hidden">
              <ProductImage
                src={product.image}
                alt={product.title}
                category={product.category}
                imageFocus={product.imageFocus}
                className="w-full h-full"
              />
            </div>
          </div>

          {/* Right: Contiguous Purchase Module */}
          <div className="md:col-span-6 p-6 md:p-8 flex flex-col justify-between gap-6 max-h-[85vh] overflow-y-auto">
            <div className="space-y-4">
              {/* Unboxed Metadata Line */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-[#6E6A63]">
                <span className="font-semibold text-[#18181B]">{product.brand}</span>
                <span aria-hidden="true">·</span>
                <span>{product.category}</span>
                <span aria-hidden="true">·</span>
                <span className="font-mono-tabular">SKU: {product.sku}</span>
              </div>

              <h2
                id="pdp-modal-title"
                className="font-display text-2xl md:text-3xl font-bold text-[#18181B] leading-tight"
              >
                {product.title}
              </h2>

              <p className="text-xs font-medium text-[#6E6A63]">{product.subtitle}</p>

              {/* Rating & Availability */}
              <div className="flex items-center flex-wrap gap-2 text-xs text-[#57534E]">
                <span className="inline-flex items-center gap-1 font-semibold text-[#18181B]">
                  <Star className="w-3.5 h-3.5 fill-[#9A6F38] text-[#9A6F38]" />
                  <span className="font-mono-tabular">{product.rating.toFixed(1)}</span>
                </span>
                <span>({product.reviewCount} verified collectors)</span>
                <span aria-hidden="true">·</span>
                <span
                  className={
                    isOutOfStock
                      ? 'text-[#991B1B] font-semibold'
                      : 'text-[#3F6212] font-semibold'
                  }
                >
                  {isOutOfStock
                    ? 'Currently Unavailable'
                    : `${product.stock} Allocated in Vault`}
                </span>
              </div>

              {/* Price Block */}
              <div className="pt-2 pb-3 border-b border-[#E5E0D5] flex items-baseline gap-3">
                <span className="text-2xl font-bold font-mono-tabular text-[#18181B]">
                  {formatCurrency(product.price)}
                </span>
                {product.oldPrice && product.oldPrice > product.price && (
                  <>
                    <span className="text-sm font-mono-tabular text-[#8C867B] line-through">
                      {formatCurrency(product.oldPrice)}
                    </span>
                    <span className="text-xs font-semibold font-mono-tabular text-[#9A6F38]">
                      Save {formatCurrency(discountAmount)}
                    </span>
                  </>
                )}
              </div>

              {/* Editorial Description */}
              <p className="text-sm text-[#44403C] leading-relaxed">
                {product.description}
              </p>

              {/* Variant Selector */}
              {product.variants.length > 0 && (
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-semibold text-[#18181B]">
                    Configuration: <span className="font-normal text-[#57534E]">{selectedVariant}</span>
                  </label>
                  <div className="flex flex-wrap gap-2">
                    {product.variants.map((variant) => (
                      <button
                        key={variant}
                        type="button"
                        onClick={() => setSelectedVariant(variant)}
                        className={`px-3 py-1.5 text-xs font-medium rounded border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          selectedVariant === variant
                            ? 'bg-[#18181B] text-[#FAF8F5] border-[#18181B]'
                            : 'bg-[#F5F2EB] text-[#44403C] border-[#D4CFC3] hover:border-[#18181B]'
                        }`}
                      >
                        {variant}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Technical Specifications */}
              <div className="pt-3 border-t border-[#E5E0D5] space-y-2">
                <h3 className="text-xs font-semibold text-[#18181B]">
                  Atelier Specifications
                </h3>
                <dl className="grid grid-cols-1 gap-1.5 text-xs">
                  {product.specifications.map((spec) => (
                    <div
                      key={spec.label}
                      className="flex items-baseline justify-between gap-4 py-1 border-b border-[#EFECE4]"
                    >
                      <dt className="text-[#6E6A63]">{spec.label}</dt>
                      <dd className="text-[#18181B] font-medium text-right">
                        {spec.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            </div>

            {/* Contiguous Purchase Controls */}
            <div className="pt-4 border-t border-[#E5E0D5] space-y-4">
              <div className="flex items-center gap-3">
                {/* Quantity Stepper */}
                <div className="inline-flex items-center border border-[#D4CFC3] rounded bg-[#F5F2EB]">
                  <button
                    type="button"
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    aria-label="Decrease quantity"
                    className="p-2.5 text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                  >
                    <Minus className="w-3.5 h-3.5" />
                  </button>
                  <span className="px-4 text-xs font-semibold font-mono-tabular text-[#18181B]">
                    {quantity}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setQuantity((q) => Math.min(product.stock, q + 1))
                    }
                    aria-label="Increase quantity"
                    className="p-2.5 text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                  </button>
                </div>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    onAddToCart(product, quantity, selectedVariant);
                    onClose();
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-[#18181B] bg-[#FAF8F5] border border-[#18181B] rounded hover:bg-[#EBE6DC] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Add to Bag
                </button>

                <button
                  type="button"
                  disabled={isOutOfStock}
                  onClick={() => {
                    onBuyNow(product, quantity, selectedVariant);
                  }}
                  className="flex-1 px-4 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  Buy Now · {formatCurrency(product.price * quantity)}
                </button>
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#6E6A63]">
                <span className="inline-flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-[#9A6F38]" />
                  5-Year International Atelier Warranty
                </span>
                <span className="inline-flex items-center gap-1.5">
                  <Truck className="w-3.5 h-3.5 text-[#9A6F38]" />
                  Complimentary Insured Delivery over $500
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
