'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Search, Plus, Package, AlertTriangle, Edit2, Trash2, X, CheckCircle, EyeOff, Eye,
} from 'lucide-react';

interface ProductRow {
  id: string;
  business_id: string;
  name: string;
  category: string | null;
  image_url: string | null;
  ingredients: string | null;
  sku: string | null;
  unit: string | null;
  cost_price: number | null;
  selling_price: number | null;
  reorder_level: number | null;
  is_active: boolean;
  created_at: string;
}

interface ProductWithStock extends ProductRow {
  stock: number;
}

type StockStatus = 'ok' | 'low' | 'critical';

const statusColors: Record<StockStatus, string> = {
  ok: 'bg-success/10 text-success',
  low: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

const statusLabel: Record<StockStatus, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

function computeStatus(stock: number, reorderLevel: number): StockStatus {
  if (stock <= 0) return 'critical';
  if (reorderLevel > 0 && stock <= reorderLevel * 0.5) return 'critical';
  if (reorderLevel > 0 && stock <= reorderLevel) return 'low';
  return 'ok';
}

const units = ['kg', 'g', 'L', 'mL', 'unit', 'pack', 'box'];

type ProductFormState = {
  name: string;
  category: string;
  sku: string;
  unit: string;
  reorder_level: number;
  cost_price: number;
  selling_price: number;
  ingredients: string;
  image_url: string;
};

const emptyForm: ProductFormState = {
  name: '', category: '', sku: '', unit: 'unit',
  reorder_level: 10, cost_price: 0, selling_price: 0, ingredients: '', image_url: '',
};

export default function ProductsPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [products, setProducts] = useState<ProductWithStock[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState<'all' | StockStatus>('all');
  const [showInactive, setShowInactive] = useState(false);

  const [selected, setSelected] = useState<ProductWithStock | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [deactivateConfirm, setDeactivateConfirm] = useState<ProductWithStock | null>(null);
  const [form, setForm] = useState<ProductFormState>(emptyForm);

  const loadProducts = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [productsRes, batchesRes] = await Promise.all([
        supabase.from('products').select('*').eq('business_id', business.id).order('name'),
        supabase.from('stock_batches').select('product_id, quantity').eq('business_id', business.id),
      ]);
      if (productsRes.error) throw productsRes.error;
      if (batchesRes.error) throw batchesRes.error;

      const stockByProduct = new Map<string, number>();
      (batchesRes.data || []).forEach((b: { product_id: string; quantity: number }) => {
        stockByProduct.set(b.product_id, (stockByProduct.get(b.product_id) || 0) + Number(b.quantity || 0));
      });

      const merged: ProductWithStock[] = (productsRes.data || []).map((p: ProductRow) => ({
        ...p,
        stock: stockByProduct.get(p.id) || 0,
      }));
      setProducts(merged);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load products');
    } finally {
      setLoading(false);
    }
  }, [business?.id, supabase]);

  useEffect(() => {
    loadProducts();
  }, [loadProducts]);

  const allCategories = useMemo(
    () => Array.from(new Set(products.map((p) => p.category).filter(Boolean))) as string[],
    [products]
  );

  const filtered = useMemo(() => products.filter((p) => {
    if (!showInactive && !p.is_active) return false;
    const status = computeStatus(p.stock, p.reorder_level || 0);
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      (p.category || '').toLowerCase().includes(search.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  }), [products, search, categoryFilter, statusFilter, showInactive]);

  const activeProducts = useMemo(() => products.filter((p) => p.is_active), [products]);
  const totalValue = activeProducts.reduce((s, p) => s + p.stock * (p.cost_price || 0), 0);
  const lowCount = activeProducts.filter((p) => computeStatus(p.stock, p.reorder_level || 0) === 'low').length;
  const criticalCount = activeProducts.filter((p) => computeStatus(p.stock, p.reorder_level || 0) === 'critical').length;
  const avgMargin = activeProducts.length > 0
    ? activeProducts.reduce((s, p) => {
        const sp = p.selling_price || 0;
        const cp = p.cost_price || 0;
        return s + (sp > 0 ? ((sp - cp) / sp) * 100 : 0);
      }, 0) / activeProducts.length
    : 0;

  const resetForm = () => setForm(emptyForm);

  const handleAdd = async () => {
    if (!business?.id || !form.name.trim()) {
      toast.error('Product name is required');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .insert({
          business_id: business.id,
          name: form.name,
          category: form.category || null,
          sku: form.sku || null,
          unit: form.unit,
          reorder_level: form.reorder_level,
          cost_price: form.cost_price,
          selling_price: form.selling_price,
          ingredients: form.ingredients || null,
          image_url: form.image_url || null,
          is_active: true,
        })
        .select()
        .single();
      if (error) throw error;
      setProducts((prev) => [{ ...(data as ProductRow), stock: 0 }, ...prev]);
      resetForm();
      setShowAddModal(false);
      toast.success('Product added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add product');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (p: ProductWithStock) => {
    setEditId(p.id);
    setForm({
      name: p.name,
      category: p.category || '',
      sku: p.sku || '',
      unit: p.unit || 'unit',
      reorder_level: p.reorder_level || 0,
      cost_price: p.cost_price || 0,
      selling_price: p.selling_price || 0,
      ingredients: p.ingredients || '',
      image_url: p.image_url || '',
    });
    setShowEditModal(true);
    setSelected(null);
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('products')
        .update({
          name: form.name,
          category: form.category || null,
          sku: form.sku || null,
          unit: form.unit,
          reorder_level: form.reorder_level,
          cost_price: form.cost_price,
          selling_price: form.selling_price,
          ingredients: form.ingredients || null,
          image_url: form.image_url || null,
        })
        .eq('id', editId)
        .select()
        .single();
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === editId ? { ...(data as ProductRow), stock: p.stock } : p)));
      setShowEditModal(false);
      setEditId(null);
      toast.success('Product updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  // Soft delete: products may be referenced by historical orders/stock batches,
  // so we deactivate rather than hard-delete to avoid breaking order history.
  const handleToggleActive = async (product: ProductWithStock) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('products')
        .update({ is_active: !product.is_active })
        .eq('id', product.id);
      if (error) throw error;
      setProducts((prev) => prev.map((p) => (p.id === product.id ? { ...p, is_active: !p.is_active } : p)));
      setDeactivateConfirm(null);
      if (selected?.id === product.id) setSelected(null);
      toast.success(product.is_active ? 'Product deactivated' : 'Product reactivated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update product');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{activeProducts.length} active products in catalogue</p>
          </div>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Stock Value', value: `R ${totalValue.toLocaleString(undefined, { maximumFractionDigits: 2 })}`, color: 'text-foreground' },
            { label: 'Low Stock', value: lowCount, color: 'text-warning' },
            { label: 'Critical', value: criticalCount, color: 'text-danger' },
            { label: 'Avg Margin', value: `${avgMargin.toFixed(0)}%`, color: 'text-success' },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search by name, category, or SKU..."
              className="input-field pl-9 w-full text-sm"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="input-field text-sm w-full sm:w-44" value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)}>
            <option value="all">All Categories</option>
            {allCategories.map((c) => <option key={c} value={c}>{c}</option>)}
          </select>
          <select className="input-field text-sm w-full sm:w-40" value={statusFilter} onChange={(e) => setStatusFilter(e.target.value as any)}>
            <option value="all">All Status</option>
            <option value="ok">In Stock</option>
            <option value="low">Low Stock</option>
            <option value="critical">Critical</option>
          </select>
          <label className="flex items-center gap-2 text-sm text-muted-foreground whitespace-nowrap px-1">
            <input type="checkbox" checked={showInactive} onChange={(e) => setShowInactive(e.target.checked)} />
            Show deactivated
          </label>
        </div>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[0, 1, 2, 3, 4, 5].map((i) => <div key={i} className="card-base p-5 h-44 skeleton-wave" />)}
          </div>
        ) : filtered.length === 0 ? (
          <div className="card-base p-10 text-center">
            <Package className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="font-medium text-foreground">No products found</p>
            <p className="text-sm text-muted-foreground mt-1">Try adjusting your filters, or add your first product.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filtered.map((p) => {
              const status = computeStatus(p.stock, p.reorder_level || 0);
              return (
                <div key={p.id} className={`card-base p-5 ${!p.is_active ? 'opacity-60' : ''}`}>
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="font-semibold text-foreground">{p.name}</p>
                      <p className="text-xs text-muted-foreground">{p.category || 'Uncategorised'} {p.sku ? `· ${p.sku}` : ''}</p>
                    </div>
                    <span className={`badge-base text-xs ${statusColors[status]}`}>{statusLabel[status]}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-3">
                    <span className="text-muted-foreground">Stock</span>
                    <span className="font-semibold text-foreground">{p.stock} {p.unit}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-muted-foreground">Cost / Sell</span>
                    <span className="font-semibold text-foreground">R {(p.cost_price || 0).toFixed(2)} / R {(p.selling_price || 0).toFixed(2)}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center gap-2">
                    <button onClick={() => openEdit(p)} className="btn-secondary text-xs py-1.5 px-3 flex-1">
                      <Edit2 size={13} /> Edit
                    </button>
                    <button
                      onClick={() => setDeactivateConfirm(p)}
                      className={`btn-secondary text-xs py-1.5 px-2.5 ${p.is_active ? 'text-danger hover:bg-danger/10' : 'text-success hover:bg-success/10'}`}
                      title={p.is_active ? 'Deactivate' : 'Reactivate'}
                    >
                      {p.is_active ? <EyeOff size={13} /> : <Eye size={13} />}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* ADD MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowAddModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Add Product</h3>
              <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <ProductFormFields form={form} setForm={setForm} categories={allCategories} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleAdd} disabled={!form.name.trim() || saving} className="btn-primary flex-1 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Plus size={15} />} {saving ? 'Adding...' : 'Add Product'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* EDIT MODAL */}
      {showEditModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowEditModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Edit Product</h3>
              <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <ProductFormFields form={form} setForm={setForm} categories={allCategories} />
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleEditSave} disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />} {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* DEACTIVATE / REACTIVATE CONFIRM */}
      {deactivateConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeactivateConfirm(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
                <AlertTriangle size={18} className="text-warning" />
              </div>
              <div>
                <h3 className="font-bold text-foreground">{deactivateConfirm.is_active ? 'Deactivate' : 'Reactivate'} Product</h3>
                <p className="text-sm text-muted-foreground">
                  {deactivateConfirm.is_active
                    ? "Hidden from ordering, but order history is kept."
                    : 'This product will be orderable again.'}
                </p>
              </div>
            </div>
            <p className="text-sm text-foreground mb-5">
              {deactivateConfirm.is_active ? 'Deactivate' : 'Reactivate'} <span className="font-semibold">{deactivateConfirm.name}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeactivateConfirm(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => handleToggleActive(deactivateConfirm)} disabled={saving} className="btn-danger flex-1 text-sm">
                {saving && <span className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin inline-block mr-1.5" />}
                {saving ? 'Saving...' : deactivateConfirm.is_active ? 'Deactivate' : 'Reactivate'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}

function ProductFormFields({
  form,
  setForm,
  categories,
}: {
  form: ProductFormState;
  setForm: React.Dispatch<React.SetStateAction<ProductFormState>>;
  categories: string[];
}) {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1.5">Product Name</label>
          <input type="text" className="input-field" placeholder="e.g. Farinha T65" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
          <input list="product-categories" type="text" className="input-field" placeholder="e.g. Bread" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))} />
          <datalist id="product-categories">
            {categories.map((c) => <option key={c} value={c} />)}
          </datalist>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Unit</label>
          <select className="input-field" value={form.unit} onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}>
            {units.map((u) => <option key={u} value={u}>{u}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">SKU</label>
          <input type="text" className="input-field" placeholder="e.g. FAR-001" value={form.sku} onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Reorder Level</label>
          <input type="number" className="input-field" placeholder="10" min={0} value={form.reorder_level} onChange={(e) => setForm((f) => ({ ...f, reorder_level: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Cost Price (R)</label>
          <input type="number" className="input-field" placeholder="0.00" min={0} step={0.01} value={form.cost_price} onChange={(e) => setForm((f) => ({ ...f, cost_price: Number(e.target.value) }))} />
        </div>
        <div>
          <label className="block text-xs font-medium text-foreground mb-1.5">Selling Price (R)</label>
          <input type="number" className="input-field" placeholder="0.00" min={0} step={0.01} value={form.selling_price} onChange={(e) => setForm((f) => ({ ...f, selling_price: Number(e.target.value) }))} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1.5">Image URL (optional)</label>
          <input type="text" className="input-field" placeholder="https://..." value={form.image_url} onChange={(e) => setForm((f) => ({ ...f, image_url: e.target.value }))} />
        </div>
        <div className="col-span-2">
          <label className="block text-xs font-medium text-foreground mb-1.5">Ingredients / Notes</label>
          <textarea className="input-field resize-none" rows={2} placeholder="Optional notes..." value={form.ingredients} onChange={(e) => setForm((f) => ({ ...f, ingredients: e.target.value }))} />
        </div>
      </div>
    </div>
  );
}
