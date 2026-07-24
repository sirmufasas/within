'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Search, Plus, Eye, Edit2, Trash2, Filter, X, Package, Clock, CheckCircle,
  Truck, XCircle, RefreshCw,
} from 'lucide-react';

type OrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';
type PaymentStatus = 'pending' | 'paid' | 'overdue';

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-warning/10 text-warning border border-warning/20',
  confirmed: 'bg-info/10 text-info border border-info/20',
  processing: 'bg-primary/10 text-primary border border-primary/20',
  ready: 'bg-success/10 text-success border border-success/20',
  delivered: 'bg-success/10 text-success border border-success/20',
  cancelled: 'bg-danger/10 text-danger border border-danger/20',
};

const statusIcons: Record<OrderStatus, React.ReactNode> = {
  pending: <Clock size={12} />,
  confirmed: <CheckCircle size={12} />,
  processing: <RefreshCw size={12} />,
  ready: <Package size={12} />,
  delivered: <Truck size={12} />,
  cancelled: <XCircle size={12} />,
};

const ALL_STATUSES: OrderStatus[] = ['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'];

interface CustomerOption { id: string; name: string; phone: string | null; address: string | null; }
interface ProductOption { id: string; name: string; unit: string | null; selling_price: number | null; }
interface DriverOption { id: string; name: string; }

interface OrderItemRow {
  id: string;
  product_id: string | null;
  product_name: string;
  quantity: number;
  unit_price: number | null;
  products: { selling_price: number | null } | null;
}

interface OrderRow {
  id: string;
  customer_id: string;
  for_date: string;
  delivery_date: string | null;
  total_items: number;
  order_type: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  driver_id: string | null;
  notes: string | null;
  created_at: string;
  customers: { name: string; phone: string | null; address: string | null } | null;
  drivers: { name: string } | null;
  order_submission_items: OrderItemRow[];
}

type FormItem = { product_id: string; product_name: string; quantity: number; unit_price: number; unit: string };

type OrderForm = {
  customer_id: string;
  delivery_date: string;
  driver_id: string;
  status: OrderStatus;
  payment_status: PaymentStatus;
  notes: string;
  items: FormItem[];
};

const emptyItem: FormItem = { product_id: '', product_name: '', quantity: 1, unit_price: 0, unit: 'unit' };
const emptyForm: OrderForm = {
  customer_id: '', delivery_date: '', driver_id: '', status: 'pending', payment_status: 'pending',
  notes: '', items: [{ ...emptyItem }],
};

function lineTotal(item: { quantity: number; unit_price: number | null; products?: { selling_price: number | null } | null }) {
  const price = item.unit_price && item.unit_price > 0 ? item.unit_price : (item.products?.selling_price || 0);
  return price * item.quantity;
}

function orderTotal(order: OrderRow) {
  return order.order_submission_items.reduce((s, it) => s + lineTotal(it), 0);
}

export default function OrdersPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [customers, setCustomers] = useState<CustomerOption[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [drivers, setDrivers] = useState<DriverOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | OrderStatus>('all');
  const [paymentFilter, setPaymentFilter] = useState<'all' | PaymentStatus>('all');
  const [showFilters, setShowFilters] = useState(false);

  const [selected, setSelected] = useState<OrderRow | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState<OrderForm>(emptyForm);
  const [deleteConfirm, setDeleteConfirm] = useState<OrderRow | null>(null);

  const ORDER_SELECT = `
    id, customer_id, for_date, delivery_date, total_items, order_type, status, payment_status, driver_id, notes, created_at,
    customers ( name, phone, address ),
    drivers ( name ),
    order_submission_items ( id, product_id, product_name, quantity, unit_price, products ( selling_price ) )
  `;

  const loadAll = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [ordersRes, customersRes, productsRes, driversRes] = await Promise.all([
        supabase.from('order_submissions').select(ORDER_SELECT).eq('business_id', business.id).order('created_at', { ascending: false }),
        supabase.from('customers').select('id, name, phone, address').eq('business_id', business.id).order('name'),
        supabase.from('products').select('id, name, unit, selling_price').eq('business_id', business.id).eq('is_active', true).order('name'),
        supabase.from('drivers').select('id, name').eq('business_id', business.id),
      ]);
      if (ordersRes.error) throw ordersRes.error;
      if (customersRes.error) throw customersRes.error;
      if (productsRes.error) throw productsRes.error;
      if (driversRes.error) throw driversRes.error;

      setOrders((ordersRes.data as unknown as OrderRow[]) || []);
      setCustomers(customersRes.data || []);
      setProducts(productsRes.data || []);
      setDrivers(driversRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load orders');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, supabase]);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const filtered = useMemo(() => orders.filter((o) => {
    const customerName = o.customers?.name || '';
    const driverName = o.drivers?.name || '';
    const matchSearch =
      customerName.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      driverName.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.payment_status === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  }), [orders, search, statusFilter, paymentFilter]);

  const today = new Date().toISOString().slice(0, 10);
  const stats = useMemo(() => ({
    total: orders.length,
    pending: orders.filter((o) => o.status === 'pending').length,
    inProgress: orders.filter((o) => ['confirmed', 'processing', 'ready'].includes(o.status)).length,
    todayRevenue: orders
      .filter((o) => o.for_date === today && o.status !== 'cancelled')
      .reduce((s, o) => s + orderTotal(o), 0),
  }), [orders, today]);

  const updateStatus = async (order: OrderRow, newStatus: OrderStatus) => {
    const prev = orders;
    setOrders((p) => p.map((o) => (o.id === order.id ? { ...o, status: newStatus } : o)));
    if (selected?.id === order.id) setSelected((p) => (p ? { ...p, status: newStatus } : null));
    try {
      const { error } = await supabase.from('order_submissions').update({ status: newStatus }).eq('id', order.id);
      if (error) throw error;
    } catch (err: any) {
      setOrders(prev);
      toast.error(err?.message || 'Failed to update status');
    }
  };

  const handleCustomerSelect = (customerId: string) => {
    const c = customers.find((c) => c.id === customerId);
    setForm((f) => ({ ...f, customer_id: customerId }));
    if (!c) return;
  };

  const handleItemProductSelect = (idx: number, productId: string) => {
    const prod = products.find((p) => p.id === productId);
    setForm((f) => ({
      ...f,
      items: f.items.map((it, i) => i === idx
        ? { ...it, product_id: productId, product_name: prod?.name || '', unit: prod?.unit || 'unit', unit_price: prod?.selling_price || 0 }
        : it),
    }));
  };

  const addItemRow = () => setForm((f) => ({ ...f, items: [...f.items, { ...emptyItem }] }));
  const removeItemRow = (idx: number) => setForm((f) => ({ ...f, items: f.items.filter((_, i) => i !== idx) }));

  const formTotal = form.items.reduce((s, it) => s + it.quantity * it.unit_price, 0);
  const formItemCount = form.items.filter((it) => it.product_id).reduce((s, it) => s + it.quantity, 0);

  const resetForm = () => setForm(emptyForm);

  const handleCreate = async () => {
    if (!business?.id || !form.customer_id) {
      toast.error('Please select a customer');
      return;
    }
    const validItems = form.items.filter((it) => it.product_id && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    setSaving(true);
    try {
      const { data: submission, error: subError } = await supabase
        .from('order_submissions')
        .insert({
          business_id: business.id,
          customer_id: form.customer_id,
          for_date: today,
          delivery_date: form.delivery_date || null,
          total_items: formItemCount,
          order_type: 'manual',
          status: form.status,
          payment_status: form.payment_status,
          driver_id: form.driver_id || null,
          notes: form.notes || null,
          synced_to_sheet: false,
        })
        .select('id')
        .single();
      if (subError) throw subError;

      const { error: itemsError } = await supabase.from('order_submission_items').insert(
        validItems.map((it) => ({
          submission_id: submission.id,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
        }))
      );
      if (itemsError) throw itemsError;

      toast.success('Order created');
      setShowCreateModal(false);
      resetForm();
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to create order');
    } finally {
      setSaving(false);
    }
  };

  const openEdit = (order: OrderRow) => {
    setEditId(order.id);
    setForm({
      customer_id: order.customer_id,
      delivery_date: order.delivery_date || '',
      driver_id: order.driver_id || '',
      status: order.status,
      payment_status: order.payment_status,
      notes: order.notes || '',
      items: order.order_submission_items.length > 0
        ? order.order_submission_items.map((it) => ({
            product_id: it.product_id || '',
            product_name: it.product_name,
            quantity: it.quantity,
            unit_price: it.unit_price && it.unit_price > 0 ? it.unit_price : (it.products?.selling_price || 0),
            unit: products.find((p) => p.id === it.product_id)?.unit || 'unit',
          }))
        : [{ ...emptyItem }],
    });
    setSelected(null);
    setShowEditModal(true);
  };

  const handleEditSave = async () => {
    if (!editId) return;
    const validItems = form.items.filter((it) => it.product_id && it.quantity > 0);
    if (validItems.length === 0) {
      toast.error('Add at least one item');
      return;
    }
    setSaving(true);
    try {
      const { error: updateError } = await supabase
        .from('order_submissions')
        .update({
          customer_id: form.customer_id,
          delivery_date: form.delivery_date || null,
          total_items: formItemCount,
          status: form.status,
          payment_status: form.payment_status,
          driver_id: form.driver_id || null,
          notes: form.notes || null,
        })
        .eq('id', editId);
      if (updateError) throw updateError;

      // Replace item list wholesale rather than diffing — simplest correct
      // approach for the scale this app runs at.
      const { error: deleteError } = await supabase.from('order_submission_items').delete().eq('submission_id', editId);
      if (deleteError) throw deleteError;

      const { error: insertError } = await supabase.from('order_submission_items').insert(
        validItems.map((it) => ({
          submission_id: editId,
          product_id: it.product_id,
          product_name: it.product_name,
          quantity: it.quantity,
          unit_price: it.unit_price,
        }))
      );
      if (insertError) throw insertError;

      toast.success('Order updated');
      setShowEditModal(false);
      setEditId(null);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update order');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (order: OrderRow) => {
    setSaving(true);
    try {
      const { error: itemsError } = await supabase.from('order_submission_items').delete().eq('submission_id', order.id);
      if (itemsError) throw itemsError;
      const { error: orderError } = await supabase.from('order_submissions').delete().eq('id', order.id);
      if (orderError) throw orderError;
      setOrders((prev) => prev.filter((o) => o.id !== order.id));
      setDeleteConfirm(null);
      if (selected?.id === order.id) setSelected(null);
      toast.success('Order deleted');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to delete order');
    } finally {
      setSaving(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Orders Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{filtered.length} of {orders.length} orders</p>
          </div>
          <div className="flex gap-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className={`btn-secondary text-sm ${showFilters ? 'bg-primary/10 text-primary border-primary/30' : ''}`}
            >
              <Filter size={16} /> Filters
              {(statusFilter !== 'all' || paymentFilter !== 'all') && <span className="w-2 h-2 bg-primary rounded-full" />}
            </button>
            <button onClick={() => { resetForm(); setShowCreateModal(true); }} className="btn-primary text-sm" disabled={customers.length === 0 || products.length === 0}>
              <Plus size={16} /> New Order
            </button>
          </div>
        </div>

        {!loading && (customers.length === 0 || products.length === 0) && (
          <div className="card-base p-4 bg-warning/10 border-warning/30 text-sm text-foreground">
            You need at least one customer and one active product before creating an order.
          </div>
        )}

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Orders', value: stats.total, color: 'text-foreground' },
            { label: 'Pending', value: stats.pending, color: 'text-warning' },
            { label: 'In Progress', value: stats.inProgress, color: 'text-primary' },
            { label: "Today's Revenue", value: `R ${stats.todayRevenue.toFixed(0)}`, color: 'text-success' },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {(['all', ...ALL_STATUSES] as const).map((s) => (
            <button
              key={s}
              onClick={() => setStatusFilter(s)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium whitespace-nowrap transition-all flex items-center gap-1.5 ${
                statusFilter === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {s !== 'all' && statusIcons[s]}
              {s.charAt(0).toUpperCase() + s.slice(1)}
              {s !== 'all' && (
                <span className={`text-xs px-1.5 py-0.5 rounded-full ${statusFilter === s ? 'bg-white/20' : 'bg-border'}`}>
                  {orders.filter((o) => o.status === s).length}
                </span>
              )}
            </button>
          ))}
        </div>

        {/* Search + Filters */}
        <div className="card-base p-4 space-y-3">
          <div className="flex gap-3">
            <div className="relative flex-1">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search by order ID, customer, or driver..."
                className="input-field pl-9"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            {search && <button onClick={() => setSearch('')} className="btn-secondary text-sm px-3"><X size={16} /></button>}
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-border">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground font-medium">Payment:</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value as any)}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {(statusFilter !== 'all' || paymentFilter !== 'all') && (
                <button onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); }} className="text-xs text-danger hover:underline flex items-center gap-1">
                  <X size={12} /> Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Orders Table */}
        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Order</th>
                  <th className="table-header">Customer</th>
                  <th className="table-header hidden sm:table-cell">Items</th>
                  <th className="table-header hidden md:table-cell">Total</th>
                  <th className="table-header hidden lg:table-cell">Driver</th>
                  <th className="table-header hidden lg:table-cell">Delivery</th>
                  <th className="table-header hidden xl:table-cell">Payment</th>
                  <th className="table-header">Status</th>
                  <th className="table-header">Actions</th>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  [0, 1, 2].map((i) => (
                    <tr key={i}><td colSpan={9} className="table-cell"><div className="h-6 skeleton-wave rounded" /></td></tr>
                  ))
                ) : filtered.length === 0 ? (
                  <tr><td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">No orders found matching your filters.</td></tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <p className="font-mono text-sm font-semibold text-foreground">{order.id.slice(0, 8)}</p>
                        <p className="text-xs text-muted-foreground">{order.for_date}</p>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full within-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {(order.customers?.name || '?')[0]}
                          </div>
                          <p className="text-sm font-medium text-foreground">{order.customers?.name || 'Unknown'}</p>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-foreground">{order.order_submission_items.length} item{order.order_submission_items.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="font-semibold text-foreground">R {orderTotal(order).toFixed(2)}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-foreground">{order.drivers?.name || '—'}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-foreground">{order.delivery_date || '—'}</span>
                      </td>
                      <td className="table-cell hidden xl:table-cell">
                        <span className={`badge-base text-xs ${
                          order.payment_status === 'paid' ? 'bg-success/10 text-success' :
                          order.payment_status === 'overdue' ? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                        }`}>
                          {order.payment_status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <select
                          value={order.status}
                          onChange={(e) => updateStatus(order, e.target.value as OrderStatus)}
                          className={`badge-base text-xs border-0 cursor-pointer ${statusColors[order.status]}`}
                        >
                          {ALL_STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button onClick={() => setSelected(order)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="View"><Eye size={14} /></button>
                          <button onClick={() => openEdit(order)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground" title="Edit"><Edit2 size={14} /></button>
                          <button onClick={() => setDeleteConfirm(order)} className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger" title="Delete"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* VIEW MODAL */}
      {selected && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground font-mono">{selected.id.slice(0, 8)}</h3>
              <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><p className="text-muted-foreground text-xs mb-0.5">Customer</p><p className="font-medium text-foreground">{selected.customers?.name || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs mb-0.5">Phone</p><p className="font-medium text-foreground">{selected.customers?.phone || '—'}</p></div>
                <div className="col-span-2"><p className="text-muted-foreground text-xs mb-0.5">Address</p><p className="font-medium text-foreground">{selected.customers?.address || '—'}</p></div>
                <div><p className="text-muted-foreground text-xs mb-0.5">Driver</p><p className="font-medium text-foreground">{selected.drivers?.name || 'Unassigned'}</p></div>
                <div><p className="text-muted-foreground text-xs mb-0.5">Delivery Date</p><p className="font-medium text-foreground">{selected.delivery_date || '—'}</p></div>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-xs font-medium text-muted-foreground mb-2">Items</p>
                <div className="space-y-2">
                  {selected.order_submission_items.map((it) => (
                    <div key={it.id} className="flex items-center justify-between text-sm">
                      <span className="text-foreground">{it.quantity}x {it.product_name}</span>
                      <span className="font-medium text-foreground">R {lineTotal(it).toFixed(2)}</span>
                    </div>
                  ))}
                </div>
                <div className="flex justify-between mt-3 pt-3 border-t border-border">
                  <span className="font-semibold text-foreground">Total</span>
                  <span className="font-bold text-primary">R {orderTotal(selected).toFixed(2)}</span>
                </div>
              </div>
              {selected.notes && (
                <div className="border-t border-border pt-4">
                  <p className="text-xs font-medium text-muted-foreground mb-1">Notes</p>
                  <p className="text-sm text-foreground">{selected.notes}</p>
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setSelected(null)} className="btn-secondary flex-1 text-sm">Close</button>
              <button onClick={() => openEdit(selected)} className="btn-primary flex-1 text-sm"><Edit2 size={15} /> Edit Order</button>
            </div>
          </div>
        </div>
      )}

      {/* CREATE / EDIT MODAL (shared fields) */}
      {(showCreateModal || showEditModal) && (
        <div
          className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in"
          onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditId(null); }}
        >
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">{showCreateModal ? 'New Order' : 'Edit Order'}</h3>
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditId(null); }} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">Customer</label>
                  <select className="input-field" value={form.customer_id} onChange={(e) => handleCustomerSelect(e.target.value)}>
                    <option value="">Select customer...</option>
                    {customers.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Driver</label>
                  <select className="input-field" value={form.driver_id} onChange={(e) => setForm((f) => ({ ...f, driver_id: e.target.value }))}>
                    <option value="">Unassigned</option>
                    {drivers.map((d) => <option key={d.id} value={d.id}>{d.name}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                  <select className="input-field" value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as OrderStatus }))}>
                    {ALL_STATUSES.map((s) => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Delivery Date</label>
                  <input type="date" className="input-field" value={form.delivery_date} onChange={(e) => setForm((f) => ({ ...f, delivery_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Payment Status</label>
                  <select className="input-field" value={form.payment_status} onChange={(e) => setForm((f) => ({ ...f, payment_status: e.target.value as PaymentStatus }))}>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="overdue">Overdue</option>
                  </select>
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-medium text-foreground">Order Items</label>
                  <button onClick={addItemRow} className="text-xs text-primary hover:underline flex items-center gap-1"><Plus size={12} /> Add Item</button>
                </div>
                <div className="space-y-2">
                  {form.items.map((item, idx) => (
                    <div key={idx} className="space-y-1.5 p-3 bg-muted/20 rounded-lg">
                      <div className="flex gap-2">
                        <select className="input-field flex-1 text-xs" value={item.product_id} onChange={(e) => handleItemProductSelect(idx, e.target.value)}>
                          <option value="">Select product...</option>
                          {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                        <button
                          onClick={() => removeItemRow(idx)}
                          className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors flex-shrink-0"
                          disabled={form.items.length === 1}
                        >
                          <X size={13} />
                        </button>
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Qty</label>
                          <input
                            type="number" className="input-field text-xs" min={1} value={item.quantity}
                            onChange={(e) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, quantity: Number(e.target.value) } : it) }))}
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Unit</label>
                          <input type="text" className="input-field text-xs" value={item.unit} disabled />
                        </div>
                        <div>
                          <label className="block text-xs text-muted-foreground mb-1">Price (R)</label>
                          <input
                            type="number" className="input-field text-xs" min={0} step={0.01} value={item.unit_price}
                            onChange={(e) => setForm((f) => ({ ...f, items: f.items.map((it, i) => i === idx ? { ...it, unit_price: Number(e.target.value) } : it) }))}
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="flex justify-end mt-2">
                  <p className="text-sm font-semibold text-primary">Total: R {formTotal.toFixed(2)}</p>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                <textarea className="input-field resize-none" rows={2} value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => { setShowCreateModal(false); setShowEditModal(false); setEditId(null); }} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={showCreateModal ? handleCreate : handleEditSave} disabled={saving} className="btn-primary flex-1 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />} {saving ? 'Saving...' : showCreateModal ? 'Create Order' : 'Save Changes'}
              </button>
            </div>
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
                <h3 className="font-bold text-foreground">Delete Order</h3>
                <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
              </div>
            </div>
            <p className="text-sm text-foreground mb-5">
              Are you sure you want to delete the order for <span className="font-semibold">{deleteConfirm.customers?.name || 'this customer'}</span>?
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteConfirm(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={() => handleDelete(deleteConfirm)} disabled={saving} className="btn-danger flex-1 text-sm">
                {saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />} {saving ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
