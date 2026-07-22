'use client';
import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';

export const dynamic = 'force-dynamic';
import { Plus, Eye, Edit, Truck, Phone, MapPin } from 'lucide-react';

const mockDrivers = [
  { id: '1', name: 'Miguel Santos', phone: '+351 912 111 001', vehicle: 'Ford Transit · AB-12-CD', zone: 'Lisboa Norte', deliveries: 8, status: 'active' },
  { id: '2', name: 'Ana Ferreira', phone: '+351 912 111 002', vehicle: 'Renault Kangoo · EF-34-GH', zone: 'Lisboa Sul', deliveries: 6, status: 'active' },
  { id: '3', name: 'Carlos Oliveira', phone: '+351 912 111 003', vehicle: 'Peugeot Partner · IJ-56-KL', zone: 'Sintra', deliveries: 4, status: 'off' },
];

const mockDeliveries = [
  { id: 'DEL-001', driver: 'Miguel Santos', customer: 'Café Central', address: 'Rua Augusta 10, Lisboa', status: 'delivered', time: '09:30' },
  { id: 'DEL-002', driver: 'Ana Ferreira', customer: 'Restaurante O Forno', address: 'Av. Liberdade 50, Lisboa', status: 'in-transit', time: '10:15' },
  { id: 'DEL-003', driver: 'Miguel Santos', customer: 'Padaria Estrela', address: 'Rua do Ouro 22, Lisboa', status: 'pending', time: '11:00' },
  { id: 'DEL-004', driver: 'Carlos Oliveira', customer: 'Hotel Lisboa', address: 'Praça do Comércio 1, Lisboa', status: 'pending', time: '12:00' },
];

const deliveryStatusColors: Record<string, string> = {
  delivered: 'bg-success/10 text-success',
  'in-transit': 'bg-info/10 text-info',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-danger/10 text-danger',
};

export default function DriversPage() {
  const [selected, setSelected] = useState<typeof mockDrivers[0] | null>(null);
  const [activeTab, setActiveTab] = useState<'drivers' | 'deliveries'>('drivers');

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drivers & Deliveries</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockDrivers.length} drivers · {mockDeliveries.length} deliveries today</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus size={16} /> Add Driver
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Drivers', value: mockDrivers.filter(d => d.status === 'active').length, color: 'text-success' },
            { label: 'Deliveries Today', value: mockDeliveries.length, color: 'text-foreground' },
            { label: 'Delivered', value: mockDeliveries.filter(d => d.status === 'delivered').length, color: 'text-success' },
            { label: 'Pending', value: mockDeliveries.filter(d => d.status === 'pending').length, color: 'text-warning' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-2 border-b border-border">
          {(['drivers', 'deliveries'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px ${
                activeTab === tab ? 'border-primary text-primary' : 'border-transparent text-muted-foreground hover:text-foreground'
              }`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'drivers' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {mockDrivers.map((driver) => (
              <div key={driver.id} className="card-base p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-full within-gradient flex items-center justify-center text-white font-bold text-lg">
                      {driver.name[0]}
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{driver.name}</p>
                      <span className={`badge-base text-xs ${driver.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {driver.status}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone size={13} /><span>{driver.phone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Truck size={13} /><span>{driver.vehicle}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin size={13} /><span>{driver.zone}</span>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                  <div>
                    <p className="text-2xl font-bold text-foreground">{driver.deliveries}</p>
                    <p className="text-xs text-muted-foreground">Deliveries today</p>
                  </div>
                  <button
                    onClick={() => setSelected(driver)}
                    className="btn-secondary text-xs py-1.5 px-3"
                  >
                    <Eye size={13} /> View
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'deliveries' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Delivery</th>
                    <th className="table-header">Customer</th>
                    <th className="table-header hidden sm:table-cell">Driver</th>
                    <th className="table-header hidden md:table-cell">Address</th>
                    <th className="table-header">Time</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {mockDeliveries.map((del) => (
                    <tr key={del.id} className="hover:bg-muted/20 transition-colors">
                      <td className="table-cell">
                        <span className="font-mono text-sm font-semibold text-foreground">{del.id}</span>
                      </td>
                      <td className="table-cell">
                        <p className="text-sm font-medium text-foreground">{del.customer}</p>
                      </td>
                      <td className="table-cell hidden sm:table-cell">
                        <p className="text-sm text-foreground">{del.driver}</p>
                      </td>
                      <td className="table-cell hidden md:table-cell">
                        <p className="text-sm text-muted-foreground truncate max-w-[200px]">{del.address}</p>
                      </td>
                      <td className="table-cell">
                        <span className="text-sm text-foreground">{del.time}</span>
                      </td>
                      <td className="table-cell">
                        <span className={`badge-base text-xs ${deliveryStatusColors[del.status] || 'bg-muted text-muted-foreground'}`}>
                          {del.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Driver Detail Modal */}
        {selected && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelected(null)}>
            <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center gap-4 mb-6">
                <div className="w-14 h-14 rounded-full within-gradient flex items-center justify-center text-white text-xl font-bold">
                  {selected.name[0]}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-foreground">{selected.name}</h3>
                  <span className={`badge-base text-xs ${selected.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                    {selected.status}
                  </span>
                </div>
              </div>
              <div className="space-y-3 mb-6">
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Phone size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selected.phone}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <Truck size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selected.vehicle}</span>
                </div>
                <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-lg">
                  <MapPin size={16} className="text-muted-foreground" />
                  <span className="text-sm text-foreground">{selected.zone}</span>
                </div>
              </div>
              <div className="flex gap-3">
                <button className="btn-secondary flex-1 text-sm">Edit Driver</button>
                <button onClick={() => setSelected(null)} className="btn-primary flex-1 text-sm">Close</button>
              </div>
            </div>
          </div>
        )}
      </div>
    </BusinessLayout>
  );
}
