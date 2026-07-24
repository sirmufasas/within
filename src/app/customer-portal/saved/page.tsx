'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import Link from 'next/link';
import {
  Heart, Search, Plus, ArrowLeft, Trash2, ShoppingCart,
  Package, Star, TrendingUp, Filter,
} from 'lucide-react';

interface SavedItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  customer: string;
  category: string;
  orderCount: number;
  lastOrdered: string;
  inStock: boolean;
}

const mockSavedItems: SavedItem[] = [
  { id: 'p1', name: 'Pão de Forma', price: 1.20, unit: 'loaf', customer: 'Café Central', category: 'Bread', orderCount: 18, lastOrdered: '2026-07-20', inStock: true },
  { id: 'p2', name: 'Croissant', price: 1.50, unit: 'unit', customer: 'Café Central', category: 'Pastry', orderCount: 24, lastOrdered: '2026-07-20', inStock: true },
  { id: 'p3', name: 'Baguette', price: 0.80, unit: 'unit', customer: 'Café Central', category: 'Bread', orderCount: 12, lastOrdered: '2026-07-15', inStock: true },
  { id: 'p4', name: 'Farinha T65', price: 1.80, unit: 'kg', customer: 'Padaria Estrela', category: 'Ingredients', orderCount: 30, lastOrdered: '2026-07-19', inStock: true },
  { id: 'p5', name: 'Bolo de Arroz', price: 1.50, unit: 'unit', customer: 'Padaria Estrela', category: 'Pastry', orderCount: 15, lastOrdered: '2026-07-21', inStock: false },
  { id: 'p6', name: 'Manteiga', price: 3.20, unit: '250g', customer: 'Supermercado Sol', category: 'Dairy', orderCount: 8, lastOrdered: '2026-07-18', inStock: true },
  { id: 'p7', name: 'Ovos', price: 2.50, unit: 'dozen', customer: 'Supermercado Sol', category: 'Dairy', orderCount: 22, lastOrdered: '2026-07-22', inStock: true },
  { id: 'p8', name: 'Leite Gordo', price: 0.90, unit: 'L', customer: 'Supermercado Sol', category: 'Dairy', orderCount: 40, lastOrdered: '2026-07-22', inStock: true },
];

const categories = ['All', 'Bread', 'Pastry', 'Ingredients', 'Dairy'];

export default function CustomerPortalSavedPage() {
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [savedItems, setSavedItems] = useState(mockSavedItems);
  const [addedToCart, setAddedToCart] = useState<Set<string>>(new Set());

  const filtered = savedItems.filter((item) => {
    const matchSearch = item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.customer.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'All' || item.category === categoryFilter;
    return matchSearch && matchCat;
  });

  const handleRemove = (id: string) => {
    setSavedItems((prev) => prev.filter((i) => i.id !== id));
  };

  const handleAddToCart = (id: string) => {
    setAddedToCart((prev) => new Set([...prev, id]));
    setTimeout(() => {
      setAddedToCart((prev) => {
        const next = new Set(prev);
        next.delete(id);
        return next;
      });
    }, 2000);
  };

  const topItems = [...savedItems].sort((a, b) => b.orderCount - a.orderCount).slice(0, 3);

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/customer-portal" className="p-2 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors min-h-[44px] min-w-[44px] flex items-center justify-center">
              <ArrowLeft size={20} />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground">Saved Items</h1>
              <p className="text-sm text-muted-foreground mt-0.5">Customer favourite and repeat-order products</p>
            </div>
          </div>
          <Link href="/products" className="btn-primary text-sm flex items-center gap-2 self-start sm:self-auto">
            <Plus size={15} /> Add Product
          </Link>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Saved Items', value: savedItems.length, icon: Heart, color: 'text-danger' },
            { label: 'In Stock', value: savedItems.filter(i => i.inStock).length, icon: Package, color: 'text-success' },
            { label: 'Categories', value: categories.length - 1, icon: Filter, color: 'text-primary' },
            { label: 'Most Ordered', value: topItems[0]?.name || '—', icon: TrendingUp, color: 'text-warning', isText: true },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center gap-2 mb-2">
                <s.icon size={15} className={s.color} />
                <p className="text-xs text-muted-foreground">{s.label}</p>
              </div>
              <p className={`font-bold ${s.color} ${'isText' in s && s.isText ? 'text-sm' : 'text-2xl'}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Top Ordered */}
        <div className="card-base p-5">
          <div className="flex items-center gap-2 mb-4">
            <Star size={16} className="text-warning" />
            <h3 className="font-semibold text-foreground">Most Ordered Items</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {topItems.map((item, i) => (
              <div key={item.id} className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-sm font-bold flex-shrink-0 ${i === 0 ? 'bg-warning' : i === 1 ? 'bg-muted-foreground' : 'bg-primary/60'}`}>
                  #{i + 1}
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{item.name}</p>
                  <p className="text-xs text-muted-foreground">{item.orderCount} orders</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Filters */}
        <div className="card-base p-4 flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search saved items..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2 flex-wrap">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setCategoryFilter(cat)}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                  categoryFilter === cat
                    ? 'bg-primary text-white' :'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        {/* Items Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((item) => (
            <div key={item.id} className="card-base p-5 hover:shadow-md transition-all">
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-center gap-3">
                  <div className="w-11 h-11 rounded-xl bg-danger/10 flex items-center justify-center flex-shrink-0">
                    <Heart size={18} className="text-danger" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{item.name}</p>
                    <p className="text-xs text-muted-foreground">{item.customer}</p>
                  </div>
                </div>
                <button
                  onClick={() => handleRemove(item.id)}
                  className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                >
                  <Trash2 size={14} />
                </button>
              </div>

              <div className="flex items-center justify-between mb-3">
                <div>
                  <p className="text-lg font-bold text-foreground">R {item.price.toFixed(2)}</p>
                  <p className="text-xs text-muted-foreground">per {item.unit}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-muted-foreground">Ordered {item.orderCount}×</p>
                  <p className="text-xs text-muted-foreground">Last: {item.lastOrdered}</p>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-border">
                <span className={`badge-base text-xs ${item.inStock ? 'bg-success/10 text-success' : 'bg-danger/10 text-danger'}`}>
                  {item.inStock ? 'In Stock' : 'Out of Stock'}
                </span>
                <button
                  onClick={() => handleAddToCart(item.id)}
                  disabled={!item.inStock}
                  className={`flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-lg transition-all ${
                    addedToCart.has(item.id)
                      ? 'bg-success/10 text-success'
                      : item.inStock
                      ? 'btn-primary' :'bg-muted text-muted-foreground cursor-not-allowed'
                  }`}
                >
                  <ShoppingCart size={13} />
                  {addedToCart.has(item.id) ? 'Added!' : 'Quick Order'}
                </button>
              </div>
            </div>
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="card-base py-16 text-center">
            <Heart size={40} className="text-muted-foreground mx-auto mb-3 opacity-30" />
            <p className="text-muted-foreground font-medium">No saved items found</p>
            <p className="text-sm text-muted-foreground mt-1">Items customers save for repeat orders appear here</p>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
