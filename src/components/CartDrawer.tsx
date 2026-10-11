import React, { useState } from 'react';
import {
  X,
  Trash2,
  Minus,
  Plus,
  ShoppingBag,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { CartItem, OrderCustomer } from '../types/store';
import { calculateCartSummary, formatCurrency } from '../utils/storage';
import { PROMO_CODES } from '../data/products';
import { ProductImage } from './ProductImage';

interface CartDrawerProps {
  isOpen: boolean;
  initialStep?: 'cart' | 'checkout';
  onClose: () => void;
  cart: CartItem[];
  promoCode: string;
  onApplyPromo: (code: string) => void;
  onUpdateQuantity: (productId: string, variant: string, delta: number) => void;
  onRemoveItem: (productId: string, variant: string) => void;
  onClearCart: () => void;
  onPlaceOrder: (customer: OrderCustomer) => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  initialStep = 'cart',
  onClose,
  cart,
  promoCode,
  onApplyPromo,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
  onPlaceOrder,
}) => {
  const [step, setStep] = useState<'cart' | 'checkout'>(initialStep);
  const [promoInput, setPromoInput] = useState(promoCode);
  const [promoFeedback, setPromoFeedback] = useState<string>('');

  const [customer, setCustomer] = useState<OrderCustomer>({
    fullName: 'Alexander Sterling',
    email: 'a.sterling@privateclient.com',
    phone: '+1 (212) 555-0194',
    address: '725 Fifth Avenue, Suite 1800',
    city: 'New York',
    postalCode: '10022',
    country: 'United States',
    paymentMethod: 'Card',
    shippingMethod: 'Standard Insured',
    notes: '',
  });

  const [formError, setFormError] = useState<string>('');

  React.useEffect(() => {
    setStep(initialStep);
  }, [initialStep, isOpen]);

  React.useEffect(() => {
    setPromoInput(promoCode);
  }, [promoCode]);

  if (!isOpen) return null;

  const summary = calculateCartSummary(cart, promoCode, customer.shippingMethod);

  const handlePromoSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleaned = promoInput.trim().toUpperCase();
    if (!cleaned) {
      onApplyPromo('');
      setPromoFeedback('');
      return;
    }
    if (PROMO_CODES[cleaned]) {
      onApplyPromo(cleaned);
      setPromoFeedback(`Applied: ${PROMO_CODES[cleaned].description}`);
    } else {
      setPromoFeedback('Invalid code. Try ATELIER10 or HOROLOGY15.');
    }
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (
      !customer.fullName.trim() ||
      !customer.email.trim() ||
      !customer.phone.trim() ||
      !customer.address.trim() ||
      !customer.city.trim() ||
      !customer.postalCode.trim()
    ) {
      setFormError('Please complete all required recipient and delivery fields.');
      return;
    }
    setFormError('');
    onPlaceOrder(customer);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs no-print"
      role="dialog"
      aria-modal="true"
      aria-label="Shopping Bag and Checkout"
    >
      <div className="relative w-full max-w-lg bg-[#FAF8F5] h-full flex flex-col justify-between border-l border-[#DED8CC] shadow-2xl">
        {/* Drawer Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-[#E5E0D5]">
          <div className="flex items-center gap-3">
            {step === 'checkout' && (
              <button
                type="button"
                onClick={() => setStep('cart')}
                className="p-1.5 rounded text-[#57534E] hover:text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                aria-label="Back to shopping bag"
              >
                <ArrowLeft className="w-4 h-4" />
              </button>
            )}
            <div>
              <h2 className="font-display text-xl font-bold text-[#18181B]">
                {step === 'cart' ? 'Atelier Shopping Bag' : 'Private Client Checkout'}
              </h2>
              <p className="text-xs text-[#6E6A63]">
                {cart.reduce((sum, i) => sum + i.quantity, 0)} items allocated · Saved in Local Storage
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close drawer"
            className="p-2 rounded text-[#57534E] hover:text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Drawer Body */}
        <div className="flex-1 overflow-y-auto px-6 py-5">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="w-12 h-12 rounded-full bg-[#EBE6DC] flex items-center justify-center text-[#9A6F38]">
                <ShoppingBag className="w-5 h-5" />
              </div>
              <div className="space-y-1 max-w-xs">
                <h3 className="text-base font-semibold text-[#18181B]">
                  Your Shopping Bag is Empty
                </h3>
                <p className="text-xs text-[#6E6A63] leading-relaxed">
                  Explore our Swiss chronographs, Italian cashmere tailoring, bridle leathergoods, and extraits de parfum.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors cursor-pointer"
              >
                Explore Collection
              </button>
            </div>
          ) : step === 'cart' ? (
            <div className="space-y-6">
              {/* Itemized List */}
              <div className="divide-y divide-[#E5E0D5]">
                {cart.map((item) => {
                  const itemKey = `${item.product.id}-${item.selectedVariant}`;
                  return (
                    <div key={itemKey} className="py-4 first:pt-0 flex gap-4">
                      <div className="w-20 h-20 rounded bg-[#EBE6DC] overflow-hidden shrink-0 border border-[#E5E0D5]">
                        <ProductImage
                          src={item.product.image}
                          alt={item.product.title}
                          category={item.product.category}
                          imageFocus={item.product.imageFocus}
                          className="w-full h-full"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="text-sm font-semibold text-[#18181B] truncate">
                              {item.product.title}
                            </h4>
                            <button
                              type="button"
                              onClick={() =>
                                onRemoveItem(item.product.id, item.selectedVariant)
                              }
                              aria-label={`Remove ${item.product.title}`}
                              className="text-[#8C867B] hover:text-[#991B1B] transition-colors p-0.5 cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                          <p className="text-xs text-[#6E6A63]">
                            {item.product.brand} · {item.selectedVariant}
                          </p>
                        </div>

                        <div className="flex items-center justify-between pt-2">
                          <div className="inline-flex items-center border border-[#D4CFC3] rounded bg-[#F5F2EB]">
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.selectedVariant,
                                  -1
                                )
                              }
                              className="p-1.5 text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                              aria-label="Decrease item quantity"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="px-2.5 text-xs font-semibold font-mono-tabular">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() =>
                                onUpdateQuantity(
                                  item.product.id,
                                  item.selectedVariant,
                                  1
                                )
                              }
                              className="p-1.5 text-[#18181B] hover:bg-[#EBE6DC] transition-colors cursor-pointer"
                              aria-label="Increase item quantity"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>

                          <div className="text-right">
                            <span className="text-sm font-semibold font-mono-tabular text-[#18181B]">
                              {formatCurrency(item.product.price * item.quantity)}
                            </span>
                            {item.product.oldPrice && (
                              <span className="block text-[11px] font-mono-tabular text-[#8C867B] line-through">
                                {formatCurrency(item.product.oldPrice * item.quantity)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Promo Code Box */}
              <div className="p-4 rounded-lg bg-[#F5F2EB] border border-[#E5E0D5] space-y-2.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-[#18181B]">
                    Privilege / Promo Code
                  </span>
                  <div className="flex items-center gap-2 text-[#9A6F38]">
                    <button
                      type="button"
                      onClick={() => {
                        setPromoInput('ATELIER10');
                        onApplyPromo('ATELIER10');
                        setPromoFeedback('Applied: 10% Private Client Privilege');
                      }}
                      className="underline hover:text-[#18181B] cursor-pointer"
                    >
                      Use ATELIER10
                    </button>
                    <span>·</span>
                    <button
                      type="button"
                      onClick={() => {
                        setPromoInput('HOROLOGY15');
                        onApplyPromo('HOROLOGY15');
                        setPromoFeedback('Applied: 15% Collector Society Benefit');
                      }}
                      className="underline hover:text-[#18181B] cursor-pointer"
                    >
                      Use HOROLOGY15
                    </button>
                  </div>
                </div>

                <form onSubmit={handlePromoSubmit} className="flex gap-2">
                  <input
                    type="text"
                    value={promoInput}
                    onChange={(e) => setPromoInput(e.target.value)}
                    placeholder="Enter code (e.g. ATELIER10)"
                    className="flex-1 px-3 py-1.5 text-xs bg-[#FAF8F5] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B] font-mono-tabular uppercase"
                  />
                  <button
                    type="submit"
                    className="px-3.5 py-1.5 text-xs font-semibold text-[#18181B] bg-[#EBE6DC] hover:bg-[#DED8CC] rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Apply
                  </button>
                </form>

                {promoFeedback && (
                  <p className="text-[11px] text-[#57534E]">{promoFeedback}</p>
                )}
              </div>

              {/* Clear Bag utility */}
              <div className="flex justify-end">
                <button
                  type="button"
                  onClick={onClearCart}
                  className="text-xs text-[#8C867B] hover:text-[#991B1B] underline underline-offset-4 transition-colors cursor-pointer"
                >
                  Empty Shopping Bag
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Form Step */
            <form
              id="checkout-form"
              onSubmit={handleCheckoutSubmit}
              className="space-y-5"
            >
              {formError && (
                <div className="p-3 rounded bg-[#FEF2F2] border border-[#FECACA] text-xs text-[#991B1B]">
                  {formError}
                </div>
              )}

              <div className="space-y-3">
                <h3 className="text-xs font-semibold text-[#18181B] border-b border-[#E5E0D5] pb-1.5">
                  1. Recipient & Dispatch Details
                </h3>

                <div>
                  <label className="block text-xs font-medium text-[#44403C] mb-1">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.fullName}
                    onChange={(e) =>
                      setCustomer({ ...customer, fullName: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#44403C] mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={customer.email}
                      onChange={(e) =>
                        setCustomer({ ...customer, email: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#44403C] mb-1">
                      Telephone *
                    </label>
                    <input
                      type="tel"
                      required
                      value={customer.phone}
                      onChange={(e) =>
                        setCustomer({ ...customer, phone: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-[#44403C] mb-1">
                    Street Address & Suite *
                  </label>
                  <input
                    type="text"
                    required
                    value={customer.address}
                    onChange={(e) =>
                      setCustomer({ ...customer, address: e.target.value })
                    }
                    className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                  />
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[#44403C] mb-1">
                      City *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.city}
                      onChange={(e) =>
                        setCustomer({ ...customer, city: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#44403C] mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.postalCode}
                      onChange={(e) =>
                        setCustomer({ ...customer, postalCode: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B] font-mono-tabular"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#44403C] mb-1">
                      Country *
                    </label>
                    <input
                      type="text"
                      required
                      value={customer.country}
                      onChange={(e) =>
                        setCustomer({ ...customer, country: e.target.value })
                      }
                      className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#18181B] border-b border-[#E5E0D5] pb-1.5">
                  2. Insured Courier Tier
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(
                    [
                      {
                        id: 'Standard Insured',
                        label: 'Standard Insured Courier',
                        detail: 'Free over $500 (Otherwise $25)',
                      },
                      {
                        id: 'Express Armored',
                        label: 'Express Armored Priority',
                        detail: 'Free over $2,500 (Otherwise $45)',
                      },
                    ] as const
                  ).map((tier) => (
                    <button
                      key={tier.id}
                      type="button"
                      onClick={() =>
                        setCustomer({ ...customer, shippingMethod: tier.id })
                      }
                      className={`p-3 rounded border text-left transition-colors cursor-pointer ${
                        customer.shippingMethod === tier.id
                          ? 'bg-[#EBE6DC] border-[#18181B]'
                          : 'bg-[#F5F2EB] border-[#D4CFC3]'
                      }`}
                    >
                      <div className="text-xs font-semibold text-[#18181B]">
                        {tier.label}
                      </div>
                      <div className="text-[11px] text-[#6E6A63] mt-0.5">
                        {tier.detail}
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Payment Method */}
              <div className="space-y-2.5">
                <h3 className="text-xs font-semibold text-[#18181B] border-b border-[#E5E0D5] pb-1.5">
                  3. Settlement Method
                </h3>
                <div className="grid grid-cols-3 gap-2">
                  {(['Card', 'Bank Wire', 'Cash on Delivery'] as const).map(
                    (method) => (
                      <button
                        key={method}
                        type="button"
                        onClick={() =>
                          setCustomer({ ...customer, paymentMethod: method })
                        }
                        className={`px-3 py-2.5 text-xs font-medium rounded border text-center transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          customer.paymentMethod === method
                            ? 'bg-[#18181B] text-[#FAF8F5] border-[#18181B]'
                            : 'bg-[#F5F2EB] text-[#44403C] border-[#D4CFC3] hover:border-[#18181B]'
                        }`}
                      >
                        {method}
                      </button>
                    )
                  )}
                </div>

                {customer.paymentMethod === 'Cash on Delivery' && (
                  <p className="text-[11px] text-[#57534E] bg-[#F5F2EB] p-2.5 rounded border border-[#E5E0D5]">
                    Cash on Delivery verified via recipient telephone prior to dispatch. Full invoice amount payable upon physical inspection.
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-medium text-[#44403C] mb-1">
                  Atelier Instructions / Engraving Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={customer.notes}
                  onChange={(e) =>
                    setCustomer({ ...customer, notes: e.target.value })
                  }
                  placeholder="Specify wrist circumference in cm for bracelet sizing or gift message..."
                  className="w-full px-3 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B]"
                />
              </div>
            </form>
          )}
        </div>

        {/* Drawer Footer Summary */}
        {cart.length > 0 && (
          <div className="p-6 bg-[#F5F2EB] border-t border-[#DED8CC] space-y-4">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-[#57534E]">
                <span>Subtotal</span>
                <span className="font-mono-tabular font-medium text-[#18181B]">
                  {formatCurrency(summary.subtotal, true)}
                </span>
              </div>

              {summary.productSavings > 0 && (
                <div className="flex justify-between text-[#3F6212]">
                  <span>Catalog Markdown Savings</span>
                  <span className="font-mono-tabular">
                    -{formatCurrency(summary.productSavings, true)}
                  </span>
                </div>
              )}

              {summary.promoDiscount > 0 && (
                <div className="flex justify-between text-[#9A6F38] font-medium">
                  <span>Privilege Discount ({summary.promoCode})</span>
                  <span className="font-mono-tabular">
                    -{formatCurrency(summary.promoDiscount, true)}
                  </span>
                </div>
              )}

              <div className="flex justify-between text-[#57534E]">
                <span>Shipping ({customer.shippingMethod})</span>
                <span className="font-mono-tabular font-medium text-[#18181B]">
                  {summary.shippingCost === 0
                    ? 'Complimentary'
                    : formatCurrency(summary.shippingCost, true)}
                </span>
              </div>

              <div className="pt-2 border-t border-[#DED8CC] flex justify-between items-baseline text-sm font-bold text-[#18181B]">
                <span>Grand Total</span>
                <span className="text-base font-mono-tabular">
                  {formatCurrency(summary.grandTotal, true)}
                </span>
              </div>
            </div>

            {step === 'cart' ? (
              <button
                type="button"
                onClick={() => setStep('checkout')}
                className="w-full py-3 px-4 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-3 px-4 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors flex items-center justify-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#C89D66]" />
                <span>
                  Confirm Order & Generate Invoice ·{' '}
                  {formatCurrency(summary.grandTotal, true)}
                </span>
              </button>
            )}

            <div className="flex items-center justify-center gap-1.5 text-[11px] text-[#6E6A63]">
              <ShieldCheck className="w-3.5 h-3.5 text-[#9A6F38]" />
              <span>All cart & order records persist locally in your browser</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
