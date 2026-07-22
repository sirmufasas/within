'use client';
import React, { useState } from 'react';
import { Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

type OrderStatus = 'pending' | 'confirmed' | 'production' | 'ready' | 'out-for-delivery' | 'delivered' | 'cancelled';

interface Order {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: string;
  itemCount: number;
  total: string;
  status: OrderStatus;
  driver: string | null;
  placedAt: string;
  deliveryDate: string;
  zone: string;
}

const orders: Order[] = [
  {
    id: 'ord-0901',
    orderNumber: '#ORD-0901',
    customer: 'Restaurante Boa Mesa',
    phone: '+351 912 001 234',
    items: 'Sourdough ×4, Croissants ×12',
    itemCount: 16,
    total: '€48.60',
    status: 'pending',
    driver: null,
    placedAt: '07:12',
    deliveryDate: '20/07/2026',
    zone: 'Baixa',
  },
  {
    id: 'ord-0900',
    orderNumber: '#ORD-0900',
    customer: 'Café Central',
    phone: '+351 913 002 345',
    items: 'Pastel Nata ×24, Bolo Rei ×2',
    itemCount: 26,
    total: '€62.40',
    status: 'confirmed',
    driver: null,
    placedAt: '06:55',
    deliveryDate: '20/07/2026',
    zone: 'Chiado',
  },
  {
    id: 'ord-0899',
    orderNumber: '#ORD-0899',
    customer: 'Hotel Beira Rio',
    phone: '+351 914 003 456',
    items: 'Pão Alentejano ×8, Broa Milho ×6',
    itemCount: 14,
    total: '€37.20',
    status: 'production',
    driver: null,
    placedAt: '06:30',
    deliveryDate: '20/07/2026',
    zone: 'Alfama',
  },
  {
    id: 'ord-0898',
    orderNumber: '#ORD-0898',
    customer: 'Escola Primária do Porto',
    phone: '+351 915 004 567',
    items: 'Croissants ×30, Sourdough ×5',
    itemCount: 35,
    total: '€89.50',
    status: 'ready',
    driver: 'Miguel Ferreira',
    placedAt: '05:45',
    deliveryDate: '20/07/2026',
    zone: 'Paranhos',
  },
  {
    id: 'ord-0897',
    orderNumber: '#ORD-0897',
    customer: 'Supermercado Pingo Doce',
    phone: '+351 916 005 678',
    items: 'Sourdough ×20, Pastel Nata ×40',
    itemCount: 60,
    total: '€186.00',
    status: 'out-for-delivery',
    driver: 'Carlos Mendes',
    placedAt: '05:00',
    deliveryDate: '20/07/2026',
    zone: 'Matosinhos',
  },
  {
    id: 'ord-0896',
    orderNumber: '#ORD-0896',
    customer: 'Padaria Concorrente',
    phone: '+351 917 006 789',
    items: 'Bolo Rei ×5',
    itemCount: 5,
    total: '€22.50',
    status: 'delivered',
    driver: 'Ana Costa',
    placedAt: '04:30',
    deliveryDate: '20/07/2026',
    zone: 'Matosinhos',
  },
  {
    id: 'ord-0895',
    orderNumber: '#ORD-0895',
    customer: 'Clínica São João',
    phone: '+351 918 007 890',
    items: 'Broa Milho ×10, Pão Alentejano ×4',
    itemCount: 14,
    total: '€41.20',
    status: 'delivered',
    driver: 'Miguel Ferreira',
    placedAt: '04:00',
    deliveryDate: '20/07/2026',
    zone: 'Bonfim',
  },
  {
    id: 'ord-0894',
    orderNumber: '#ORD-0894',
    customer: 'Apartamentos Turísticos',
    phone: '+351 919 008 901',
    items: 'Croissants ×8, Pastel Nata ×16',
    itemCount: 24,
    total: '€54.40',
    status: 'cancelled',
    driver: null,
    placedAt: '03:15',
    deliveryDate: '20/07/2026',
    zone: 'Ribeira',
  },
  {
    id: 'ord-0893',
    orderNumber: '#ORD-0893',
    customer: 'Mercearia do Bairro',
    phone: '+351 920 009 012',
    items: 'Sourdough ×6, Broa Milho ×4',
    itemCount: 10,
    total: '€29.80',
    status: 'pending',
    driver: null,
    placedAt: '07:05',
    deliveryDate: '20/07/2026',
    zone: 'Cedofeita',
  },
  {
    id: 'ord-0892',
    orderNumber: '#ORD-0892',
    customer: 'Ginásio FitLisboa',
    phone: '+351 921 010 123',
    items: 'Broa Milho ×20',
    itemCount: 20,
    total: '€48.00',
    status: 'pending',
    driver: null,
    placedAt: '06:48',
    deliveryDate: '20/07/2026',
    zone: 'Boavista',
  },
];

const statusOptions: { value: OrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'production', label: 'In Production' },
  { value: 'ready', label: 'Ready' },
  { value: 'out-for-delivery', label: 'Out for Delivery' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function RecentOrdersTable() {
  const [tableOrders, setTableOrders] = useState<Order[]>(orders);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [editingStatus, setEditingStatus] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const filtered = tableOrders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch =
      o.orderNumber.toLowerCase().includes(q) ||
      o.customer.toLowerCase().includes(q) ||
      o.zone.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const updateStatus = (orderId: string, status: OrderStatus) => {
    setTableOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );
    setEditingStatus(null);
    toast.success(`Order updated to: ${statusOptions.find((s) => s.value === status)?.label}`);
  };

  return (
    <div className="card-base overflow-hidden">
      {/* Header */}
      <div className="px-4 sm:px-5 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} orders today</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                placeholder="Search orders..."
                className="input-field pl-9 py-2.5 text-sm w-full sm:w-44"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
              className="input-field py-2.5 text-sm w-full sm:w-40"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={`filter-${s.value}`} value={s.value}>{s.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Table — scrollable on mobile */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="table-header">Order #</th>
              <th className="table-header">Customer</th>
              <th className="table-header hidden sm:table-cell">Items</th>
              <th className="table-header">Total</th>
              <th className="table-header">Status</th>
              <th className="table-header hidden md:table-cell">Zone</th>
              <th className="table-header">Time</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={7} className="table-cell text-center py-12 text-muted-foreground">
                  No orders match your search
                </td>
              </tr>
            ) : (
              paged.map((order) => (
                <tr
                  key={order.id}
                  className="hover:bg-muted/40 transition-colors duration-100"
                >
                  <td className="table-cell">
                    <span className="font-mono text-xs font-semibold text-primary">{order.orderNumber}</span>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium text-foreground truncate max-w-[140px]">{order.customer}</p>
                    <p className="text-xs text-muted-foreground">{order.phone}</p>
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <p className="text-xs text-foreground truncate max-w-[160px]">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-foreground tabular-nums">{order.total}</span>
                  </td>
                  <td className="table-cell relative">
                    <div className="relative">
                      <button
                        onClick={() => setEditingStatus(editingStatus === order.id ? null : order.id)}
                        className="cursor-pointer"
                        aria-label="Change order status"
                      >
                        <Badge variant={order.status} dot>
                          {statusOptions.find((s) => s.value === order.status)?.label ?? order.status}
                        </Badge>
                      </button>
                      {editingStatus === order.id && (
                        <div className="absolute top-full left-0 mt-1 w-44 bg-card border border-border rounded-xl shadow-modal z-20 py-1 fade-in">
                          {statusOptions.map((s) => (
                            <button
                              key={`status-opt-${s.value}`}
                              onClick={() => updateStatus(order.id, s.value)}
                              className="w-full text-left px-3 py-2.5 text-sm hover:bg-muted text-foreground transition-colors duration-100"
                            >
                              {s.label}
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="table-cell hidden md:table-cell">
                    <span className="text-sm text-secondary-foreground">{order.zone}</span>
                  </td>
                  <td className="table-cell">
                    <span className="tabular-nums text-sm text-foreground">{order.placedAt}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-4 sm:px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
          <span className="text-sm text-muted-foreground">
            Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length}
          </span>
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-medium"
            >
              Previous
            </button>
            {Array.from({ length: totalPages }).map((_, i) => (
              <button
                key={`page-${i + 1}`}
                onClick={() => setCurrentPage(i + 1)}
                className={`w-9 h-9 text-sm rounded-lg transition-all duration-150 font-medium ${
                  currentPage === i + 1
                    ? 'bg-primary text-primary-foreground'
                    : 'border border-border hover:bg-muted text-foreground'
                }`}
              >
                {i + 1}
              </button>
            ))}
            <button
              onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
              disabled={currentPage === totalPages}
              className="px-4 py-2 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150 font-medium"
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  );
}