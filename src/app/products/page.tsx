'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Search, Plus, Package, AlertTriangle, Eye, Edit } from 'lucide-react';

const mockProducts = [
  { id: '1', name: 'Farinha T65', category: 'Ingredients', sku: 'FAR-T65-001', unit: 'kg', stock: 200, reorderLevel: 50, costPrice: 0.85, sellingPrice: 1.20, status: 'ok' },
  { id: '2', name: 'Manteiga', category: 'Dairy', sku: 'MAN-001', unit: 'kg', stock: 12, reorderLevel: 20, costPrice: 4.50, sellingPrice: 6.00, status: 'low' },
  { id: '3', name: 'Pão de Forma', category: 'Bread', sku: 'PAO-FOR-001', unit: 'unit', stock: 300, reorderLevel: 100, costPrice: 0.45, sellingPrice: 1.20, status: 'ok' },
  { id: '4', name: 'Croissant', category: 'Pastry', sku: 'CRO-001', unit: 'unit', stock: 5, reorderLevel: 50, costPrice: 0.60, sellingPrice: 1.50, status: 'critical' },
  { id: '5', name: 'Leite', category: 'Dairy', sku: 'LEI-001', unit: 'L', stock: 80, reorderLevel: 30, costPrice: 0.90, sellingPrice: 1.40, status: 'ok' },
];

const statusColors: Record<string, string> = {
  ok: 'bg-success/10 text-success',
  low: 'bg-warning/10 text-warning',
  critical: 'bg-danger/10 text-danger',
};

export default function ProductsPage() {
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<typeof mockProducts[0] | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);

  const filtered = mockProducts.filter(p =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.category.toLowerCase().includes(search.toLowerCase()) ||
    p.sku.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Products</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockProducts.length} products</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm">
            <Plus size={16} /> Add Product
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Products', value: mockProducts.length, color: 'text-foreground' },
            { label: 'Low Stock', value: mockProducts.filter(p => p.status === 'low').length, color: 'text-warning' },
            { label: 'Critical Stock', value: mockProducts.filter(p => p.status === 'critical').length, color: 'text-danger' },
            { label: 'Total Value', value: 'R 1,240', color: 'text-success' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="card-base p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search products..."
              className="input-field pl-9"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        {/* Products Table */}
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
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((product) => (
                  <tr key={product.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-muted flex items-center justify-center flex-shrink-0">
                          <Package size={16} className="text-muted-foreground" />
                        </div>
                        <div>
                          <p className="font-medium text-foreground text-sm">{product.name}</p>
                          <p className="text-xs text-muted-foreground">{product.category}</p>
                        </div>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="font-mono text-xs text-muted-foreground">{product.sku}</span>
                    </td>
                    <td className="table-cell">
                      <div>
                        <p className="font-semibold text-foreground text-sm">{product.stock} {product.unit}</p>
                        {product.stock <= product.reorderLevel && (
                          <div className="flex items-center gap-1 text-xs text-warning">
                            <AlertTriangle size={10} />
                            <span>Reorder at {product.reorderLevel}</span>
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-foreground">R {product.costPrice.toFixed(2)}</span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm font-semibold text-foreground">R {product.sellingPrice.toFixed(2)}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${statusColors[product.status]}`}>
                        {product.status === 'ok' ? 'In Stock' : product.status === 'low' ? 'Low Stock' : 'Critical'}
                      </span>
                    </td>
                    <td className="table-cell">
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => setSelected(product)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                        >
                          <Eye size={15} />
                        </button>
                        <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                          <Edit size={15} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Product Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-xl bg-muted flex items-center justify-center">
                  <Package size={24} className="text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.category} · {selected.sku}</p>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3 mb-6">
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
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 text-sm">Edit Product</button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* Add Product Modal */}
        {showAddModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowAddModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <h3 className="text-lg font-bold text-foreground mb-6">Add New Product</h3>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-1.5">Product Name</label>
                  <input type="text" className="input-field" placeholder="e.g. Farinha T65" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Category</label>
                    <input type="text" className="input-field" placeholder="e.g. Ingredients" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Unit</label>
                    <select className="input-field">
                      <option>kg</option>
                      <option>unit</option>
                      <option>L</option>
                      <option>g</option>
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Cost Price</label>
                    <input type="number" className="input-field" placeholder="0.00" step="0.01" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-foreground mb-1.5">Selling Price</label>
                    <input type="number" className="input-field" placeholder="0.00" step="0.01" />
                  </div>
                </div>
              </div>
              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowAddModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button onClick={() => setShowAddModal(false)} className="btn-primary flex-1 text-sm">Add Product</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
