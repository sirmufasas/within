'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { Search, Plus, Package, AlertTriangle, Eye, Edit2, Trash2, X, CheckCircle, TrendingUp,  } from 'lucide-react';

interface Product {
  id: string;
  name: string;
  category: string;
  sku: string;
  unit: string;
  stock: number;
  reorderLevel: number;
  costPrice: number;
  sellingPrice: number;
  status: 'ok' | 'low' | 'critical';
  description: string;
}

const statusColors: Record<string, string> = {
  ok: 'bg-success/10 text-success',
  low: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

const statusLabel: Record<string, string> = {
  ok: 'In Stock',
  low: 'Low Stock',
  critical: 'Critical',
};

function computeStatus(stock: number, reorderLevel: number): 'ok' | 'low' | 'critical' {
  if (stock <= 0) return 'critical';
  if (stock <= reorderLevel * 0.5) return 'critical';
  if (stock <= reorderLevel) return 'low';
  return 'ok';
}

const initialProducts: Product[] = [
  { id: 'P001', name: 'Farinha T65', category: 'Ingredients', sku: 'FAR-T65-001', unit: 'kg', stock: 200, reorderLevel: 50, costPrice: 0.85, sellingPrice: 1.20, status: 'ok', description: 'All-purpose wheat flour' },
  { id: 'P002', name: 'Manteiga', category: 'Dairy', sku: 'MAN-001', unit: 'kg', stock: 12, reorderLevel: 20, costPrice: 4.50, sellingPrice: 6.00, status: 'low', description: 'Unsalted butter' },
  { id: 'P003', name: 'Pão de Forma', category: 'Bread', sku: 'PAO-FOR-001', unit: 'unit', stock: 300, reorderLevel: 100, costPrice: 0.45, sellingPrice: 1.20, status: 'ok', description: 'Sliced white bread loaf' },
  { id: 'P004', name: 'Croissant', category: 'Pastry', sku: 'CRO-001', unit: 'unit', stock: 5, reorderLevel: 50, costPrice: 0.60, sellingPrice: 1.50, status: 'critical', description: 'Butter croissant' },
  { id: 'P005', name: 'Leite', category: 'Dairy', sku: 'LEI-001', unit: 'L', stock: 80, reorderLevel: 30, costPrice: 0.90, sellingPrice: 1.40, status: 'ok', description: 'Full-fat milk' },
  { id: 'P006', name: 'Baguette', category: 'Bread', sku: 'BAG-001', unit: 'unit', stock: 150, reorderLevel: 60, costPrice: 0.30, sellingPrice: 0.80, status: 'ok', description: 'French-style baguette' },
  { id: 'P007', name: 'Fermento', category: 'Ingredients', sku: 'FER-001', unit: 'kg', stock: 8, reorderLevel: 10, costPrice: 2.50, sellingPrice: 3.20, status: 'low', description: 'Dry active yeast' },
  { id: 'P008', name: 'Bolo de Mel', category: 'Pastry', sku: 'BOM-001', unit: 'unit', stock: 45, reorderLevel: 20, costPrice: 2.00, sellingPrice: 3.50, status: 'ok', description: 'Honey cake' },
];

const categories = ['Bread', 'Pastry', 'Dairy', 'Ingredients', 'Beverages', 'Other'];
const units = ['kg', 'g', 'L', 'mL', 'unit', 'pack', 'box'];

const emptyProduct = {
  name: '', category: '', sku: '', unit: 'unit',
  stock: 0, reorderLevel: 10, costPrice: 0, sellingPrice: 0, description: '',
};

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>(initialProducts);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selected, setSelected] = useState<Product | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editProduct, setEditProduct] = useState<Product | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [newProduct, setNewProduct] = useState(emptyProduct);

  const allCategories = Array.from(new Set(products.map(p => p.category)));

  const filtered = products.filter(p => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.category.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    const matchCat = categoryFilter === 'all' || p.category === categoryFilter;
    const matchStatus = statusFilter === 'all' || p.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const handleAdd = () => {
    if (!newProduct.name) return;
    const id = `P${String(products.length + 1).padStart(3, '0')}`;
    const status = computeStatus(newProduct.stock, newProduct.reorderLevel);
    setProducts(prev => [{
      ...newProduct,
      id,
      status,
    }, ...prev]);
    setNewProduct(emptyProduct);
    setShowAddModal(false);
  };

  const handleEditSave = () => {
    if (!editProduct) return;
    const updated = { ...editProduct, status: computeStatus(editProduct.stock, editProduct.reorderLevel) };
    setProducts(prev => prev.map(p => p.id === updated.id ? updated : p));
    if (selected?.id === updated.id) setSelected(updated);
    setShowEditModal(false);
    setEditProduct(null);
  };

  const handleDelete = (id: string) => {
    setProducts(prev => prev.filter(p => p.id !== id));
    setDeleteConfirm(null);
    if (selected?.id === id) setSelected(null);
  };

  const openEdit = (p: Product) => {
    setEditProduct({ ...p });
    setShowEditModal(true);
    setSelected(null);
  };

  const totalValue = products.reduce((s, p) => s + p.stock * p.costPrice, 0);
  const lowCount = products.filter(p => p.status === 'low').length;
  const criticalCount = products.filter(p => p.status === 'critical').length;
  const avgMargin = products.length > 0
    ? products.reduce((s, p) => s + ((p.sellingPrice - p.costPrice) / p.sellingPrice) * 100, 0) / products.length
    : 0;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{products.length} products in catalogue</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: products.length, color: 'text-foreground', icon: Package },
            { label: 'Low Stock', value: lowCount, color: 'text-warning', icon: AlertTriangle },
            { label: 'Critical Stock', value: criticalCount, color: 'text-danger', icon: AlertTriangle },
            { label: 'Avg. Margin', value: `${avgMargin.toFixed(0)}%`, color: 'text-success', icon: TrendingUp },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon size={14} className="text-muted-foreground" />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="card-base p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by name, category, or SKU..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <select
              value={categoryFilter}
              onChange={e => setCategoryFilter(e.target.value)}
              className="input-field sm:w-44"
            >
              <option value="all">All Categories</option>
              {allCategories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="input-field sm:w-40"
            >
              <option value="all">All Status</option>
              <option value="ok">In Stock</option>
              <option value="low">Low Stock</option>
              <option value="critical">Critical</option>
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Product</th>
                  <th className="table-header hidden sm:table-cell">SKU</th>
                  <th className="table-header">Stock</th>
                  <th className="table-header hidden md:table-cell">Cost</th>
                  <th className="table-header hidden md:table-cell">Price</th>
                  <th className="table-header hidden lg:table-cell">Margin</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No products found.
                    </td>
                  </tr>
                ) : filtered.map((p) => {
                  const margin = p.sellingPrice > 0 ? ((p.sellingPrice - p.costPrice) / p.sellingPrice * 100).toFixed(0) : '0';
                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                            <Package size={16} className="text-muted-foreground" />
                          </div>
                          <div>
                            <p className="font-medium text-foreground text-sm">{p.name}</p>
                            <p className="text-xs text-muted-foreground">{p.category}</p>
                          </div>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="font-mono text-xs text-muted-foreground">{p.sku}</span>
                      </td>
                      <td className="table-cell">
                        <div>
                          <p className="font-semibold text-foreground text-sm">{p.stock} {p.unit}</p>
                          {p.stock <= p.reorderLevel && (
                            <div className="flex items-center gap-1 text-xs text-warning">
                              <AlertTriangle size={10} />
                              <span>Reorder at {p.reorderLevel}</span>
                            </div>
                          )}
                        </div>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm text-foreground">R {p.costPrice.toFixed(2)}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="text-sm font-semibold text-foreground">R {p.sellingPrice.toFixed(2)}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm font-semibold text-success">{margin}%</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs ${statusColors[p.status]}`}>
                          {statusLabel[p.status]}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelected(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="View">
                            <Eye size={15} />
                          </button>
                          <button onClick={() => openEdit(p)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors" title="Edit">
                            <Edit2 size={15} />
                          </button>
                          <button onClick={() => setDeleteConfirm(p.id)} className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors" title="Delete">
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* VIEW MODAL */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center flex-shrink-0">
                    <Package size={24} className="text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                    <p className="text-sm text-muted-foreground">{selected.category} · {selected.sku}</p>
                    <span className={`badge-base text-xs mt-1 inline-block ${statusColors[selected.status]}`}>
                      {statusLabel[selected.status]}
                    </span>
                  </div>
                </div>
                <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
              </div>
              {selected.description && (
                <p className="text-sm text-muted-foreground mb-4 p-3 bg-muted/30 rounded-lg">{selected.description}</p>
              )}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Current Stock</p>
                  <p className="text-xl font-bold text-foreground">{selected.stock} {selected.unit}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Reorder Level</p>
                  <p className="text-xl font-bold text-foreground">{selected.reorderLevel} {selected.unit}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Cost Price</p>
                  <p className="text-xl font-bold text-foreground">R {selected.costPrice.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-muted/30 rounded-lg">
                  <p className="text-xs text-muted-foreground">Selling Price</p>
                  <p className="text-xl font-bold text-primary">R {selected.sellingPrice.toFixed(2)}</p>
                </div>
                <div className="p-3 bg-success/5 border border-success/20 rounded-lg col-span-2">
                  <p className="text-xs text-muted-foreground">Profit Margin</p>
                  <p className="text-xl font-bold text-success">
                    {selected.sellingPrice > 0 ? ((selected.sellingPrice - selected.costPrice) / selected.sellingPrice * 100).toFixed(1) : 0}%
                  </p>
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={() => openEdit(selected)} className="btn-secondary flex-1 text-sm"><Edit2 size={14} /> Edit</button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ADD MODAL */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowAddModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Add New Product</h3>
                <button onClick={() => setShowAddModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Product Name *</label>
                    <input type="text" className="input-field" placeholder="e.g. Farinha T65" value={newProduct.name} onChange={e => setNewProduct(p => ({ ...p, name: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
                    <select className="input-field" value={newProduct.category} onChange={e => setNewProduct(p => ({ ...p, category: e.target.value }))}>
                      <option value="">Select...</option>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Unit</label>
                    <select className="input-field" value={newProduct.unit} onChange={e => setNewProduct(p => ({ ...p, unit: e.target.value }))}>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">SKU</label>
                    <input type="text" className="input-field" placeholder="e.g. FAR-001" value={newProduct.sku} onChange={e => setNewProduct(p => ({ ...p, sku: e.target.value }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Initial Stock</label>
                    <input type="number" className="input-field" placeholder="0" min={0} value={newProduct.stock} onChange={e => setNewProduct(p => ({ ...p, stock: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Reorder Level</label>
                    <input type="number" className="input-field" placeholder="10" min={0} value={newProduct.reorderLevel} onChange={e => setNewProduct(p => ({ ...p, reorderLevel: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Cost Price (R)</label>
                    <input type="number" className="input-field" placeholder="0.00" min={0} step={0.01} value={newProduct.costPrice} onChange={e => setNewProduct(p => ({ ...p, costPrice: Number(e.target.value) }))} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Selling Price (R)</label>
                    <input type="number" className="input-field" placeholder="0.00" min={0} step={0.01} value={newProduct.sellingPrice} onChange={e => setNewProduct(p => ({ ...p, sellingPrice: Number(e.target.value) }))} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
                    <textarea className="input-field resize-none" rows={2} placeholder="Short product description..." value={newProduct.description} onChange={e => setNewProduct(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={handleAdd} disabled={!newProduct.name} className="btn-primary flex-1 text-sm">
                  <Plus size={15} /> Add Product
                </button>
              </div>
            </div>
          </div>
        )}

        {/* EDIT MODAL */}
        {showEditModal && editProduct && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowEditModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Edit Product</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Product Name</label>
                    <input type="text" className="input-field" value={editProduct.name} onChange={e => setEditProduct(p => p ? { ...p, name: e.target.value } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Category</label>
                    <select className="input-field" value={editProduct.category} onChange={e => setEditProduct(p => p ? { ...p, category: e.target.value } : null)}>
                      {categories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Unit</label>
                    <select className="input-field" value={editProduct.unit} onChange={e => setEditProduct(p => p ? { ...p, unit: e.target.value } : null)}>
                      {units.map(u => <option key={u} value={u}>{u}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">SKU</label>
                    <input type="text" className="input-field" value={editProduct.sku} onChange={e => setEditProduct(p => p ? { ...p, sku: e.target.value } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Stock</label>
                    <input type="number" className="input-field" min={0} value={editProduct.stock} onChange={e => setEditProduct(p => p ? { ...p, stock: Number(e.target.value) } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Reorder Level</label>
                    <input type="number" className="input-field" min={0} value={editProduct.reorderLevel} onChange={e => setEditProduct(p => p ? { ...p, reorderLevel: Number(e.target.value) } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Cost Price (R)</label>
                    <input type="number" className="input-field" min={0} step={0.01} value={editProduct.costPrice} onChange={e => setEditProduct(p => p ? { ...p, costPrice: Number(e.target.value) } : null)} />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Selling Price (R)</label>
                    <input type="number" className="input-field" min={0} step={0.01} value={editProduct.sellingPrice} onChange={e => setEditProduct(p => p ? { ...p, sellingPrice: Number(e.target.value) } : null)} />
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Description</label>
                    <textarea className="input-field resize-none" rows={2} value={editProduct.description} onChange={e => setEditProduct(p => p ? { ...p, description: e.target.value } : null)} />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={handleEditSave} className="btn-primary flex-1 text-sm">
                  <CheckCircle size={15} /> Save Changes
                </button>
              </div>
            </div>
          </div>
        )}

        {/* DELETE CONFIRM */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={e => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Delete Product</h3>
                  <p className="text-sm text-muted-foreground">This cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-5">
                Are you sure you want to delete <span className="font-semibold">{products.find(p => p.id === deleteConfirm)?.name}</span>?
              </p>
              <div className="flex gap-3">
                <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => handleDelete(deleteConfirm)} className="btn-danger flex-1 text-sm">
                  <Trash2 size={15} /> Delete
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
