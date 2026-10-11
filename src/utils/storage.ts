import { CartItem, Order } from '../types/store';
import { INITIAL_SAMPLE_ORDERS, PROMO_CODES } from '../data/products';

const CART_STORAGE_KEY = 'aurelius_atelier_cart_v1';
const ORDERS_STORAGE_KEY = 'aurelius_atelier_orders_v1';
const PROMO_STORAGE_KEY = 'aurelius_atelier_promo_v1';

export function loadCartFromStorage(): CartItem[] {
  try {
    const raw = localStorage.getItem(CART_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function saveCartToStorage(cart: CartItem[]): void {
  try {
    localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(cart));
  } catch {
    // Ignore storage quota errors in restricted frames
  }
}

export function loadPromoFromStorage(): string {
  try {
    return localStorage.getItem(PROMO_STORAGE_KEY) || '';
  } catch {
    return '';
  }
}

export function savePromoToStorage(code: string): void {
  try {
    if (!code) {
      localStorage.removeItem(PROMO_STORAGE_KEY);
    } else {
      localStorage.setItem(PROMO_STORAGE_KEY, code);
    }
  } catch {
    // Ignore storage errors
  }
}

export function loadOrdersFromStorage(): Order[] {
  try {
    const raw = localStorage.getItem(ORDERS_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(INITIAL_SAMPLE_ORDERS));
      return INITIAL_SAMPLE_ORDERS;
    }
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : INITIAL_SAMPLE_ORDERS;
  } catch {
    return INITIAL_SAMPLE_ORDERS;
  }
}

export function saveOrdersToStorage(orders: Order[]): void {
  try {
    localStorage.setItem(ORDERS_STORAGE_KEY, JSON.stringify(orders));
  } catch {
    // Ignore storage errors
  }
}

export function calculateCartSummary(
  cart: CartItem[],
  promoCodeInput: string,
  shippingMethod: 'Standard Insured' | 'Express Armored' = 'Standard Insured'
) {
  const subtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const productSavings = cart.reduce((sum, item) => {
    if (item.product.oldPrice && item.product.oldPrice > item.product.price) {
      return sum + (item.product.oldPrice - item.product.price) * item.quantity;
    }
    return sum;
  }, 0);

  const normalizedPromo = promoCodeInput.trim().toUpperCase();
  const promoObj = PROMO_CODES[normalizedPromo];
  const promoDiscount = promoObj
    ? Number(((subtotal * promoObj.discountPercent) / 100).toFixed(2))
    : 0;

  const discountedSubtotal = Math.max(0, subtotal - promoDiscount);

  // Free Standard Insured courier on orders over $500; Express Armored is $45 (or free over $2,500)
  let shippingCost = 0;
  if (cart.length > 0) {
    if (shippingMethod === 'Standard Insured') {
      shippingCost = discountedSubtotal >= 500 ? 0 : 25;
    } else {
      shippingCost = discountedSubtotal >= 2500 ? 0 : 45;
    }
  }

  const grandTotal = Number((discountedSubtotal + shippingCost).toFixed(2));

  return {
    subtotal,
    productSavings,
    promoCode: promoObj ? promoObj.code : undefined,
    promoDescription: promoObj ? promoObj.description : undefined,
    promoDiscount,
    shippingCost,
    grandTotal,
  };
}

export function formatCurrency(amount: number, showDecimals = false): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: showDecimals ? 2 : 0,
    maximumFractionDigits: showDecimals ? 2 : 0,
  }).format(amount);
}
