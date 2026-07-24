'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { Minus, Plus, Package, Clock, CheckCircle, ShoppingCart, History as HistoryIcon } from 'lucide-react';
import { submitOrder } from './actions';
import LoadingOverlay from '@/components/ui/LoadingOverlay';

export interface PortalProduct {
  id: string;
  name: string;
  unit: string | null;
  selling_price: number | null;
  category: string | null;
}

export interface PortalHistoryOrder {
  id: string;
  for_date: string;
  delivery_date: string | null;
  status: string;
  items: { product_name: string; quantity: number; unit_price: number }[];
}

interface Props {
  token: string;
  businessName: string;
  logoUrl: string | null;
  primaryColor: string;
  customerName: string;
  products: PortalProduct[];
  history: PortalHistoryOrder[];
  forDateIso: string;
  forDateLabel: string;
}

const VISIBLE_COUNT = 9;

const statusColors: Record<string, string> = {
  pending: 'bg-amber-100 text-amber-800',
  confirmed: 'bg-blue-100 text-blue-800',
  processing: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-emerald-100 text-emerald-800',
  delivered: 'bg-emerald-100 text-emerald-800',
  cancelled: 'bg-red-100 text-red-700',
};

export default function OrderPortalClient({
  token, businessName, logoUrl, primaryColor, customerName, products, history, forDateLabel,
}: Props) {
  const [quantities, setQuantities] = useState<Record<string, number>>({});
  const [tab, setTab] = useState<'products' | 'history'>('products');
  const [showAll, setShowAll] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const visibleProducts = showAll ? products : products.slice(0, VISIBLE_COUNT);
  const usedCount = useMemo(() => Object.values(quantities).filter((q) => q > 0).length, [quantities]);

  const setQty = (id: string, qty: number) => {
    setError(null);
    setSuccessMsg(null);
    setQuantities((q) => ({ ...q, [id]: Math.max(0, qty) }));
  };

  const handleSubmit = () => {
    setError(null);
    setSuccessMsg(null);
    const items = Object.entries(quantities)
      .filter(([, qty]) => qty > 0)
      .map(([product_id, quantity]) => ({ product_id, quantity }));

    if (items.length === 0) {
      setError('Select at least one product first.');
      return;
    }

    startTransition(async () => {
      const result = await submitOrder(token, items);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMsg(`Order submitted for ${forDateLabel}.`);
        setQuantities({});
      }
    });
  };

  return (
    <div className="min-h-screen bg-neutral-50">
      <LoadingOverlay show={isPending} message="Submitting your order..." />

      {/* Header */}
      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="w-9 h-9 rounded-lg object-cover flex-shrink-0" />
          ) : (
            <div
              className="w-9 h-9 rounded-lg flex items-center justify-center text-white font-bold flex-shrink-0"
              style={{ backgroundColor: primaryColor }}
            >
              {businessName[0]}
            </div>
          )}
          <div>
            <p className="font-bold text-neutral-900 text-sm leading-tight">{businessName}</p>
            <p className="text-xs text-neutral-500">Wholesale Orders</p>
          </div>
        </div>
      </header>

      <main className="max-w-2xl mx-auto px-4 py-5 pb-28 space-y-5">
        <div>
          <h1 className="text-xl font-bold text-neutral-900">{customerName}</h1>
          <p className="text-xs font-semibold tracking-wide text-neutral-400 uppercase mt-1">Order for tomorrow</p>
          <p className="text-lg font-bold text-neutral-900">{forDateLabel}</p>
          <p className="text-sm text-neutral-500 mt-1">Set quantities and submit. Orders are placed the day before.</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-white border border-neutral-200 rounded-xl p-1 w-fit">
          <button
            onClick={() => setTab('products')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'products' ? 'text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
            style={tab === 'products' ? { backgroundColor: primaryColor } : undefined}
          >
            <ShoppingCart size={14} /> Products
          </button>
          <button
            onClick={() => setTab('history')}
            className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${tab === 'history' ? 'text-white' : 'text-neutral-500 hover:bg-neutral-50'}`}
            style={tab === 'history' ? { backgroundColor: primaryColor } : undefined}
          >
            <HistoryIcon size={14} /> History
          </button>
        </div>

        {tab === 'products' && (
          <>
            {products.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
                <Package className="mx-auto mb-3 text-neutral-400" size={28} />
                <p className="font-semibold text-neutral-900">No products available yet</p>
                <p className="text-sm text-neutral-500 mt-1">Contact your supplier to get your product list set up.</p>
              </div>
            ) : (
              <>
                <p className="text-xs text-neutral-500">
                  {usedCount} of {products.length} products used · {products.length - usedCount} left
                </p>
                <div className="space-y-2">
                  {visibleProducts.map((p) => {
                    const qty = quantities[p.id] || 0;
                    return (
                      <div key={p.id} className="bg-white border border-neutral-200 rounded-xl px-4 py-3 flex items-center justify-between gap-3">
                        <div className="min-w-0">
                          <p className="font-semibold text-neutral-900 text-sm truncate">{p.name}</p>
                          {p.unit && <p className="text-xs text-neutral-400 uppercase">{p.unit}</p>}
                        </div>
                        <div className="flex items-center gap-3 flex-shrink-0">
                          <button
                            onClick={() => setQty(p.id, qty - 1)}
                            className="w-8 h-8 rounded-lg border border-neutral-300 flex items-center justify-center text-neutral-600 hover:bg-neutral-50 disabled:opacity-40"
                            disabled={qty === 0}
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-6 text-center font-semibold text-neutral-900 tabular-nums">{qty}</span>
                          <button
                            onClick={() => setQty(p.id, qty + 1)}
                            className="w-8 h-8 rounded-lg flex items-center justify-center text-white"
                            style={{ backgroundColor: primaryColor }}
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
                {!showAll && products.length > VISIBLE_COUNT && (
                  <button onClick={() => setShowAll(true)} className="text-sm font-semibold w-full text-center py-2" style={{ color: primaryColor }}>
                    + Show more products
                  </button>
                )}
              </>
            )}
          </>
        )}

        {tab === 'history' && (
          <div className="space-y-3">
            {history.length === 0 ? (
              <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
                <Clock className="mx-auto mb-3 text-neutral-400" size={28} />
                <p className="font-semibold text-neutral-900">No past orders yet</p>
              </div>
            ) : (
              history.map((o) => {
                const total = o.items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
                return (
                  <div key={o.id} className="bg-white border border-neutral-200 rounded-xl p-4">
                    <div className="flex items-center justify-between mb-2">
                      <div>
                        <p className="text-sm font-semibold text-neutral-900">Ordered for {o.for_date}</p>
                        <p className="text-xs text-neutral-500">{o.items.length} item{o.items.length !== 1 ? 's' : ''} · R {total.toFixed(2)}</p>
                      </div>
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColors[o.status] || 'bg-neutral-100 text-neutral-700'}`}>
                        {o.status}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        )}
      </main>

      {tab === 'products' && products.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4">
          <div className="max-w-2xl mx-auto">
            {error && <p className="text-sm text-red-600 mb-2">{error}</p>}
            {successMsg && (
              <p className="text-sm text-emerald-700 mb-2 flex items-center gap-1.5"><CheckCircle size={14} /> {successMsg}</p>
            )}
            <button
              onClick={handleSubmit}
              disabled={isPending || usedCount === 0}
              className="w-full py-3 rounded-xl text-white font-semibold text-sm disabled:opacity-50"
              style={{ backgroundColor: primaryColor }}
            >
              {isPending ? (
                <span className="flex items-center justify-center gap-2">
                  <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                `Submit Order${usedCount > 0 ? ` (${usedCount})` : ''}`
              )}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
