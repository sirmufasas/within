'use client';
export const dynamic = 'force-dynamic';

import React, { useEffect, useState, useCallback } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import Modal from '@/components/ui/Modal';
import { TableRowSkeleton } from '@/components/ui/LoadingSkeleton';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Plus, Eye, Edit, Trash2, Truck, Phone, MapPin, Package,
} from 'lucide-react';

interface Driver {
  id: string;
  business_id: string;
  name: string;
  phone: string | null;
  vehicle: string | null;
  zone: string | null;
  status: 'active' | 'off' | 'suspended';
  created_at: string;
}

interface Delivery {
  id: string;
  business_id: string;
  driver_id: string | null;
  customer_name: string;
  address: string | null;
  status: 'pending' | 'in-transit' | 'delivered' | 'failed';
  scheduled_time: string | null;
  delivered_at: string | null;
  notes: string | null;
  created_at: string;
}

const emptyDriverForm = { name: '', phone: '', vehicle: '', zone: '', status: 'active' as Driver['status'] };
const emptyDeliveryForm = { driver_id: '', customer_name: '', address: '', status: 'pending' as Delivery['status'], notes: '' };

const deliveryStatusColors: Record<string, string> = {
  delivered: 'bg-success/10 text-success',
  'in-transit': 'bg-info/10 text-info',
  pending: 'bg-warning/10 text-warning',
  failed: 'bg-danger/10 text-danger',
};

const driverStatusColors: Record<string, string> = {
  active: 'bg-success/10 text-success',
  off: 'bg-muted text-muted-foreground',
  suspended: 'bg-danger/10 text-danger',
};

export default function DriversPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [deliveries, setDeliveries] = useState<Delivery[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'drivers' | 'deliveries'>('drivers');

  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showAddDriver, setShowAddDriver] = useState(false);
  const [showEditDriver, setShowEditDriver] = useState(false);
  const [driverForm, setDriverForm] = useState(emptyDriverForm);
  const [deleteConfirm, setDeleteConfirm] = useState<Driver | null>(null);
  const [saving, setSaving] = useState(false);

  const [showAddDelivery, setShowAddDelivery] = useState(false);
  const [deliveryForm, setDeliveryForm] = useState(emptyDeliveryForm);

  const loadData = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [driversRes, deliveriesRes] = await Promise.all([
        supabase.from('drivers').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
        supabase.from('deliveries').select('*').eq('business_id', business.id).order('created_at', { ascending: false }),
      ]);
      if (driversRes.error) throw driversRes.error;
      if (deliveriesRes.error) throw deliveriesRes.error;
      setDrivers(driversRes.data || []);
      setDeliveries(deliveriesRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load drivers & deliveries');
    } finally {
      setLoading(false);
    }
  }, [business?.id, supabase]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleAddDriver = async () => {
    if (!business?.id || !driverForm.name.trim()) {
      toast.error('Driver name is required');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .insert({ ...driverForm, business_id: business.id })
        .select()
        .single();
      if (error) throw error;
      setDrivers((prev) => [data, ...prev]);
      setDriverForm(emptyDriverForm);
      setShowAddDriver(false);
      toast.success('Driver added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add driver');
    } finally {
      setSaving(false);
    }
  };

  const openEditDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setDriverForm({
      name: driver.name,
      phone: driver.phone || '',
      vehicle: driver.vehicle || '',
      zone: driver.zone || '',
      status: driver.status,
    });
    setShowEditDriver(true);
  };

  const handleEditDriver = async () => {
    if (!selectedDriver) return;
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('drivers')
        .update(driverForm)
        .eq('id', selectedDriver.id)
        .select()
        .single();
      if (error) throw error;
      setDrivers((prev) => prev.map((d) => (d.id === selectedDriver.id ? data : d)));
      setShowEditDriver(false);
      setSelectedDriver(null);
      toast.success('Driver updated');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to update driver');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteDriver = async () => {
    if (!deleteConfirm) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('drivers').delete().eq('id', deleteConfirm.id);
      if (error) throw error;
      setDrivers((prev) => prev.filter((d) => d.id !== deleteConfirm.id));
      setDeleteConfirm(null);
      toast.success('Driver removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove driver');
    } finally {
      setSaving(false);
    }
  };

  const handleAddDelivery = async () => {
    if (!business?.id || !deliveryForm.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }
    setSaving(true);
    try {
      const { data, error } = await supabase
        .from('deliveries')
        .insert({
          ...deliveryForm,
          driver_id: deliveryForm.driver_id || null,
          business_id: business.id,
        })
        .select()
        .single();
      if (error) throw error;
      setDeliveries((prev) => [data, ...prev]);
      setDeliveryForm(emptyDeliveryForm);
      setShowAddDelivery(false);
      toast.success('Delivery added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add delivery');
    } finally {
      setSaving(false);
    }
  };

  const handleDeliveryStatusChange = async (delivery: Delivery, status: Delivery['status']) => {
    const prevDeliveries = deliveries;
    setDeliveries((prev) => prev.map((d) => (d.id === delivery.id ? { ...d, status } : d)));
    try {
      const patch: Partial<Delivery> = { status };
      if (status === 'delivered') patch.delivered_at = new Date().toISOString();
      const { error } = await supabase.from('deliveries').update(patch).eq('id', delivery.id);
      if (error) throw error;
    } catch (err: any) {
      setDeliveries(prevDeliveries);
      toast.error(err?.message || 'Failed to update delivery status');
    }
  };

  const driverName = (driverId: string | null) => drivers.find((d) => d.id === driverId)?.name || 'Unassigned';

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Drivers & Deliveries</h1>
            <p className="text-sm text-muted-foreground mt-0.5">
              {drivers.length} drivers · {deliveries.length} deliveries
            </p>
          </div>
          {activeTab === 'drivers' ? (
            <button onClick={() => setShowAddDriver(true)} className="btn-primary text-sm">
              <Plus size={16} /> Add Driver
            </button>
          ) : (
            <button onClick={() => setShowAddDelivery(true)} className="btn-primary text-sm" disabled={drivers.length === 0 && deliveries.length === 0}>
              <Plus size={16} /> Add Delivery
            </button>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Active Drivers', value: drivers.filter((d) => d.status === 'active').length, color: 'text-success' },
            { label: 'Total Deliveries', value: deliveries.length, color: 'text-foreground' },
            { label: 'Delivered', value: deliveries.filter((d) => d.status === 'delivered').length, color: 'text-success' },
            { label: 'Pending', value: deliveries.filter((d) => d.status === 'pending').length, color: 'text-warning' },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
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
          <>
            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {[0, 1, 2].map((i) => <div key={i} className="card-base p-5 h-48 skeleton-wave" />)}
              </div>
            ) : drivers.length === 0 ? (
              <div className="card-base p-10 text-center">
                <Truck className="mx-auto mb-3 text-muted-foreground" size={32} />
                <p className="font-medium text-foreground">No drivers yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add your first driver to start managing deliveries.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {drivers.map((driver) => {
                  const driverDeliveryCount = deliveries.filter((d) => d.driver_id === driver.id).length;
                  return (
                    <div key={driver.id} className="card-base p-5">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-11 h-11 rounded-full within-gradient flex items-center justify-center text-white font-bold text-lg">
                            {driver.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{driver.name}</p>
                            <span className={`badge-base text-xs ${driverStatusColors[driver.status]}`}>{driver.status}</span>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-2 text-sm">
                        {driver.phone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Phone size={13} /><span>{driver.phone}</span>
                          </div>
                        )}
                        {driver.vehicle && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Truck size={13} /><span>{driver.vehicle}</span>
                          </div>
                        )}
                        {driver.zone && (
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <MapPin size={13} /><span>{driver.zone}</span>
                          </div>
                        )}
                      </div>
                      <div className="mt-4 pt-4 border-t border-border flex items-center justify-between">
                        <div>
                          <p className="text-2xl font-bold text-foreground">{driverDeliveryCount}</p>
                          <p className="text-xs text-muted-foreground">Deliveries</p>
                        </div>
                        <div className="flex gap-2">
                          <button onClick={() => openEditDriver(driver)} className="btn-secondary text-xs py-1.5 px-3">
                            <Edit size={13} /> Edit
                          </button>
                          <button onClick={() => setDeleteConfirm(driver)} className="btn-secondary text-xs py-1.5 px-2.5 text-danger hover:bg-danger/10">
                            <Trash2 size={13} />
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}

        {activeTab === 'deliveries' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Customer</th>
                    <th className="table-header hidden sm:table-cell">Driver</th>
                    <th className="table-header hidden md:table-cell">Address</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [0, 1, 2].map((i) => <TableRowSkeleton key={i} cols={4} />)
                  ) : deliveries.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="table-cell text-center py-10 text-muted-foreground">
                        <Package className="mx-auto mb-2" size={24} />
                        No deliveries yet
                      </td>
                    </tr>
                  ) : (
                    deliveries.map((del) => (
                      <tr key={del.id} className="hover:bg-muted/20 transition-colors">
                        <td className="table-cell">
                          <p className="text-sm font-medium text-foreground">{del.customer_name}</p>
                        </td>
                        <td className="table-cell hidden sm:table-cell">
                          <p className="text-sm text-foreground">{driverName(del.driver_id)}</p>
                        </td>
                        <td className="table-cell hidden md:table-cell">
                          <p className="text-sm text-muted-foreground truncate max-w-[240px]">{del.address}</p>
                        </td>
                        <td className="table-cell">
                          <select
                            value={del.status}
                            onChange={(e) => handleDeliveryStatusChange(del, e.target.value as Delivery['status'])}
                            className={`badge-base text-xs border-0 cursor-pointer ${deliveryStatusColors[del.status]}`}
                          >
                            <option value="pending">pending</option>
                            <option value="in-transit">in-transit</option>
                            <option value="delivered">delivered</option>
                            <option value="failed">failed</option>
                          </select>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Add Driver Modal */}
      <Modal
        isOpen={showAddDriver}
        onClose={() => { setShowAddDriver(false); setDriverForm(emptyDriverForm); }}
        title="Add Driver"
        footer={
          <>
            <button className="btn-secondary text-sm" onClick={() => { setShowAddDriver(false); setDriverForm(emptyDriverForm); }}>Cancel</button>
            <button className="btn-primary text-sm flex items-center gap-2" disabled={saving} onClick={handleAddDriver}>{saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}{saving ? 'Saving...' : 'Add Driver'}</button>
          </>
        }
      >
        <DriverFormFields form={driverForm} setForm={setDriverForm} />
      </Modal>

      {/* Edit Driver Modal */}
      <Modal
        isOpen={showEditDriver}
        onClose={() => { setShowEditDriver(false); setSelectedDriver(null); }}
        title="Edit Driver"
        footer={
          <>
            <button className="btn-secondary text-sm" onClick={() => { setShowEditDriver(false); setSelectedDriver(null); }}>Cancel</button>
            <button className="btn-primary text-sm flex items-center gap-2" disabled={saving} onClick={handleEditDriver}>{saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}{saving ? 'Saving...' : 'Save Changes'}</button>
          </>
        }
      >
        <DriverFormFields form={driverForm} setForm={setDriverForm} />
      </Modal>

      {/* Delete Confirm Modal */}
      <Modal
        isOpen={!!deleteConfirm}
        onClose={() => setDeleteConfirm(null)}
        title="Remove Driver"
        size="sm"
        footer={
          <>
            <button className="btn-secondary text-sm" onClick={() => setDeleteConfirm(null)}>Cancel</button>
            <button className="btn-primary text-sm bg-danger hover:bg-danger/90" disabled={saving} onClick={handleDeleteDriver}>
              {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}{saving ? 'Removing...' : 'Remove'}
            </button>
          </>
        }
      >
        <p className="text-sm text-foreground">
          Remove <span className="font-semibold">{deleteConfirm?.name}</span>? Their assigned deliveries will become unassigned.
        </p>
      </Modal>

      {/* Add Delivery Modal */}
      <Modal
        isOpen={showAddDelivery}
        onClose={() => { setShowAddDelivery(false); setDeliveryForm(emptyDeliveryForm); }}
        title="Add Delivery"
        footer={
          <>
            <button className="btn-secondary text-sm" onClick={() => { setShowAddDelivery(false); setDeliveryForm(emptyDeliveryForm); }}>Cancel</button>
            <button className="btn-primary text-sm flex items-center gap-2" disabled={saving} onClick={handleAddDelivery}>{saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}{saving ? 'Saving...' : 'Add Delivery'}</button>
          </>
        }
      >
        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Customer Name</label>
            <input
              className="input-field w-full text-sm"
              value={deliveryForm.customer_name}
              onChange={(e) => setDeliveryForm((f) => ({ ...f, customer_name: e.target.value }))}
              placeholder="e.g. Café Central"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Address</label>
            <input
              className="input-field w-full text-sm"
              value={deliveryForm.address}
              onChange={(e) => setDeliveryForm((f) => ({ ...f, address: e.target.value }))}
              placeholder="Delivery address"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Assign Driver</label>
            <select
              className="input-field w-full text-sm"
              value={deliveryForm.driver_id}
              onChange={(e) => setDeliveryForm((f) => ({ ...f, driver_id: e.target.value }))}
            >
              <option value="">Unassigned</option>
              {drivers.map((d) => (
                <option key={d.id} value={d.id}>{d.name}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Notes</label>
            <textarea
              className="input-field w-full text-sm"
              rows={2}
              value={deliveryForm.notes}
              onChange={(e) => setDeliveryForm((f) => ({ ...f, notes: e.target.value }))}
              placeholder="Optional notes"
            />
          </div>
        </div>
      </Modal>
    </BusinessLayout>
  );
}

function DriverFormFields({
  form,
  setForm,
}: {
  form: typeof emptyDriverForm;
  setForm: React.Dispatch<React.SetStateAction<typeof emptyDriverForm>>;
}) {
  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Name</label>
        <input
          className="input-field w-full text-sm"
          value={form.name}
          onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
          placeholder="Driver name"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Phone</label>
        <input
          className="input-field w-full text-sm"
          value={form.phone}
          onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
          placeholder="+351 912 000 000"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Vehicle</label>
        <input
          className="input-field w-full text-sm"
          value={form.vehicle}
          onChange={(e) => setForm((f) => ({ ...f, vehicle: e.target.value }))}
          placeholder="e.g. Ford Transit · AB-12-CD"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Zone</label>
        <input
          className="input-field w-full text-sm"
          value={form.zone}
          onChange={(e) => setForm((f) => ({ ...f, zone: e.target.value }))}
          placeholder="e.g. Lisboa Norte"
        />
      </div>
      <div>
        <label className="text-xs font-medium text-muted-foreground mb-1.5 block">Status</label>
        <select
          className="input-field w-full text-sm"
          value={form.status}
          onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Driver['status'] }))}
        >
          <option value="active">Active</option>
          <option value="off">Off</option>
          <option value="suspended">Suspended</option>
        </select>
      </div>
    </div>
  );
}
