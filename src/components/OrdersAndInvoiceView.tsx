import React, { useState } from 'react';
import {
  Printer,
  FileText,
  Trash2,
  PackageCheck,
  ArrowLeft,
  ShieldCheck,
} from 'lucide-react';
import { Order, OrderStatus } from '../types/store';
import { formatCurrency } from '../utils/storage';

interface OrdersAndInvoiceViewProps {
  orders: Order[];
  selectedOrderId: string | null;
  onSelectOrder: (orderId: string) => void;
  onUpdateOrderStatus: (orderId: string, status: OrderStatus) => void;
  onDeleteOrder: (orderId: string) => void;
  onContinueShopping: () => void;
}

const ORDER_STATUSES: OrderStatus[] = [
  'Confirmed',
  'Horologist Inspection',
  'Dispatched',
  'Delivered',
];

export const OrdersAndInvoiceView: React.FC<OrdersAndInvoiceViewProps> = ({
  orders,
  selectedOrderId,
  onSelectOrder,
  onUpdateOrderStatus,
  onDeleteOrder,
  onContinueShopping,
}) => {
  const [searchTerm, setSearchTerm] = useState('');

  const filteredOrders = orders.filter(
    (o) =>
      o.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.invoiceNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const activeOrder =
    orders.find((o) => o.id === selectedOrderId) || filteredOrders[0] || null;

  const handlePrintInvoice = () => {
    window.print();
  };

  return (
    <section className="max-w-[1360px] mx-auto px-6 py-10">
      {/* Top Toolbar (Hidden when printing) */}
      <div className="no-print flex flex-col md:flex-row md:items-end justify-between gap-6 pb-8 border-b border-[#E5E0D5]">
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-[#9A6F38]">
            Client Vault & Provenance Ledger
          </div>
          <h1 className="font-display text-3xl md:text-4xl font-bold text-[#18181B]">
            Order Management & Official Invoices
          </h1>
          <p className="text-sm text-[#57534E]">
            All client acquisitions and itemized invoices are stored persistently in your browser’s Local Storage.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <input
            type="search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search order ID or client name..."
            className="px-3.5 py-2 text-xs bg-[#F5F2EB] border border-[#D4CFC3] rounded focus:outline-none focus:border-[#18181B] w-64"
          />
          <button
            type="button"
            onClick={onContinueShopping}
            className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#18181B] bg-[#F5F2EB] border border-[#D4CFC3] rounded hover:border-[#18181B] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Catalog</span>
          </button>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="no-print py-16 text-center space-y-4">
          <FileText className="w-10 h-10 text-[#9A6F38] mx-auto" />
          <div className="space-y-1">
            <h2 className="text-lg font-semibold text-[#18181B]">
              No Recorded Orders Found
            </h2>
            <p className="text-xs text-[#6E6A63] max-w-md mx-auto">
              Complete a purchase through the shopping bag to generate an official Aurelius Atelier invoice and warranty certificate.
            </p>
          </div>
          <button
            type="button"
            onClick={onContinueShopping}
            className="px-5 py-2.5 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors cursor-pointer"
          >
            Browse Timepieces & Menswear
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pt-8 items-start">
          {/* Left Column: Order Registry List (Hidden on print) */}
          <div className="no-print lg:col-span-4 space-y-4">
            <h2 className="text-xs font-semibold text-[#18181B]">
              Recorded Acquisitions ({filteredOrders.length})
            </h2>

            <div className="space-y-3">
              {filteredOrders.map((order) => {
                const isSelected = activeOrder?.id === order.id;
                const formattedDate = new Date(order.createdAt).toLocaleDateString(
                  'en-US',
                  {
                    year: 'numeric',
                    month: 'short',
                    day: 'numeric',
                  }
                );

                return (
                  <div
                    key={order.id}
                    onClick={() => onSelectOrder(order.id)}
                    className={`p-4 rounded-lg border transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-[#EBE6DC] border-[#18181B]'
                        : 'bg-[#F5F2EB] border-[#E5E0D5] hover:border-[#D4CFC3]'
                    }`}
                  >
                    <div className="flex items-baseline justify-between gap-2">
                      <span className="text-sm font-bold font-mono-tabular text-[#18181B]">
                        {order.id}
                      </span>
                      <span className="text-sm font-bold font-mono-tabular text-[#18181B]">
                        {formatCurrency(order.grandTotal, true)}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center flex-wrap gap-1.5 text-xs text-[#57534E]">
                      <span>{order.customer.fullName}</span>
                      <span aria-hidden="true">·</span>
                      <span>{formattedDate}</span>
                    </div>

                    <div className="mt-2.5 pt-2.5 border-t border-[#DED8CC] flex items-center justify-between text-xs">
                      <span className="font-medium text-[#9A6F38]">
                        Status: {order.status}
                      </span>
                      <span className="font-mono-tabular text-[#6E6A63]">
                        {order.items.reduce((s, i) => s + i.quantity, 0)} items
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Right Column: Print-Friendly Official Commercial Invoice */}
          {activeOrder && (
            <div className="lg:col-span-8 space-y-4">
              {/* Action Controls Bar (Hidden when printing) */}
              <div className="no-print flex flex-wrap items-center justify-between gap-4 p-4 rounded-lg bg-[#F5F2EB] border border-[#E5E0D5]">
                <div className="flex items-center flex-wrap gap-2">
                  <span className="text-xs font-semibold text-[#18181B] mr-1">
                    Fulfillment Stage:
                  </span>
                  {ORDER_STATUSES.map((statusOption) => (
                    <button
                      key={statusOption}
                      type="button"
                      onClick={() =>
                        onUpdateOrderStatus(activeOrder.id, statusOption)
                      }
                      className={`px-2.5 py-1 text-xs font-medium rounded transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                        activeOrder.status === statusOption
                          ? 'bg-[#18181B] text-[#FAF8F5]'
                          : 'bg-[#FAF8F5] text-[#57534E] border border-[#D4CFC3] hover:text-[#18181B]'
                      }`}
                    >
                      {statusOption}
                    </button>
                  ))}
                </div>

                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => onDeleteOrder(activeOrder.id)}
                    aria-label="Delete Order Record"
                    className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-[#991B1B] bg-[#FAF8F5] border border-[#E5E0D5] rounded hover:bg-[#FEF2F2] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Delete</span>
                  </button>

                  <button
                    type="button"
                    onClick={handlePrintInvoice}
                    className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-[#FAF8F5] bg-[#18181B] rounded hover:bg-[#27272A] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5 text-[#C89D66]" />
                    <span>Print / Save PDF Invoice</span>
                  </button>
                </div>
              </div>

              {/* Printable Document Sheet */}
              <div className="print-only-container bg-white text-[#18181B] border border-[#DED8CC] rounded-lg p-8 md:p-12 space-y-8">
                {/* Invoice Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-6 pb-6 border-b border-[#E5E0D5]">
                  <div className="space-y-1">
                    <div className="font-display text-3xl font-bold tracking-tight text-[#18181B]">
                      Aurelius Atelier
                    </div>
                    <p className="text-xs text-[#57534E]">
                      Haute Horlogerie & Sartorial Menswear · Rue du Rhône 18, 1204 Geneva
                    </p>
                    <p className="text-xs text-[#57534E] font-mono-tabular">
                      VAT / CHE-419.820.114 · concierge@aurelius-atelier.ch
                    </p>
                  </div>

                  <div className="sm:text-right space-y-1">
                    <div className="text-xs font-semibold text-[#9A6F38]">
                      OFFICIAL COMMERCIAL INVOICE
                    </div>
                    <div className="text-base font-bold font-mono-tabular text-[#18181B]">
                      {activeOrder.invoiceNumber}
                    </div>
                    <div className="text-xs text-[#57534E] font-mono-tabular">
                      Order Ref: {activeOrder.id}
                    </div>
                    <div className="text-xs text-[#57534E]">
                      Issued:{' '}
                      {new Date(activeOrder.createdAt).toLocaleString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>

                {/* Client & Settlement Details Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs">
                  <div className="space-y-1.5">
                    <div className="font-semibold text-[#6E6A63]">
                      Billed & Dispatched To
                    </div>
                    <div className="text-sm font-bold text-[#18181B]">
                      {activeOrder.customer.fullName}
                    </div>
                    <div className="text-[#44403C]">
                      {activeOrder.customer.address}
                    </div>
                    <div className="text-[#44403C]">
                      {activeOrder.customer.city}, {activeOrder.customer.postalCode} ·{' '}
                      {activeOrder.customer.country}
                    </div>
                    <div className="text-[#57534E] pt-1 font-mono-tabular">
                      {activeOrder.customer.email} · {activeOrder.customer.phone}
                    </div>
                  </div>

                  <div className="space-y-1.5 sm:text-right">
                    <div className="font-semibold text-[#6E6A63]">
                      Logistics & Settlement Terms
                    </div>
                    <div className="text-[#18181B]">
                      <span className="text-[#6E6A63]">Payment Method: </span>
                      <span className="font-semibold">
                        {activeOrder.customer.paymentMethod}
                      </span>
                    </div>
                    <div className="text-[#18181B]">
                      <span className="text-[#6E6A63]">Courier Service: </span>
                      <span className="font-semibold">
                        {activeOrder.customer.shippingMethod}
                      </span>
                    </div>
                    <div className="text-[#18181B]">
                      <span className="text-[#6E6A63]">Fulfillment Status: </span>
                      <span className="font-semibold text-[#9A6F38]">
                        {activeOrder.status}
                      </span>
                    </div>
                    {activeOrder.customer.notes && (
                      <div className="text-[#57534E] italic pt-1">
                        Note: “{activeOrder.customer.notes}”
                      </div>
                    )}
                  </div>
                </div>

                {/* Itemized Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-y border-[#18181B] text-xs font-semibold text-[#18181B]">
                        <th className="py-3 pr-4">SKU</th>
                        <th className="py-3 px-4">Description & Configuration</th>
                        <th className="py-3 px-4 text-right">Qty</th>
                        <th className="py-3 px-4 text-right">Unit Price</th>
                        <th className="py-3 pl-4 text-right">Line Total</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-[#E5E0D5] text-xs">
                      {activeOrder.items.map((item, idx) => (
                        <tr key={`${item.product.id}-${idx}`}>
                          <td className="py-3.5 pr-4 font-mono-tabular text-[#57534E] whitespace-nowrap">
                            {item.product.sku}
                          </td>
                          <td className="py-3.5 px-4">
                            <div className="font-semibold text-[#18181B]">
                              {item.product.title}
                            </div>
                            <div className="text-[#6E6A63]">
                              {item.product.brand} · {item.selectedVariant}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular">
                            {item.quantity}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono-tabular">
                            {formatCurrency(item.product.price, true)}
                          </td>
                          <td className="py-3.5 pl-4 text-right font-semibold font-mono-tabular text-[#18181B]">
                            {formatCurrency(
                              item.product.price * item.quantity,
                              true
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Financial Totals Breakdown */}
                <div className="flex flex-col sm:flex-row justify-between items-start gap-6 pt-4 border-t border-[#E5E0D5]">
                  <div className="max-w-sm space-y-2 text-xs text-[#57534E]">
                    <div className="inline-flex items-center gap-1.5 font-semibold text-[#18181B]">
                      <ShieldCheck className="w-4 h-4 text-[#9A6F38]" />
                      <span>Certificate of Authenticity & Provenance</span>
                    </div>
                    <p className="leading-relaxed">
                      Every timepiece and sartorial piece listed on this invoice has passed Master Horologist 5-point chronometric verification and includes a 5-year international warranty.
                    </p>
                  </div>

                  <div className="w-full sm:w-72 space-y-2 text-xs">
                    <div className="flex justify-between text-[#57534E]">
                      <span>Items Subtotal</span>
                      <span className="font-mono-tabular font-medium text-[#18181B]">
                        {formatCurrency(activeOrder.subtotal, true)}
                      </span>
                    </div>

                    {activeOrder.productSavings > 0 && (
                      <div className="flex justify-between text-[#3F6212]">
                        <span>Included Catalog Savings</span>
                        <span className="font-mono-tabular">
                          -{formatCurrency(activeOrder.productSavings, true)}
                        </span>
                      </div>
                    )}

                    {activeOrder.promoDiscount > 0 && (
                      <div className="flex justify-between text-[#9A6F38]">
                        <span>Privilege Code ({activeOrder.promoCode})</span>
                        <span className="font-mono-tabular">
                          -{formatCurrency(activeOrder.promoDiscount, true)}
                        </span>
                      </div>
                    )}

                    <div className="flex justify-between text-[#57534E]">
                      <span>Insured Logistics</span>
                      <span className="font-mono-tabular font-medium text-[#18181B]">
                        {activeOrder.shippingCost === 0
                          ? '$0.00 (Complimentary)'
                          : formatCurrency(activeOrder.shippingCost, true)}
                      </span>
                    </div>

                    <div className="pt-2.5 border-t border-[#18181B] flex justify-between items-baseline text-sm font-bold text-[#18181B]">
                      <span>Total Due / Paid (USD)</span>
                      <span className="text-base font-mono-tabular">
                        {formatCurrency(activeOrder.grandTotal, true)}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Footer Sign-off */}
                <div className="pt-6 border-t border-[#E5E0D5] flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-[11px] text-[#6E6A63]">
                  <div>
                    Authorized Signature: <span className="italic font-serif text-sm text-[#18181B] ml-1">Henri de Vauclair, Master Horologist</span>
                  </div>
                  <div className="font-mono-tabular">
                    Aurelius Atelier Geneva · Official Client Copy
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
};
