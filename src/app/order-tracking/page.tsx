'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import {
  Search, MapPin, Clock, CheckCircle, Truck, Package,
  ChevronDown, ChevronUp, Phone, User, RefreshCw,
} from 'lucide-react';

interface TrackingStep {
  label: string;
  time: string;
  done: boolean;
  active: boolean;
}

interface TrackingOrder {
  id: string;
  customer: string;
  customerPhone: string;
  driver: string;
  driverPhone: string;
  status: 'pending' | 'confirmed' | 'processing' | 'ready' | 'out_for_delivery' | 'delivered' | 'cancelled';
  address: string;
  estimatedDelivery: string;
  placedAt: string;
  total: number;
  items: Array<{ name: string; qty: number; price: number }>;
  steps: TrackingStep[];
}

const statusColors: Record<string, string> = {
  pending: 'bg-warning/10 text-warning border-warning/20',
  confirmed: 'bg-info/10 text-info border-info/20',
  processing: 'bg-primary/10 text-primary border-primary/20',
  ready: 'bg-success/10 text-success border-success/20',
  out_for_delivery: 'bg-primary/10 text-primary border-primary/20',
  delivered: 'bg-success/10 text-success border-success/20',
  cancelled: 'bg-danger/10 text-danger border-danger/20',
};

const statusLabels: Record<string, string> = {
  pending: 'Pending',
  confirmed: 'Confirmed',
  processing: 'Processing',
  ready: 'Ready for Pickup',
  out_for_delivery: 'Out for Delivery',
  delivered: 'Delivered',
  cancelled: 'Cancelled',
};

const mockOrders: TrackingOrder[] = [
  {
    id: 'ORD-001',
    customer: 'Café Central',
    customerPhone: '+351 912 345 678',
    driver: 'Miguel Santos',
    driverPhone: '+351 923 456 789',
    status: 'out_for_delivery',
    address: 'Rua Augusta 45, Lisboa',
    estimatedDelivery: '14:30',
    placedAt: '12:15',
    total: 245.50,
    items: [
      { name: 'Pão de Forma', qty: 20, price: 1.20 },
      { name: 'Croissant', qty: 30, price: 0.90 },
      { name: 'Bolo de Arroz', qty: 15, price: 1.50 },
    ],
    steps: [
      { label: 'Order Placed', time: '12:15', done: true, active: false },
      { label: 'Confirmed', time: '12:18', done: true, active: false },
      { label: 'Being Prepared', time: '12:45', done: true, active: false },
      { label: 'Ready for Pickup', time: '13:50', done: true, active: false },
      { label: 'Out for Delivery', time: '14:05', done: true, active: true },
      { label: 'Delivered', time: '~14:30', done: false, active: false },
    ],
  },
  {
    id: 'ORD-002',
    customer: 'Restaurante O Forno',
    customerPhone: '+351 913 456 789',
    driver: 'Ana Costa',
    driverPhone: '+351 934 567 890',
    status: 'processing',
    address: 'Av. da Liberdade 120, Lisboa',
    estimatedDelivery: '15:00',
    placedAt: '13:10',
    total: 189.00,
    items: [
      { name: 'Baguette', qty: 40, price: 0.80 },
      { name: 'Pão Integral', qty: 25, price: 1.10 },
    ],
    steps: [
      { label: 'Order Placed', time: '13:10', done: true, active: false },
      { label: 'Confirmed', time: '13:14', done: true, active: false },
      { label: 'Being Prepared', time: '13:30', done: true, active: true },
      { label: 'Ready for Pickup', time: '~14:30', done: false, active: false },
      { label: 'Out for Delivery', time: '~14:45', done: false, active: false },
      { label: 'Delivered', time: '~15:00', done: false, active: false },
    ],
  },
  {
    id: 'ORD-003',
    customer: 'Padaria Estrela',
    customerPhone: '+351 914 567 890',
    driver: 'Carlos Ferreira',
    driverPhone: '+351 945 678 901',
    status: 'delivered',
    address: 'Rua do Ouro 88, Lisboa',
    estimatedDelivery: '11:00',
    placedAt: '08:30',
    total: 512.00,
    items: [
      { name: 'Farinha T65', qty: 50, price: 2.50 },
      { name: 'Fermento', qty: 20, price: 1.80 },
      { name: 'Manteiga', qty: 30, price: 3.20 },
    ],
    steps: [
      { label: 'Order Placed', time: '08:30', done: true, active: false },
      { label: 'Confirmed', time: '08:33', done: true, active: false },
      { label: 'Being Prepared', time: '09:00', done: true, active: false },
      { label: 'Ready for Pickup', time: '10:15', done: true, active: false },
      { label: 'Out for Delivery', time: '10:30', done: true, active: false },
      { label: 'Delivered', time: '10:58', done: true, active: true },
    ],
  },
  {
    id: 'ORD-004',
    customer: 'Hotel Lisboa',
    customerPhone: '+351 915 678 901',
    driver: 'Miguel Santos',
    driverPhone: '+351 923 456 789',
    status: 'confirmed',
    address: 'Praça do Comércio 5, Lisboa',
    estimatedDelivery: '16:00',
    placedAt: '14:00',
    total: 89.50,
    items: [
      { name: 'Croissant', qty: 20, price: 0.90 },
      { name: 'Pain au Chocolat', qty: 15, price: 1.20 },
    ],
    steps: [
      { label: 'Order Placed', time: '14:00', done: true, active: false },
      { label: 'Confirmed', time: '14:05', done: true, active: true },
      { label: 'Being Prepared', time: '~15:00', done: false, active: false },
      { label: 'Ready for Pickup', time: '~15:30', done: false, active: false },
      { label: 'Out for Delivery', time: '~15:45', done: false, active: false },
      { label: 'Delivered', time: '~16:00', done: false, active: false },
    ],
  },
];

const statusProgress: Record<string, number> = {
  pending: 1,
  confirmed: 2,
  processing: 3,
  ready: 4,
  out_for_delivery: 5,
  delivered: 6,
  cancelled: 0,
};

export default function OrderTrackingPage() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<TrackingOrder | null>(mockOrders[0]);
  const [expandedItems, setExpandedItems] = useState<Record<string, boolean>>({});

  const filtered = mockOrders.filter((o) => {
    const matchSearch =
      o.id.toLowerCase().includes(search.toLowerCase()) ||
      o.customer.toLowerCase().includes(search.toLowerCase()) ||
      o.driver.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const toggleItems = (id: string) => {
    setExpandedItems((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const activeStepIndex = selectedOrder
    ? selectedOrder.steps.findIndex((s) => s.active)
    : -1;

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Order Tracking</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              Real-time status for {mockOrders.length} active orders
            </p>
          </div>
          <button className="btn-secondary text-sm flex items-center gap-2">
            <RefreshCw size={15} />
            Refresh
          </button>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: 'Out for Delivery', count: mockOrders.filter(o => o.status === 'out_for_delivery').length, color: 'text-primary', bg: 'bg-primary/10' },
            { label: 'Processing', count: mockOrders.filter(o => o.status === 'processing').length, color: 'text-warning', bg: 'bg-warning/10' },
            { label: 'Delivered Today', count: mockOrders.filter(o => o.status === 'delivered').length, color: 'text-success', bg: 'bg-success/10' },
            { label: 'Pending', count: mockOrders.filter(o => o.status === 'pending' || o.status === 'confirmed').length, color: 'text-info', bg: 'bg-info/10' },
          ].map((card) => (
            <div key={card.label} className="card-base p-4">
              <div className={`w-10 h-10 rounded-xl ${card.bg} flex items-center justify-center mb-3`}>
                <Truck size={20} className={card.color} />
              </div>
              <p className={`text-2xl font-bold ${card.color}`}>{card.count}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{card.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Orders List */}
          <div className="lg:col-span-2 space-y-3">
            {/* Filters */}
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search orders..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="input-base pl-9 text-sm w-full"
                />
              </div>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="input-base text-sm"
              >
                <option value="all">All</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="ready">Ready</option>
                <option value="out_for_delivery">Out for Delivery</option>
                <option value="delivered">Delivered</option>
              </select>
            </div>

            {/* Order Cards */}
            <div className="space-y-2">
              {filtered.map((order) => (
                <div
                  key={order.id}
                  onClick={() => setSelectedOrder(order)}
                  className={`card-base p-4 cursor-pointer transition-all hover:border-primary/40 ${
                    selectedOrder?.id === order.id ? 'border-primary/60 bg-primary/5' : ''
                  }`}
                >
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <p className="text-sm font-semibold text-foreground">{order.id}</p>
                      <p className="text-xs text-muted-foreground">{order.customer}</p>
                    </div>
                    <span className={`text-xs font-medium px-2 py-0.5 rounded-full border ${statusColors[order.status]}`}>
                      {statusLabels[order.status]}
                    </span>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User size={11} />
                      {order.driver}
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock size={11} />
                      ETA {order.estimatedDelivery}
                    </span>
                  </div>
                  {/* Mini progress bar */}
                  {order.status !== 'cancelled' && (
                    <div className="mt-3">
                      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-primary rounded-full transition-all duration-500"
                          style={{ width: `${(statusProgress[order.status] / 6) * 100}%` }}
                        />
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {filtered.length === 0 && (
                <div className="card-base p-8 text-center">
                  <MapPin size={32} className="mx-auto text-muted-foreground mb-2" />
                  <p className="text-sm text-muted-foreground">No orders match your search</p>
                </div>
              )}
            </div>
          </div>

          {/* Order Detail */}
          <div className="lg:col-span-3">
            {selectedOrder ? (
              <div className="card-base p-6 space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <h2 className="text-lg font-bold text-foreground">{selectedOrder.id}</h2>
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${statusColors[selectedOrder.status]}`}>
                        {statusLabels[selectedOrder.status]}
                      </span>
                    </div>
                    <p className="text-sm text-muted-foreground">{selectedOrder.customer}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-foreground">R {selectedOrder.total.toFixed(2)}</p>
                    <p className="text-xs text-muted-foreground">Placed at {selectedOrder.placedAt}</p>
                  </div>
                </div>

                {/* Tracking Timeline */}
                <div>
                  <h3 className="text-sm font-semibold text-foreground mb-4">Tracking Timeline</h3>
                  <div className="relative">
                    {selectedOrder.steps.map((step, idx) => (
                      <div key={step.label} className="flex gap-4 pb-4 last:pb-0">
                        <div className="flex flex-col items-center">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 border-2 transition-all ${
                            step.done && step.active
                              ? 'bg-primary border-primary text-white'
                              : step.done
                              ? 'bg-success border-success text-white' :'bg-card border-border text-muted-foreground'
                          }`}>
                            {step.done ? (
                              step.active ? <Truck size={14} /> : <CheckCircle size={14} />
                            ) : (
                              <span className="text-xs font-bold">{idx + 1}</span>
                            )}
                          </div>
                          {idx < selectedOrder.steps.length - 1 && (
                            <div className={`w-0.5 flex-1 mt-1 min-h-[16px] ${step.done ? 'bg-success' : 'bg-border'}`} />
                          )}
                        </div>
                        <div className="flex-1 pb-1">
                          <div className="flex items-center justify-between">
                            <p className={`text-sm font-medium ${step.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                              {step.label}
                            </p>
                            <span className={`text-xs ${step.done ? 'text-muted-foreground' : 'text-muted-foreground/50'}`}>
                              {step.time}
                            </span>
                          </div>
                          {step.active && (
                            <p className="text-xs text-primary mt-0.5 font-medium">● Current status</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Delivery Info */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Delivery Address</p>
                    <div className="flex items-start gap-2">
                      <MapPin size={15} className="text-primary mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-foreground">{selectedOrder.address}</p>
                    </div>
                    <div className="flex items-center gap-2 mt-2">
                      <Clock size={13} className="text-muted-foreground" />
                      <p className="text-xs text-muted-foreground">ETA: <span className="font-semibold text-foreground">{selectedOrder.estimatedDelivery}</span></p>
                    </div>
                  </div>
                  <div className="bg-muted/50 rounded-xl p-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Driver</p>
                    <div className="flex items-center gap-2 mb-1">
                      <div className="w-7 h-7 within-gradient rounded-full flex items-center justify-center text-white text-xs font-bold">
                        {selectedOrder.driver.split(' ').map(n => n[0]).join('')}
                      </div>
                      <p className="text-sm font-medium text-foreground">{selectedOrder.driver}</p>
                    </div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                      <Phone size={12} />
                      {selectedOrder.driverPhone}
                    </div>
                  </div>
                </div>

                {/* Order Items */}
                <div>
                  <button
                    onClick={() => toggleItems(selectedOrder.id)}
                    className="flex items-center justify-between w-full text-sm font-semibold text-foreground mb-3"
                  >
                    <span>Order Items ({selectedOrder.items.length})</span>
                    {expandedItems[selectedOrder.id] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                  </button>
                  {expandedItems[selectedOrder.id] && (
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.name} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-muted-foreground" />
                            <span className="text-sm text-foreground">{item.name}</span>
                          </div>
                          <div className="flex items-center gap-4 text-sm">
                            <span className="text-muted-foreground">×{item.qty}</span>
                            <span className="font-medium text-foreground">R {(item.qty * item.price).toFixed(2)}</span>
                          </div>
                        </div>
                      ))}
                      <div className="flex justify-between pt-2 font-semibold text-sm">
                        <span>Total</span>
                        <span>R {selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="card-base p-12 text-center">
                <MapPin size={40} className="mx-auto text-muted-foreground mb-3" />
                <p className="text-sm text-muted-foreground">Select an order to view tracking details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </BusinessLayout>
  );
}
