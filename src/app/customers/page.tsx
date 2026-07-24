'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Search, Plus, Phone, MapPin, Eye, Edit2, Trash2, X, CheckCircle,
  User, ShoppingCart, DollarSign, Link2, Copy, Package, Check,
} from 'lucide-react';

interface CustomerRow {
  id: string;
  name: string;
  phone: string | null;
  address: string | null;
  driver: string | null;
  sort_order: number;
  created_at: string;
}

interface ProductOption {
  id: string;
  name: string;
  category: string | null;
}

const emptyForm = { name: '', phone: '', address: '', driver: '' };

export default function CustomersPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [customers, setCustomers] = useState<CustomerRow[]>([]);
  const [statsByCustomer, setStatsByCustomer] = useState<Record<string, { orders: number; revenue: number }>>({});
  const [tokenByCustomer, setTokenByCustomer] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<CustomerRow | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<CustomerRow | null>(null);
  const [deleteBlockedReason, setDeleteBlockedReason] = useState<string | null>(null);

  const [showProductsModal, setShowProductsModal] = useState<CustomerRow | null>(null);
  const [allProducts, setAllProducts] = useState<ProductOption[]>([]);
  const [assignedProductIds, setAssignedProductIds] = useState<Set<string>>(new Set());
  const [productsLoading, setProductsLoading] = useState(false);

  const loadCustomers = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [customersRes, tokensRes, itemsRes] = await Promise.all([
        supabase.from('customers').select('*').eq('business_id', business.id).order('sort_order'),
        supabase.from('customer_portal_access').select('customer_id, portal_token').eq('business_id', business.id),
        supabase
          .from('order_submission_items')
          .select('quantity, unit_price, products ( selling_price ), order_submissions!inner ( id, customer_id, business_id )')
          .eq('order_submissions.business_id', business.id),
      ]);
      if (customersRes.error) throw customersRes.error;
      if (tokensRes.error) throw tokensRes.error;
      if (itemsRes.error) throw itemsRes.error;

      setCustomers(customersRes.data || []);

      const tokenMap: Record<string, string> = {};
      (tokensRes.data || []).forEach((t: any) => { tokenMap[t.customer_id] = t.portal_token; });
      setTokenByCustomer(tokenMap);

      const stats: Record<string, { orders: number; revenue: number; orderIds: Set<string> }> = {};
      (itemsRes.data as any[] || []).forEach((row) => {
        const cid = row.order_submissions?.customer_id;
        if (!cid) return;
        if (!stats[cid]) stats[cid] = { orders: 0, revenue: 0, orderIds: new Set() };
        const price = row.unit_price && row.unit_price > 0 ? row.unit_price : (row.products?.selling_price || 0);
        stats[cid].revenue += price * row.quantity;
        stats[cid].orderIds.add(row.order_submissions.id);
      });
      const finalStats: Record<string, { orders: number; revenue: number }> = {};
      Object.entries(stats).forEach(([cid, v]) => { finalStats[cid] = { orders: v.orderIds.size, revenue: v.revenue }; });
      setStatsByCustomer(finalStats);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load customers');
    } finally {
      setLoading(false);
    }
  }, [business?.id, supabase]);

  useEffect(() => {
    loadCustomers();
  }, [loadCustomers]);

  const filtered = useMemo(() => customers.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone || '').includes(search)
  ), [customers, search]);

  const totalOrders = Object.values(statsByCustomer).reduce((s, v) => s + v.orders, 0);
  const totalRevenue = Object.values(statsByCustomer).reduce((s, v) => s + v.revenue, 0);

  const resetForm = () => setForm(emptyForm);

  const handleAdd = async () => {
    if (!business?.id || !form.name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      const slug = form.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') || `customer-${Date.now()}`;
      const { data, error } = await supabase
        .from('customers')
        .insert({
          business_id: business.id,
          name: form.name,
          phone: form.phone || null,
          address: form.address || null,
          driver: form.driver || null,
          slug,
          sort_order: customers.length,
        })
        .select()
        .single();
      if (error) throw error;
      setCustomers((prev) => [...prev, data]);
      resetForm();
      setShowAddModal(false);
      toast.success('Customer added — their order link is ready');
      loadCustomers(); // pick up the auto-generated portal token
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add customer');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (c: CustomerRow) => {
    setEditId(c.id);
    setForm({ name: c.name, phone: c.phone || '', address: c.address || '', driver: c.driver || '' });
    setSelected(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editId) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('customers')
        .update({ name: form.name, phone: form.phone || null, address: form.address || null, driver: form.driver || null })
        .eq('id', editId)
        .select()
        .single();
      if (error) throw error;
      setCustomers((prev) => prev.map((c) => (c.id === editId ? data : c)));
      setShowEditModal(false);
      setEditId(null);
      toast.success('Customer updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update customer');
    } finally {
      setSaving(false);
    }
  };

  const confirmDelete = async (customer: CustomerRow) => {
    setDeleteBlockedReason(null);
    const orderCount = statsByCustomer[customer.id]?.orders || 0;
    if (orderCount > 0) {
      setDeleteBlockedReason(`This customer has ${orderCount} order${orderCount !== 1 ? 's' : ''} on record. Remove or reassign those orders first — deleting a customer with order history isn't allowed, to protect your records.`);
    }
    setDeleteConfirm(customer);
  };

  const handleDelete = async () => {
    if (!deleteConfirm || deleteBlockedReason) return;
    setSaving(true);
    try {
      await supabase.from('customer_products').delete().eq('customer_id', deleteConfirm.id);
      await supabase.from('customer_saved_items').delete().eq('customer_id', deleteConfirm.id);
      await supabase.from('customer_portal_access').delete().eq('customer_id', deleteConfirm.id);
      const { error } = await supabase.from('customers').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      setCustomers((prev) => prev.filter((c) => c.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      if (selected?.id === deleteConfirm.id) setSelected(null);
      toast.success('Customer deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete customer');
    } finally {
      setSaving(false);
    }
  };

  const getPortalLink = (customerId: string) => {
    const token = tokenByCustomer[customerId];
    if (!token) return null;
    return `${window.location.origin}/order/${token}`;
  };

  const copyPortalLink = (customerId: string) => {
    const link = getPortalLink(customerId);
    if (!link) {
      toast.error('No order link found yet — try refreshing the page.');
      return;
    }
    navigator.clipboard.writeText(link);
    toast.success('Order link copied — send it to your customer');
  };

  const openProductsModal = async (customer: CustomerRow) => {
    setShowProductsModal(customer);
    setProductsLoading(true);
    try {
      const [productsRes, assignedRes] = await Promise.all([
        supabase.from('products').select('id, name, category').eq('business_id', business!.id).eq('is_active', true).order('name'),
        supabase.from('customer_products').select('product_id').eq('customer_id', customer.id),
      ]);
      if (productsRes.error) throw productsRes.error;
      if (assignedRes.error) throw assignedRes.error;
      setAllProducts(productsRes.data || []);
      setAssignedProductIds(new Set((assignedRes.data || []).map((r: any) => r.product_id)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load products');
    } finally {
      setProductsLoading(false);
    }
  };

  const toggleProductAssignment = async (productId: string) => {
    if (!showProductsModal) return;
    const isAssigned = assignedProductIds.has(productId);
    const prevSet = new Set(assignedProductIds);
    const nextSet = new Set(assignedProductIds);
    isAssigned ? nextSet.delete(productId) : nextSet.add(productId);
    setAssignedProductIds(nextSet);
    try {
      if (isAssigned) {
        const { error } = await supabase
          .from('customer_products')
          .delete()
          .eq('customer_id', showProductsModal.id)
          .eq('product_id', productId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('customer_products').insert({
          customer_id: showProductsModal.id,
          product_id: productId,
          sort_order: nextSet.size,
          sheet_row: nextSet.size,
        });
        if (error) throw error;
      }
    } catch (err: any) {
      setAssignedProductIds(prevSet);
      toast.error(err?.message || 'Failed to update product list');
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Customers</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{customers.length} total customers</p>
          </div>
          <button onClick={() => { resetForm(); setShowAddModal(true); }} className="btn-primary text-sm">
            <Plus size={16} /> Add Customer
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
          {[
            { label: 'Total Customers', value: customers.length, color: 'text-primary', icon: User },
            { label: 'Total Orders', value: totalOrders, color: 'text-foreground', icon: ShoppingCart },
            { label: 'Total Revenue', value: `R ${totalRevenue.toLocaleString(undefined, { maximumFractionDigits: 0 })}`, color: 'text-success', icon: DollarSign },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-muted-foreground">{s.label}</p>
                <s.icon size={14} className="text-muted-foreground" />
              </div>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        <div className="card-base p-4">
          <div className="relative">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input type="text" placeholder="Search by name or phone..." className="input-field pl-9 w-full" value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>

        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Customer</th>
                  <th className="table-header hidden sm:table-cell">Phone</th>
                  <th className="table-header hidden md:table-cell">Address</th>
                  <th className="table-header">Orders</th>
                  <th className="table-header hidden lg:table-cell">Revenue</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2].map((i) => <tr key={i}><td colSpan={6} className="table-cell"><div className="h-6 skeleton-wave rounded" /></td></tr>)
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No customers found.</td></tr>
                ) : (
                  filtered.map((c) => {
                    const stats = statsByCustomer[c.id] || { orders: 0, revenue: 0 };
                    return (
                      <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-2">
                            <div className="w-7 h-7 rounded-full within-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{c.name[0]}</div>
                            <p className="text-sm font-medium text-foreground">{c.name}</p>
                          </div>
                        </td>
                        <td className="table-cell hidden sm:table-cell"><span className="text-sm text-foreground">{c.phone || '—'}</span></td>
                        <td className="table-cell hidden md:table-cell"><span className="text-sm text-muted-foreground truncate max-w-[200px] block">{c.address || '—'}</span></td>
                        <td className="table-cell"><span className="text-sm font-semibold text-foreground">{stats.orders}</span></td>
                        <td className="table-cell hidden lg:table-cell"><span className="text-sm font-semibold text-foreground">R {stats.revenue.toFixed(2)}</span></td>
                        <td className="table-cell">
                          <div className="flex items-center gap-1">
                            <button onClick={() => setSelected(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="View"><Eye size={14} /></button>
                            <button onClick={() => copyPortalLink(c.id)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-primary" title="Copy order link"><Link2 size={14} /></button>
                            <button onClick={() => openEdit(c)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit2 size={14} /></button>
                            <button onClick={() => confirmDelete(c)} className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-3 text-sm mb-5">
              <div className="flex items-center gap-2 text-muted-foreground"><Phone size={13} /><span>{selected.phone || 'No phone on file'}</span></div>
              <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={13} /><span>{selected.address || 'No address on file'}</span></div>
            </div>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Orders</p>
                <p className="text-xl font-bold text-foreground">{statsByCustomer[selected.id]?.orders || 0}</p>
              </div>
              <div className="p-3 bg-muted/30 rounded-xl text-center">
                <p className="text-xs text-muted-foreground mb-1">Revenue</p>
                <p className="text-xl font-bold text-primary">R {(statsByCustomer[selected.id]?.revenue || 0).toFixed(2)}</p>
              </div>
            </div>
            <div className="p-3 bg-muted/30 rounded-xl mb-5">
              <p className="text-xs text-muted-foreground mb-2">Their order link — send this to the customer</p>
              <div className="flex items-center gap-2">
                <code className="text-xs text-foreground truncate flex-1 bg-card px-2 py-1.5 rounded-lg border border-border">
                  {getPortalLink(selected.id) || 'Generating...'}
                </code>
                <button onClick={() => copyPortalLink(selected.id)} className="btn-secondary text-xs py-1.5 px-2.5 flex-shrink-0"><Copy size={13} /></button>
              </div>
            </div>
            <div className="flex gap-3">
              <button onClick={() => openProductsModal(selected)} className="btn-secondary flex-1 text-sm"><Package size={15} /> Manage Products</button>
              <button onClick={() => openEdit(selected)} className="btn-primary flex-1 text-sm"><Edit2 size={15} /> Edit</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD / EDIT MODAL */}
      {(showAddModal || showEditModal) && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => { setShowAddModal(false); setShowEditModal(false); }}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">{showAddModal ? 'Add Customer' : 'Edit Customer'}</h3>
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Customer / Business Name</label>
                <input type="text" className="input-field" placeholder="e.g. Café Central" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                <input type="text" className="input-field" placeholder="+351 21 555 0001" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                <input type="text" className="input-field" placeholder="Delivery address" value={form.address} onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Default Driver</label>
                <input type="text" className="input-field" placeholder="e.g. Miguel" value={form.driver} onChange={(e) => setForm((f) => ({ ...f, driver: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowAddModal(false); setShowEditModal(false); }} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={showAddModal ? handleAdd : handleEditSave} disabled={!form.name.trim() || saving} className="btn-primary flex-1 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />} {saving ? 'Saving...' : showAddModal ? 'Add Customer' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE PRODUCTS MODAL */}
      {showProductsModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowProductsModal(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-lg font-bold text-foreground">Products for {showProductsModal.name}</h3>
              <button onClick={() => setShowProductsModal(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <p className="text-xs text-muted-foreground mb-4">Checked products appear on this customer's order page.</p>
            {productsLoading ? (
              <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 skeleton-wave rounded-lg" />)}</div>
            ) : allProducts.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No active products yet — add some under Products first.</p>
            ) : (
              <div className="space-y-1.5">
                {allProducts.map((p) => {
                  const assigned = assignedProductIds.has(p.id);
                  return (
                    <button
                      key={p.id}
                      onClick={() => toggleProductAssignment(p.id)}
                      className={`w-full flex items-center justify-between gap-3 px-3 py-2.5 rounded-lg border text-left transition-colors ${
                        assigned ? 'bg-primary/5 border-primary/30' : 'border-border hover:bg-muted/30'
                      }`}
                    >
                      <div>
                        <p className="text-sm font-medium text-foreground">{p.name}</p>
                        {p.category && <p className="text-xs text-muted-foreground">{p.category}</p>}
                      </div>
                      <div className={`w-5 h-5 rounded-md flex items-center justify-center flex-shrink-0 ${assigned ? 'bg-primary' : 'border border-border'}`}>
                        {assigned && <Check size={13} className="text-white" />}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
            <button onClick={() => setShowProductsModal(null)} className="btn-primary w-full text-sm mt-5">Done</button>
          </div>
        </div>
      )}

      {/* DELETE CONFIRM */}
      {deleteConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeleteConfirm(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center"><Trash2 size={18} className="text-danger" /></div>
              <div>
                <h3 className="font-bold text-foreground">Delete Customer</h3>
                <p className="text-sm text-muted-foreground">This cannot be undone.</p>
              </div>
            </div>
            {deleteBlockedReason ? (
              <p className="text-sm text-warning bg-warning/10 rounded-lg p-3 mb-5">{deleteBlockedReason}</p>
            ) : (
              <p className="text-sm text-foreground mb-5">
                Delete <span className="font-semibold">{deleteConfirm.name}</span>? Their order link and product list will also be removed.
              </p>
            )}
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">{deleteBlockedReason ? 'Close' : 'Cancel'}</button>
              {!deleteBlockedReason && (
                <button onClick={handleDelete} disabled={saving} className="btn-danger flex-1 text-sm">{saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />} {saving ? 'Deleting...' : 'Delete'}</button>
              )}
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
