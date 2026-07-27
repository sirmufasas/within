'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';
import Badge from '@/components/ui/Badge';

export type RealOrderStatus = 'pending' | 'confirmed' | 'processing' | 'ready' | 'delivered' | 'cancelled';

export interface RecentOrder {
  id: string;
  orderNumber: string;
  customer: string;
  phone: string;
  items: string;
  itemCount: number;
  total: string;
  status: RealOrderStatus;
  driver: string | null;
  placedAt: string;
  deliveryDate: string;
}

const statusOptions: { value: RealOrderStatus; label: string }[] = [
  { value: 'pending', label: 'Pending' },
  { value: 'confirmed', label: 'Confirmed' },
  { value: 'processing', label: 'Processing' },
  { value: 'ready', label: 'Ready' },
  { value: 'delivered', label: 'Delivered' },
  { value: 'cancelled', label: 'Cancelled' },
];

export default function RecentOrdersTable({ orders }: { orders: RecentOrder[] }) {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const filtered = orders.filter((o) => {
    const q = search.toLowerCase();
    const matchSearch = o.orderNumber.toLowerCase().includes(q) || o.customer.toLowerCase().includes(q);
    const matchStatus = statusFilter === 'all' || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="card-base overflow-hidden">
      <div className="px-4 sm:px-5 py-4 border-b border-border">
        <div className="flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
          <div>
            <h3 className="text-base font-semibold text-foreground">Recent Orders</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} of {orders.length} shown</p>
          </div>
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
            <div className="relative">
              <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="input-field pl-9 py-2.5 text-sm w-full sm:w-44"
              />
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="input-field py-2.5 text-sm w-full sm:w-40"
            >
              <option value="all">All Statuses</option>
              {statusOptions.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </select>
            <Link href="/orders" className="btn-secondary text-sm py-2.5 whitespace-nowrap">View All</Link>
          </div>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm min-w-[600px]">
          <thead>
            <tr>
              <th className="table-header">Order #</th>
              <th className="table-header">Customer</th>
              <th className="table-header hidden sm:table-cell">Items</th>
              <th className="table-header">Total</th>
              <th className="table-header">Status</th>
              <th className="table-header">Time</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="table-cell text-center py-12 text-muted-foreground">
                  {orders.length === 0 ? 'No orders yet' : 'No orders match your search'}
                </td>
              </tr>
            ) : (
              filtered.map((order) => (
                <tr key={order.id} className="hover:bg-muted/40 transition-colors duration-100">
                  <td className="table-cell">
                    <Link href="/orders" className="font-mono text-xs font-semibold text-primary hover:underline">{order.orderNumber}</Link>
                  </td>
                  <td className="table-cell">
                    <p className="font-medium text-foreground truncate max-w-[140px]">{order.customer}</p>
                    {order.phone && <p className="text-xs text-muted-foreground">{order.phone}</p>}
                  </td>
                  <td className="table-cell hidden sm:table-cell">
                    <p className="text-xs text-foreground truncate max-w-[160px]">{order.items}</p>
                    <p className="text-xs text-muted-foreground">{order.itemCount} items</p>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-foreground tabular-nums">{order.total}</span>
                  </td>
                  <td className="table-cell">
                    <Badge variant={order.status} dot>
                      {statusOptions.find((s) => s.value === order.status)?.label ?? order.status}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <span className="text-xs text-muted-foreground">{order.placedAt}</span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
