'use client';

import React, { useMemo, useState, useTransition } from 'react';
import { Minus, Plus, Package, Clock, CheckCircle } from 'lucide-react';
import { submitOrder, addOnToOrder } from './actions';
import LoadingOverlay from '@/components/ui/LoadingOverlay';
import AssistantWidget from './AssistantWidget';

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
  maxProducts: number | null;
  products: PortalProduct[];
  history: PortalHistoryOrder[];
  todayOrder: { totalItems: number } | null;
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

function QtyControl({
  value, onAdjust, onSet, locked, primaryColor,
}: {
  value: number; onAdjust: (d: number) => void; onSet: (n: number) => void; locked?: boolean; primaryColor: string;
}) {
  const [focused, setFocused] = useState(false);
  const display = focused && value === 0 ? '' : String(value);
  return (
    <div className="flex items-center gap-1.5 flex-shrink-0">
      <button
        aria-label="Decrease"
        onClick={() => onAdjust(-1)}
        className="w-9 h-9 rounded-full bg-neutral-50 border border-neutral-200 flex items-center justify-center active:scale-95"
      >
        <Minus size={14} />
      </button>
      <input
        type="text"
        inputMode="numeric"
        pattern="[0-9]*"
        value={display}
        readOnly={!!locked}
        onFocus={(e) => { setFocused(true); e.currentTarget.select(); }}
        onBlur={() => setFocused(false)}
        onChange={(e) => {
          if (locked) return;
          const raw = e.target.value.replace(/[^0-9]/g, '');
          onSet(raw === '' ? 0 : parseInt(raw, 10));
        }}
        className={`w-12 h-9 text-center font-bold border border-neutral-200 rounded-lg bg-neutral-50 focus:outline-none tabular-nums ${locked ? 'opacity-60 cursor-not-allowed' : ''}`}
      />
      <button
        aria-label="Increase"
        onClick={() => { if (!locked) onAdjust(1); }}
        disabled={!!locked}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-white active:scale-95 ${locked ? 'bg-neutral-200' : ''}`}
        style={locked ? undefined : { backgroundColor: primaryColor }}
      >
        <Plus size={14} />
      </button>
    </div>
  );
}

export default function OrderPortalClient({
  token, businessName, logoUrl, primaryColor, customerName, maxProducts, products, history, todayOrder, forDateLabel,
}: Props) {
  const [mode, setMode] = useState<'default' | 'addon'>('default');
  const [qty, setQty] = useState<Record<string, number>>({});
  const [showMore, setShowMore] = useState(false);
  const [productSearch, setProductSearch] = useState('');
  const [showHistory, setShowHistory] = useState(false);
  const [showMessageModal, setShowMessageModal] = useState(false);
  const [message, setMessage] = useState('');
  const [messageSkipped, setMessageSkipped] = useState(false);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const usedCount = useMemo(() => Object.values(qty).filter((q) => q > 0).length, [qty]);
  const totalItems = useMemo(() => Object.values(qty).reduce((a, b) => a + b, 0), [qty]);
  const atLimit = maxProducts ? usedCount >= maxProducts : false;
  const remaining = maxProducts ? maxProducts - usedCount : 0;

  const limitPillStyle = !maxProducts || (!atLimit && remaining > 5) ? { backgroundColor: primaryColor } : undefined;
  const limitPillClass = maxProducts && atLimit
    ? 'bg-red-100 text-red-700'
    : maxProducts && remaining <= 5
    ? 'bg-amber-100 text-amber-800'
    : 'text-white';

  const visibleProducts = showMore ? products : products.slice(0, VISIBLE_COUNT);
  const extraSearchResults = useMemo(() => {
    if (!showMore) return [];
    const s = productSearch.trim().toLowerCase();
    if (!s) return products;
    return products.filter((p) => p.name.toLowerCase().includes(s));
  }, [products, productSearch, showMore]);

  const adjust = (id: string, delta: number) => {
    setError(null); setSuccessMsg(null);
    setQty((s) => {
      const current = s[id] || 0;
      if (delta > 0 && current === 0 && maxProducts) {
        const usedNow = Object.values(s).filter((v) => v > 0).length;
        if (usedNow >= maxProducts) return s;
      }
      return { ...s, [id]: Math.max(0, current + delta) };
    });
  };

  const setN = (id: string, n: number) => {
    setError(null); setSuccessMsg(null);
    setQty((s) => {
      const current = s[id] || 0;
      const newVal = Math.max(0, n || 0);
      if (current === 0 && newVal > 0 && maxProducts) {
        const usedNow = Object.values(s).filter((v) => v > 0).length;
        if (usedNow >= maxProducts) return s;
      }
      return { ...s, [id]: newVal };
    });
  };

  const doSubmit = (msg: string) => {
    const items = Object.entries(qty).filter(([, q]) => q > 0).map(([product_id, quantity]) => ({ product_id, quantity }));
    if (items.length === 0) {
      setError('Select at least one product first.');
      return;
    }
    startTransition(async () => {
      const result = mode === 'addon'
        ? await addOnToOrder(token, items, msg)
        : await submitOrder(token, items, msg);
      if (result.error) {
        setError(result.error);
      } else {
        setSuccessMsg(mode === 'addon' ? `Added to your order for ${forDateLabel}.` : `Order submitted for ${forDateLabel}.`);
        setQty({});
        setMessage('');
        setMessageSkipped(false);
        setMode('default');
      }
    });
  };

  const handleSubmitClick = () => {
    if (messageSkipped) {
      doSubmit(message);
    } else {
      setShowMessageModal(true);
    }
  };

  // Matches the reference app exactly: if the customer already has an order
  // in for tomorrow, show a "received" confirmation screen instead of the
  // ordering form, with an option to add more items on top of it.
  if (todayOrder && mode === 'default') {
    return (
      <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-6">
        <div className="bg-white rounded-3xl shadow-lg border border-neutral-200 p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-4">
            <CheckCircle size={32} className="text-emerald-600" />
          </div>
          <h1 className="text-2xl font-bold mb-2 text-neutral-900">Your order has been received!</h1>
          <h3 className="text-sm font-semibold text-neutral-500 mb-2">New orders can only be submitted tomorrow</h3>
          <p className="text-neutral-600 mb-2">
            <strong>{customerName}</strong> \u2014 {todayOrder.totalItems} items for {forDateLabel}.
          </p>
          <div className="flex flex-col gap-2 mt-4">
            <button
              onClick={() => { setMode('addon'); setQty({}); }}
              className="text-white font-bold py-3 rounded-xl"
              style={{ backgroundColor: primaryColor }}
            >
              + Add onto Prev Order
            </button>
            <button
              onClick={() => setShowHistory(true)}
              className="border border-neutral-200 hover:bg-neutral-50 font-semibold py-3 rounded-xl text-neutral-700"
            >
              History
            </button>
          </div>
        </div>

        {showHistory && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
            <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between p-4 border-b border-neutral-200 sticky top-0 bg-white">
                <h3 className="font-bold text-neutral-900">Order History</h3>
                <button onClick={() => setShowHistory(false)} className="text-2xl leading-none text-neutral-400">&times;</button>
              </div>
              <div className="p-4 space-y-3">
                {history.length === 0 ? (
                  <div className="text-center py-6">
                    <Clock className="mx-auto mb-2 text-neutral-300" size={24} />
                    <p className="text-sm text-neutral-500">No past orders yet.</p>
                  </div>
                ) : (
                  history.map((o) => {
                    const total = o.items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
                    return (
                      <div key={o.id} className="border border-neutral-200 rounded-xl p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="text-xs text-neutral-500">Ordered for {o.for_date} \u00b7 {o.items.length} items \u00b7 R {total.toFixed(2)}</div>
                          <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-neutral-100 text-neutral-700'}`}>
                            {o.status}
                          </span>
                        </div>
                        <ul className="text-sm space-y-1">
                          {o.items.map((it, i) => (
                            <li key={i} className="flex justify-between text-neutral-800">
                              <span>{it.product_name}</span>
                              <span className="font-semibold">{it.quantity}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-50 pb-40">
      <LoadingOverlay show={isPending} message="Submitting your order..." />

      <header className="bg-white border-b border-neutral-200 sticky top-0 z-10">
        <div className="max-w-xl mx-auto px-5 py-4 flex items-center gap-3">
          {logoUrl ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={logoUrl} alt={businessName} className="w-9 h-9 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ backgroundColor: primaryColor }}>
              {businessName[0]}
            </div>
          )}
          <div className="flex-1 min-w-0">
            <p className="text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">{businessName}</p>
            <h1 className="font-bold leading-tight truncate text-neutral-900">{customerName}</h1>
          </div>
          {mode === 'addon' && (
            <button
              onClick={() => setMode('default')}
              className="px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition flex-shrink-0"
              style={{ borderColor: primaryColor, color: primaryColor }}
            >
              Cancel
            </button>
          )}
        </div>
      </header>

      <div className="max-w-xl mx-auto px-5 pt-6">
        <div
          className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold mb-3"
          style={{ backgroundColor: `${primaryColor}1A`, color: primaryColor }}
        >
          {mode === 'addon' ? 'ADD-ON ORDER' : 'ORDER FOR TOMORROW'}
        </div>
        <h2 className="text-2xl font-bold mb-1 text-neutral-900">{forDateLabel}</h2>
        <p className="text-sm text-neutral-500 mb-3">
          {mode === 'addon' ? "Add extra quantities on top of today's order." : 'Set quantities and submit. Orders are placed the day before.'}
        </p>
        {maxProducts && (
          <div className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold mb-3 ${limitPillClass}`} style={limitPillStyle}>
            {usedCount} of {maxProducts} products used{atLimit ? ' \u00b7 Limit reached' : ` \u00b7 ${remaining} left`}
          </div>
        )}
      </div>

      {products.length === 0 ? (
        <div className="max-w-xl mx-auto px-5">
          <div className="bg-white border border-neutral-200 rounded-2xl p-8 text-center">
            <Package className="mx-auto mb-3 text-neutral-400" size={28} />
            <p className="font-semibold text-neutral-900">No products available yet</p>
            <p className="text-sm text-neutral-500 mt-1">Contact your supplier to get your product list set up.</p>
          </div>
        </div>
      ) : (
        <>
          <div className="max-w-xl mx-auto px-5 space-y-2.5">
            {visibleProducts.map((p) => {
              const rowQty = qty[p.id] ?? 0;
              const locked = atLimit && rowQty === 0;
              return (
                <div key={p.id} className={`bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3 shadow-sm transition-opacity ${locked ? 'opacity-50' : ''}`}>
                  <div className="flex-1 min-w-0">
                    <div className="font-semibold leading-tight text-sm text-neutral-900 truncate">{p.name}</div>
                    {p.unit && <div className="text-xs text-neutral-400 uppercase">{p.unit}</div>}
                  </div>
                  <QtyControl value={rowQty} onAdjust={(d) => adjust(p.id, d)} onSet={(n) => setN(p.id, n)} locked={locked} primaryColor={primaryColor} />
                </div>
              );
            })}
          </div>

          <div className="max-w-xl mx-auto px-5 mt-6">
            {!showMore ? (
              products.length > VISIBLE_COUNT && (
                <button
                  onClick={() => setShowMore(true)}
                  className="w-full py-3 rounded-xl border-2 border-dashed font-semibold"
                  style={{ borderColor: `${primaryColor}66`, color: primaryColor }}
                >
                  + Show more products
                </button>
              )
            ) : (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-neutral-900">All products</h3>
                  <button
                    onClick={() => setShowMore(false)}
                    className="px-3 py-1.5 rounded-lg border-2 text-xs font-bold transition"
                    style={{ borderColor: primaryColor, color: primaryColor }}
                  >
                    Hide
                  </button>
                </div>
                <input
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Search products..."
                  className="w-full bg-white border border-neutral-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none"
                />
                <div className="space-y-2">
                  {extraSearchResults.map((p) => {
                    const rowQty = qty[p.id] ?? 0;
                    const locked = atLimit && rowQty === 0;
                    return (
                      <div key={p.id} className={`bg-white rounded-2xl border border-neutral-200 p-3 flex items-center gap-3 shadow-sm transition-opacity ${locked ? 'opacity-50' : ''}`}>
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-sm text-neutral-900 truncate">{p.name}</div>
                        </div>
                        <QtyControl value={rowQty} onAdjust={(d) => adjust(p.id, d)} onSet={(n) => setN(p.id, n)} locked={locked} primaryColor={primaryColor} />
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </>
      )}

      {/* Sticky bottom bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-neutral-200 p-4 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
        <div className="max-w-xl mx-auto">
          <div className="flex items-center gap-2 mb-2">
            <div className="flex-1">
              <div className="text-xs text-neutral-500">Products</div>
              <div className="font-bold text-lg text-neutral-900">
                {usedCount}{maxProducts ? ` / ${maxProducts}` : ''}
              </div>
            </div>
            <button onClick={() => setShowHistory(true)} className="px-3 py-2 rounded-xl border border-neutral-200 text-sm font-semibold text-neutral-700">
              History
            </button>
          </div>
          <button
            onClick={handleSubmitClick}
            disabled={isPending || totalItems === 0}
            className="w-full py-3 rounded-xl text-white font-bold disabled:opacity-50 transition"
            style={{ backgroundColor: primaryColor }}
          >
            {isPending ? 'Sending...' : mode === 'addon' ? `Submit Add-On${usedCount > 0 ? ` (${usedCount})` : ''}` : `Submit Order${usedCount > 0 ? ` (${usedCount})` : ''}`}
          </button>
          {error && <p className="mt-2 text-xs text-red-600">{error}</p>}
          {successMsg && <p className="mt-2 text-xs text-emerald-700 flex items-center gap-1.5"><CheckCircle size={13} /> {successMsg}</p>}
        </div>
      </div>

      {/* History modal */}
      {showHistory && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => setShowHistory(false)}>
          <div className="bg-white rounded-2xl max-w-md w-full max-h-[85vh] overflow-auto shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between p-4 border-b border-neutral-200 sticky top-0 bg-white">
              <h3 className="font-bold text-neutral-900">Order History</h3>
              <button onClick={() => setShowHistory(false)} className="text-2xl leading-none text-neutral-400">&times;</button>
            </div>
            <div className="p-4 space-y-3">
              {history.length === 0 ? (
                <div className="text-center py-6">
                  <Clock className="mx-auto mb-2 text-neutral-300" size={24} />
                  <p className="text-sm text-neutral-500">No past orders yet.</p>
                </div>
              ) : (
                history.map((o) => {
                  const total = o.items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
                  return (
                    <div key={o.id} className="border border-neutral-200 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="text-xs text-neutral-500">Ordered for {o.for_date} \u00b7 {o.items.length} items \u00b7 R {total.toFixed(2)}</div>
                        <span className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${statusColors[o.status] || 'bg-neutral-100 text-neutral-700'}`}>
                          {o.status}
                        </span>
                      </div>
                      <ul className="text-sm space-y-1">
                        {o.items.map((it, i) => (
                          <li key={i} className="flex justify-between text-neutral-800">
                            <span>{it.product_name}</span>
                            <span className="font-semibold">{it.quantity}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* Message modal — optional note before submit */}
      {showMessageModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4" onClick={() => { setShowMessageModal(false); setMessageSkipped(true); }}>
          <div className="bg-white rounded-2xl max-w-md w-full shadow-xl p-5" onClick={(e) => e.stopPropagation()}>
            <h3 className="font-bold text-lg mb-1 text-neutral-900">Add a message (optional)</h3>
            <p className="text-sm text-neutral-500 mb-3">
              Add a quick note before sending your order (e.g. delivery time, special instructions) \u2014 or skip this and send without one.
            </p>
            <textarea
              autoFocus
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Type your message... (optional)"
              rows={4}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-4 py-3 text-sm focus:outline-none resize-none"
            />
            <div className="flex gap-2 mt-4">
              <button
                onClick={() => { setShowMessageModal(false); setMessageSkipped(true); doSubmit(''); }}
                disabled={isPending}
                className="flex-1 border border-neutral-200 font-semibold py-3 rounded-xl disabled:opacity-50"
              >
                Skip
              </button>
              <button
                onClick={() => { setShowMessageModal(false); doSubmit(message); }}
                disabled={isPending}
                className="flex-1 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                style={{ backgroundColor: primaryColor }}
              >
                {isPending ? 'Sending...' : 'Send'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AssistantWidget token={token} primaryColor={primaryColor} />
    </div>
  );
}
