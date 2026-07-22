'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { Search, Plus, Eye, Edit2, Trash2, Filter, X, Package, Clock, CheckCircle, Truck, XCircle, AlertCircle, User, MapPin, Phone, RefreshCw,  } from 'lucide-react';

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border border-warning/20',
  confirmed: 'bg-info/10 text-info border border-info/20',
  processing: 'bg-primary/10 text-primary border border-primary/20',
  ready: 'bg-success/10 text-success border border-success/20',
  delivered: 'bg-success/10 text-success border border-success/20',
  cancelled: 'bg-danger/10 text-danger border border-danger/20',
};

const statusIcons: Record<string, React.ReactNode> = {
  pending: <Clock size={12} />,
  confirmed: <CheckCircle size={12} />,
  processing: <RefreshCw size={12} />,
  ready: <Package size={12} />,
  delivered: <Truck size={12} />,
  cancelled: <XCircle size={12} />,
};

interface OrderItem {
  name: string;
  qty: number;
  unit: string;
  price: number;
}

interface Order {
  id: string;
  customer: string;
  customerPhone: string;
  customerAddress: string;
  items: OrderItem[];
  total: number;
  status: string;
  date: string;
  deliveryDate: string;
  driver: string;
  notes: string;
  paymentStatus: 'paid' | 'pending' | 'overdue';
}

const mockOrders: Order[] = [
  {
    id: 'ORD-001', customer: 'Café Central', customerPhone: '+351 21 555 0001',
    customerAddress: 'Rua Augusta 45, Lisboa',
    items: [
      { name: 'Pão de Forma', qty: 20, unit: 'un', price: 1.20 },
      { name: 'Croissant', qty: 30, unit: 'un', price: 0.90 },
      { name: 'Bolo de Arroz', qty: 15, unit: 'un', price: 1.50 },
    ],
    total: 96.00, status: 'pending', date: '2026-07-22', deliveryDate: '2026-07-23',
    driver: 'Miguel', notes: 'Deliver before 8am', paymentStatus: 'pending',
  },
  {
    id: 'ORD-002', customer: 'Restaurante O Forno', customerPhone: '+351 21 555 0002',
    customerAddress: 'Av. da Liberdade 120, Lisboa',
    items: [
      { name: 'Baguette', qty: 40, unit: 'un', price: 0.80 },
      { name: 'Pão Integral', qty: 25, unit: 'un', price: 1.10 },
    ],
    total: 59.50, status: 'confirmed', date: '2026-07-22', deliveryDate: '2026-07-23',
    driver: 'Ana', notes: '', paymentStatus: 'paid',
  },
  {
    id: 'ORD-003', customer: 'Padaria Estrela', customerPhone: '+351 21 555 0003',
    customerAddress: 'Rua do Ouro 78, Lisboa',
    items: [
      { name: 'Farinha T65', qty: 50, unit: 'kg', price: 0.85 },
      { name: 'Fermento', qty: 10, unit: 'kg', price: 3.20 },
      { name: 'Manteiga', qty: 20, unit: 'kg', price: 6.50 },
    ],
    total: 204.50, status: 'processing', date: '2026-07-22', deliveryDate: '2026-07-22',
    driver: 'Miguel', notes: 'Urgent — needed for morning production', paymentStatus: 'paid',
  },
  {
    id: 'ORD-004', customer: 'Hotel Lisboa', customerPhone: '+351 21 555 0004',
    customerAddress: 'Praça do Comércio 1, Lisboa',
    items: [
      { name: 'Pão de Centeio', qty: 15, unit: 'un', price: 2.10 },
      { name: 'Brioche', qty: 20, unit: 'un', price: 1.80 },
    ],
    total: 67.50, status: 'delivered', date: '2026-07-21', deliveryDate: '2026-07-21',
    driver: 'Carlos', notes: '', paymentStatus: 'paid',
  },
  {
    id: 'ORD-005', customer: 'Supermercado Sol', customerPhone: '+351 21 555 0005',
    customerAddress: 'Estrada de Benfica 500, Lisboa',
    items: [
      { name: 'Pão de Forma', qty: 100, unit: 'un', price: 1.20 },
      { name: 'Bolo de Mel', qty: 30, unit: 'un', price: 3.50 },
      { name: 'Queijada', qty: 50, unit: 'un', price: 1.80 },
    ],
    total: 315.00, status: 'ready', date: '2026-07-21', deliveryDate: '2026-07-22',
    driver: 'Ana', notes: 'Call on arrival', paymentStatus: 'pending',
  },
  {
    id: 'ORD-006', customer: 'Café Central', customerPhone: '+351 21 555 0001',
    customerAddress: 'Rua Augusta 45, Lisboa',
    items: [{ name: 'Croissant', qty: 10, unit: 'un', price: 0.90 }],
    total: 9.00, status: 'cancelled', date: '2026-07-20', deliveryDate: '2026-07-20',
    driver: '-', notes: 'Customer cancelled', paymentStatus: 'pending',
  },
  {
    id: 'ORD-007', customer: 'Restaurante O Forno', customerPhone: '+351 21 555 0002',
    customerAddress: 'Av. da Liberdade 120, Lisboa',
    items: [
      { name: 'Pão Alentejano', qty: 20, unit: 'un', price: 2.50 },
      { name: 'Azeite Extra Virgem', qty: 5, unit: 'L', price: 8.00 },
    ],
    total: 90.00, status: 'pending', date: '2026-07-22', deliveryDate: '2026-07-24',
    driver: 'Carlos', notes: '', paymentStatus: 'pending',
  },
];

const emptyNewOrder = {
  customer: '', customerPhone: '', customerAddress: '',
  deliveryDate: '', driver: '', notes: '', paymentStatus: 'pending' as const,
  items: [{ name: '', qty: 1, unit: 'un', price: 0 }],
};

const drivers = ['Miguel', 'Ana', 'Carlos', 'Sofia'];
const customers = ['Café Central', 'Restaurante O Forno', 'Padaria Estrela', 'Hotel Lisboa', 'Supermercado Sol'];

const summaryStats = [
  { label: 'Total Orders', value: mockOrders.length.toString(), color: 'text-foreground' },
  { label: 'Pending', value: mockOrders.filter(o => o.status === 'pending').length.toString(), color: 'text-warning' },
  { label: 'In Progress', value: mockOrders.filter(o => ['confirmed','processing','ready'].includes(o.status)).length.toString(), color: 'text-primary' },
  { label: "Today\'s Revenue", value: `R ${mockOrders.filter(o => o.date === '2026-07-22' && o.status !== 'cancelled').reduce((s, o) => s + o.total, 0).toFixed(0)}`, color: 'text-success' },
];

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>(mockOrders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selected, setSelected] = useState<Order | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editOrder, setEditOrder] = useState<Order | null>(null);
  const [newOrder, setNewOrder] = useState(emptyNewOrder);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const filtered = orders.filter(o => {
    const matchSearch =
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.driver.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    const matchPayment = paymentFilter === 'all' || o.paymentStatus === paymentFilter;
    return matchSearch && matchStatus && matchPayment;
  });

  const updateStatus = (orderId: string, newStatus: string) => {
    setOrders(prev => prev.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
    if (selected?.id === orderId) setSelected(prev => prev ? { ...prev, status: newStatus } : null);
  };

  const handleDelete = (orderId: string) => {
    setOrders(prev => prev.filter(o => o.id !== orderId));
    setDeleteConfirm(null);
    if (selected?.id === orderId) setSelected(null);
  };

  const calcTotal = (items: typeof newOrder.items) =>
    items.reduce((s, i) => s + i.qty * i.price, 0);

  const handleCreateOrder = () => {
    if (!newOrder.customer || !newOrder.deliveryDate) return;
    const id = `ORD-${String(orders.length + 1).padStart(3, '0')}`;
    const created: Order = {
      id,
      customer: newOrder.customer,
      customerPhone: newOrder.customerPhone,
      customerAddress: newOrder.customerAddress,
      items: newOrder.items.filter(i => i.name),
      total: calcTotal(newOrder.items),
      status: 'pending',
      date: new Date().toISOString().split('T')[0],
      deliveryDate: newOrder.deliveryDate,
      driver: newOrder.driver,
      notes: newOrder.notes,
      paymentStatus: newOrder.paymentStatus,
    };
    setOrders(prev => [created, ...prev]);
    setNewOrder(emptyNewOrder);
    setShowCreateModal(false);
  };

  const handleEditSave = () => {
    if (!editOrder) return;
    setOrders(prev => prev.map(o => o.id === editOrder.id ? editOrder : o));
    if (selected?.id === editOrder.id) setSelected(editOrder);
    setShowEditModal(false);
    setEditOrder(null);
  };

  const openEdit = (order: Order) => {
    setEditOrder({ ...order, items: order.items.map(i => ({ ...i })) });
    setShowEditModal(true);
    setSelected(null);
  };

  const addItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string) => {
    setter((prev: any) => ({ ...prev, [key]: [...prev[key], { name: '', qty: 1, unit: 'un', price: 0 }] }));
  };

  const removeItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string, idx: number) => {
    setter((prev: any) => ({ ...prev, [key]: prev[key].filter((_: any, i: number) => i !== idx) }));
  };

  const updateItem = (setter: React.Dispatch<React.SetStateAction<any>>, key: string, idx: number, field: string, value: any) => {
    setter((prev: any) => ({
      ...prev,
      [key]: prev[key].map((item: any, i: number) => i === idx ? { ...item, [field]: value } : item),
    }));
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
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
              {(statusFilter !== 'all' || paymentFilter !== 'all') && (
                <span className="w-2 h-2 bg-primary rounded-full" />
              )}
            </button>
            <button onClick={() => setShowCreateModal(true)} className="btn-primary text-sm">
              <Plus size={16} /> New Order
            </button>
          </div>
        </div>

        {/* Summary Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {summaryStats.map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Status Tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          {['all', 'pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'].map((s) => (
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
                  {orders.filter(o => o.status === s).length}
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
            {search && (
              <button onClick={() => setSearch('')} className="btn-secondary text-sm px-3">
                <X size={16} />
              </button>
            )}
          </div>
          {showFilters && (
            <div className="flex flex-wrap gap-3 pt-1 border-t border-border">
              <div className="flex items-center gap-2">
                <label className="text-xs text-muted-foreground font-medium">Payment:</label>
                <select
                  value={paymentFilter}
                  onChange={(e) => setPaymentFilter(e.target.value)}
                  className="text-sm border border-border rounded-lg px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                >
                  <option value="all">All</option>
                  <option value="paid">Paid</option>
                  <option value="pending">Pending</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
              {(statusFilter !== 'all' || paymentFilter !== 'all') && (
                <button
                  onClick={() => { setStatusFilter('all'); setPaymentFilter('all'); }}
                  className="text-xs text-danger hover:underline flex items-center gap-1"
                >
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
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-muted-foreground text-sm">
                      No orders found matching your filters.
                    </td>
                  </tr>
                ) : (
                  filtered.map((order) => (
                    <tr key={order.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <p className="font-mono text-sm font-semibold text-foreground">{order.id}</p>
                        <p className="text-xs text-muted-foreground">{order.date}</p>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-full within-gradient flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                            {order.customer[0]}
                          </div>
                          <p className="text-sm font-medium text-foreground">{order.customer}</p>
                        </div>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <span className="text-sm text-foreground">{order.items.length} item{order.items.length !== 1 ? 's' : ''}</span>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <span className="font-semibold text-foreground">R {order.total.toFixed(2)}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-foreground">{order.driver}</span>
                      </td>
                      <td className="table-cell hidden lg:table-cell">
                        <span className="text-sm text-foreground">{order.deliveryDate}</span>
                      </td>
                      <td className="table-cell hidden xl:table-cell">
                        <span className={`badge-base text-xs ${
                          order.paymentStatus === 'paid' ? 'bg-success/10 text-success' :
                          order.paymentStatus === 'overdue'? 'bg-danger/10 text-danger' : 'bg-warning/10 text-warning'
                        }`}>
                          {order.paymentStatus}
                        </span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs ${statusColors[order.status] || 'bg-muted text-muted-foreground'}`}>
                          {statusIcons[order.status]}
                          {order.status}
                        </span>
                      </td>
                      <td className="table-cell">
                        <div className="flex items-center gap-1">
                          <button
                            onClick={() => setSelected(order)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="View"
                          >
                            <Eye size={15} />
                          </button>
                          <button
                            onClick={() => openEdit(order)}
                            className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
                            title="Edit"
                          >
                            <Edit2 size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(order.id)}
                            className="p-1.5 rounded-lg hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                            title="Delete"
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── ORDER DETAIL MODAL ── */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.id}</h3>
                  <p className="text-sm text-muted-foreground">{selected.customer} · {selected.date}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`badge-base text-xs ${statusColors[selected.status]}`}>
                    {statusIcons[selected.status]} {selected.status}
                  </span>
                  <button onClick={() => setSelected(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                    <X size={16} />
                  </button>
                </div>
              </div>

              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-3 mb-5">
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <Phone size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Phone</p>
                    <p className="text-sm text-foreground font-medium">{selected.customerPhone}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg">
                  <User size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Driver</p>
                    <p className="text-sm text-foreground font-medium">{selected.driver}</p>
                  </div>
                </div>
                <div className="flex items-start gap-2 p-3 bg-muted/30 rounded-lg col-span-2">
                  <MapPin size={14} className="text-muted-foreground mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-xs text-muted-foreground">Delivery Address</p>
                    <p className="text-sm text-foreground font-medium">{selected.customerAddress}</p>
                  </div>
                </div>
                {selected.notes && (
                  <div className="flex items-start gap-2 p-3 bg-warning/5 border border-warning/20 rounded-lg col-span-2">
                    <AlertCircle size={14} className="text-warning mt-0.5 flex-shrink-0" />
                    <div>
                      <p className="text-xs text-warning font-medium">Note</p>
                      <p className="text-sm text-foreground">{selected.notes}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Order Items */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-3">Order Items</p>
                <div className="space-y-2">
                  {selected.items.map((item, i) => (
                    <div key={i} className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                      <div>
                        <p className="text-sm font-medium text-foreground">{item.name}</p>
                        <p className="text-xs text-muted-foreground">{item.qty} {item.unit} × R {item.price.toFixed(2)}</p>
                      </div>
                      <p className="text-sm font-semibold text-foreground">R {(item.qty * item.price).toFixed(2)}</p>
                    </div>
                  ))}
                  <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg border border-primary/20">
                    <p className="text-sm font-bold text-foreground">Total</p>
                    <p className="text-lg font-bold text-primary">R {selected.total.toFixed(2)}</p>
                  </div>
                </div>
              </div>

              {/* Status Update */}
              <div className="mb-5">
                <p className="text-sm font-semibold text-foreground mb-3">Update Status</p>
                <div className="grid grid-cols-3 gap-2">
                  {['pending', 'confirmed', 'processing', 'ready', 'delivered', 'cancelled'].map((s) => (
                    <button
                      key={s}
                      onClick={() => updateStatus(selected.id, s)}
                      className={`py-2 px-3 rounded-lg text-xs font-medium transition-all flex items-center justify-center gap-1 ${
                        selected.status === s ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:bg-muted/80'
                      }`}
                    >
                      {statusIcons[s]}
                      {s.charAt(0).toUpperCase() + s.slice(1)}
                    </button>
                  ))}
                </div>
              </div>

              <div className="flex gap-3">
                <button onClick={() => openEdit(selected)} className="btn-secondary flex-1 text-sm">
                  <Edit2 size={15} /> Edit Order
                </button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}

        {/* ── CREATE ORDER MODAL ── */}
        {showCreateModal && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowCreateModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Create New Order</h3>
                <button onClick={() => setShowCreateModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Customer *</label>
                    <select
                      value={newOrder.customer}
                      onChange={(e) => setNewOrder(p => ({ ...p, customer: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Select customer...</option>
                      {customers.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Phone</label>
                    <input
                      type="text"
                      placeholder="+351 21 555 0000"
                      className="input-field"
                      value={newOrder.customerPhone}
                      onChange={(e) => setNewOrder(p => ({ ...p, customerPhone: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Driver</label>
                    <select
                      value={newOrder.driver}
                      onChange={(e) => setNewOrder(p => ({ ...p, driver: e.target.value }))}
                      className="input-field"
                    >
                      <option value="">Assign driver...</option>
                      {drivers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Delivery Date *</label>
                    <input
                      type="date"
                      className="input-field"
                      value={newOrder.deliveryDate}
                      onChange={(e) => setNewOrder(p => ({ ...p, deliveryDate: e.target.value }))}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Payment Status</label>
                    <select
                      value={newOrder.paymentStatus}
                      onChange={(e) => setNewOrder(p => ({ ...p, paymentStatus: e.target.value as any }))}
                      className="input-field"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Delivery Address</label>
                    <input
                      type="text"
                      placeholder="Street, City"
                      className="input-field"
                      value={newOrder.customerAddress}
                      onChange={(e) => setNewOrder(p => ({ ...p, customerAddress: e.target.value }))}
                    />
                  </div>
                </div>

                {/* Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-foreground">Order Items</label>
                    <button
                      onClick={() => setNewOrder(p => ({ ...p, items: [...p.items, { name: '', qty: 1, unit: 'un', price: 0 }] }))}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {newOrder.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          placeholder="Product name"
                          className="input-field col-span-5 text-xs"
                          value={item.name}
                          onChange={(e) => setNewOrder(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it) }))}
                        />
                        <input
                          type="number"
                          placeholder="Qty"
                          className="input-field col-span-2 text-xs"
                          value={item.qty}
                          min={1}
                          onChange={(e) => setNewOrder(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it) }))}
                        />
                        <input
                          type="text"
                          placeholder="Unit"
                          className="input-field col-span-2 text-xs"
                          value={item.unit}
                          onChange={(e) => setNewOrder(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it) }))}
                        />
                        <input
                          type="number"
                          placeholder="Price"
                          className="input-field col-span-2 text-xs"
                          value={item.price}
                          min={0}
                          step={0.01}
                          onChange={(e) => setNewOrder(p => ({ ...p, items: p.items.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it) }))}
                        />
                        <button
                          onClick={() => setNewOrder(p => ({ ...p, items: p.items.filter((_, i) => i !== idx) }))}
                          className="col-span-1 p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                          disabled={newOrder.items.length === 1}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <p className="text-sm font-semibold text-primary">
                      Total: R {calcTotal(newOrder.items).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                  <textarea
                    placeholder="Delivery instructions, special requests..."
                    className="input-field resize-none"
                    rows={2}
                    value={newOrder.notes}
                    onChange={(e) => setNewOrder(p => ({ ...p, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowCreateModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
                <button
                  onClick={handleCreateOrder}
                  disabled={!newOrder.customer || !newOrder.deliveryDate}
                  className="btn-primary flex-1 text-sm"
                >
                  <Plus size={15} /> Create Order
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ── EDIT ORDER MODAL ── */}
        {showEditModal && editOrder && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowEditModal(false)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-lg p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-foreground">Edit {editOrder.id}</h3>
                <button onClick={() => setShowEditModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground">
                  <X size={16} />
                </button>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-foreground mb-1.5">Customer</label>
                    <select
                      value={editOrder.customer}
                      onChange={(e) => setEditOrder(p => p ? { ...p, customer: e.target.value } : null)}
                      className="input-field"
                    >
                      {customers.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Driver</label>
                    <select
                      value={editOrder.driver}
                      onChange={(e) => setEditOrder(p => p ? { ...p, driver: e.target.value } : null)}
                      className="input-field"
                    >
                      {drivers.map(d => <option key={d} value={d}>{d}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Status</label>
                    <select
                      value={editOrder.status}
                      onChange={(e) => setEditOrder(p => p ? { ...p, status: e.target.value } : null)}
                      className="input-field"
                    >
                      {['pending','confirmed','processing','ready','delivered','cancelled'].map(s => (
                        <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Delivery Date</label>
                    <input
                      type="date"
                      className="input-field"
                      value={editOrder.deliveryDate}
                      onChange={(e) => setEditOrder(p => p ? { ...p, deliveryDate: e.target.value } : null)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-foreground mb-1.5">Payment Status</label>
                    <select
                      value={editOrder.paymentStatus}
                      onChange={(e) => setEditOrder(p => p ? { ...p, paymentStatus: e.target.value as any } : null)}
                      className="input-field"
                    >
                      <option value="pending">Pending</option>
                      <option value="paid">Paid</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                </div>

                {/* Edit Items */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-medium text-foreground">Order Items</label>
                    <button
                      onClick={() => setEditOrder(p => p ? { ...p, items: [...p.items, { name: '', qty: 1, unit: 'un', price: 0 }] } : null)}
                      className="text-xs text-primary hover:underline flex items-center gap-1"
                    >
                      <Plus size={12} /> Add Item
                    </button>
                  </div>
                  <div className="space-y-2">
                    {editOrder.items.map((item, idx) => (
                      <div key={idx} className="grid grid-cols-12 gap-2 items-center">
                        <input
                          type="text"
                          className="input-field col-span-5 text-xs"
                          value={item.name}
                          onChange={(e) => setEditOrder(p => p ? { ...p, items: p.items.map((it, i) => i === idx ? { ...it, name: e.target.value } : it) } : null)}
                        />
                        <input
                          type="number"
                          className="input-field col-span-2 text-xs"
                          value={item.qty}
                          min={1}
                          onChange={(e) => setEditOrder(p => p ? { ...p, items: p.items.map((it, i) => i === idx ? { ...it, qty: Number(e.target.value) } : it) } : null)}
                        />
                        <input
                          type="text"
                          className="input-field col-span-2 text-xs"
                          value={item.unit}
                          onChange={(e) => setEditOrder(p => p ? { ...p, items: p.items.map((it, i) => i === idx ? { ...it, unit: e.target.value } : it) } : null)}
                        />
                        <input
                          type="number"
                          className="input-field col-span-2 text-xs"
                          value={item.price}
                          min={0}
                          step={0.01}
                          onChange={(e) => setEditOrder(p => p ? { ...p, items: p.items.map((it, i) => i === idx ? { ...it, price: Number(e.target.value) } : it) } : null)}
                        />
                        <button
                          onClick={() => setEditOrder(p => p ? { ...p, items: p.items.filter((_, i) => i !== idx) } : null)}
                          className="col-span-1 p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger transition-colors"
                          disabled={editOrder.items.length === 1}
                        >
                          <X size={13} />
                        </button>
                      </div>
                    ))}
                  </div>
                  <div className="flex justify-end mt-2">
                    <p className="text-sm font-semibold text-primary">
                      Total: R {editOrder.items.reduce((s, i) => s + i.qty * i.price, 0).toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                  <textarea
                    className="input-field resize-none"
                    rows={2}
                    value={editOrder.notes}
                    onChange={(e) => setEditOrder(p => p ? { ...p, notes: e.target.value } : null)}
                  />
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

        {/* ── DELETE CONFIRM ── */}
        {deleteConfirm && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeleteConfirm(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center">
                  <Trash2 size={18} className="text-danger" />
                </div>
                <div>
                  <h3 className="font-bold text-foreground">Delete Order</h3>
                  <p className="text-sm text-muted-foreground">This action cannot be undone.</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-5">
                Are you sure you want to delete <span className="font-semibold">{deleteConfirm}</span>?
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
