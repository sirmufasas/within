'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Warehouse, ArrowRightLeft, Plus, X, CheckCircle, MapPin, Trash2, Package,
} from 'lucide-react';

interface WarehouseRow { id: string; name: string; address: string | null; is_default: boolean; is_active: boolean; }
interface LocationRow { id: string; warehouse_id: string; name: string; description: string | null; }
interface ProductOption { id: string; name: string; unit: string | null; cost_price: number | null; }
interface SupplierOption { id: string; name: string; }

interface BatchRow {
  id: string;
  product_id: string;
  location_id: string | null;
  batch_number: string;
  quantity: number;
  unit: string | null;
  cost_price: number | null;
  expiry_date: string | null;
  supplier_id: string | null;
  notes: string | null;
  created_at: string;
  products: { name: string } | null;
  stock_locations: { name: string; warehouses: { name: string } | null } | null;
}

interface MovementRow {
  id: string;
  product_id: string;
  movement_type: string;
  quantity: number;
  reference: string | null;
  created_at: string;
  products: { name: string } | null;
  from_location: { name: string } | null;
  to_location: { name: string } | null;
}

type TabType = 'warehouses' | 'batches' | 'movements';

const movementStyle: Record<string, string> = {
  purchase: 'bg-success/10 text-success',
  sale: 'bg-danger/10 text-danger',
  transfer: 'bg-info/10 text-info',
  production: 'bg-warning/10 text-warning',
  adjustment: 'bg-muted text-muted-foreground',
  expiry_write_off: 'bg-danger/10 text-danger',
};

function batchStatus(expiry: string | null): { label: string; className: string } {
  if (!expiry) return { label: 'No expiry', className: 'bg-muted text-muted-foreground' };
  const days = (new Date(expiry).getTime() - Date.now()) / 86400000;
  if (days < 0) return { label: 'Expired', className: 'bg-danger/10 text-danger' };
  if (days <= 3) return { label: 'Critical', className: 'bg-danger/10 text-danger' };
  if (days <= 14) return { label: 'Expiring', className: 'bg-warning/10 text-warning' };
  return { label: 'Good', className: 'bg-success/10 text-success' };
}

const emptyWarehouseForm = { name: '', address: '', is_default: false };
const emptyLocationForm = { name: '', description: '' };
const emptyBatchForm = {
  product_id: '', location_id: '', batch_number: '', quantity: 0, cost_price: 0,
  manufactured_date: '', expiry_date: '', supplier_id: '', notes: '',
};
const emptyTransferForm = { batch_id: '', to_location_id: '', quantity: 0, notes: '' };
const emptySupplierForm = { name: '' };

export default function InventoryPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [activeTab, setActiveTab] = useState<TabType>('warehouses');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [batches, setBatches] = useState<BatchRow[]>([]);
  const [movements, setMovements] = useState<MovementRow[]>([]);
  const [products, setProducts] = useState<ProductOption[]>([]);
  const [suppliers, setSuppliers] = useState<SupplierOption[]>([]);

  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState(emptyWarehouseForm);

  const [manageLocationsFor, setManageLocationsFor] = useState<WarehouseRow | null>(null);
  const [locationForm, setLocationForm] = useState(emptyLocationForm);

  const [showBatchModal, setShowBatchModal] = useState(false);
  const [batchForm, setBatchForm] = useState(emptyBatchForm);

  const [showTransferModal, setShowTransferModal] = useState(false);
  const [transferForm, setTransferForm] = useState(emptyTransferForm);

  const [showSupplierModal, setShowSupplierModal] = useState(false);
  const [supplierForm, setSupplierForm] = useState(emptySupplierForm);

  const [selectedBatch, setSelectedBatch] = useState<BatchRow | null>(null);
  const [deleteWarehouseConfirm, setDeleteWarehouseConfirm] = useState<WarehouseRow | null>(null);

  const loadAll = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [whRes, locRes, batchRes, movRes, prodRes, supRes] = await Promise.all([
        supabase.from('warehouses').select('*').eq('business_id', business.id).order('created_at'),
        supabase.from('stock_locations').select('*').eq('business_id', business.id).order('name'),
        supabase.from('stock_batches').select('*, products ( name ), stock_locations ( name, warehouses ( name ) )').eq('business_id', business.id).order('expiry_date', { ascending: true, nullsFirst: false }),
        supabase.from('stock_movements').select(`
            *, products ( name ),
            from_location:stock_locations!stock_movements_from_location_id_fkey ( name ),
            to_location:stock_locations!stock_movements_to_location_id_fkey ( name )
          `).eq('business_id', business.id).order('created_at', { ascending: false }).limit(50),
        supabase.from('products').select('id, name, unit, cost_price').eq('business_id', business.id).eq('is_active', true).order('name'),
        supabase.from('suppliers').select('id, name').eq('business_id', business.id).eq('is_active', true).order('name'),
      ]);
      if (whRes.error) throw whRes.error;
      if (locRes.error) throw locRes.error;
      if (batchRes.error) throw batchRes.error;
      if (movRes.error) throw movRes.error;
      if (prodRes.error) throw prodRes.error;
      if (supRes.error) throw supRes.error;

      setWarehouses(whRes.data || []);
      setLocations(locRes.data || []);
      setBatches((batchRes.data as unknown as BatchRow[]) || []);
      setMovements((movRes.data as unknown as MovementRow[]) || []);
      setProducts(prodRes.data || []);
      setSuppliers(supRes.data || []);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load inventory');
    } finally {
      setLoading(false);
    }
  }, [business?.id, supabase]);

  useEffect(() => { loadAll(); }, [loadAll]);

  const locationsByWarehouse = useMemo(() => {
    const map = new Map<string, LocationRow[]>();
    locations.forEach((l) => {
      if (!map.has(l.warehouse_id)) map.set(l.warehouse_id, []);
      map.get(l.warehouse_id)!.push(l);
    });
    return map;
  }, [locations]);

  const expiringCount = batches.filter((b) => ['Expiring', 'Critical', 'Expired'].includes(batchStatus(b.expiry_date).label)).length;
  const today = new Date().toISOString().slice(0, 10);
  const movementsToday = movements.filter((m) => m.created_at.slice(0, 10) === today).length;

  // ---- Warehouses ----
  const handleAddWarehouse = async () => {
    if (!business?.id || !warehouseForm.name.trim()) { toast.error('Warehouse name is required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('warehouses').insert({ ...warehouseForm, business_id: business.id }).select().single();
      if (error) throw error;
      setWarehouses((prev) => [...prev, data]);
      setWarehouseForm(emptyWarehouseForm);
      setShowWarehouseModal(false);
      toast.success('Warehouse added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add warehouse');
    } finally { setSaving(false); }
  };

  const handleDeleteWarehouse = async () => {
    if (!deleteWarehouseConfirm) return;
    setSaving(true);
    try {
      const { error } = await supabase.from('warehouses').delete().eq('id', deleteWarehouseConfirm.id);
      if (error) throw error;
      setWarehouses((prev) => prev.filter((w) => w.id !== deleteWarehouseConfirm.id));
      setDeleteWarehouseConfirm(null);
      toast.success('Warehouse removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove warehouse — it may still have batches or locations linked to it');
    } finally { setSaving(false); }
  };

  // ---- Locations ----
  const handleAddLocation = async () => {
    if (!business?.id || !manageLocationsFor || !locationForm.name.trim()) { toast.error('Location name is required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('stock_locations').insert({
        business_id: business.id, warehouse_id: manageLocationsFor.id, name: locationForm.name, description: locationForm.description || null,
      }).select().single();
      if (error) throw error;
      setLocations((prev) => [...prev, data]);
      setLocationForm(emptyLocationForm);
      toast.success('Location added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add location');
    } finally { setSaving(false); }
  };

  const handleDeleteLocation = async (loc: LocationRow) => {
    setSaving(true);
    try {
      const { error } = await supabase.from('stock_locations').delete().eq('id', loc.id);
      if (error) throw error;
      setLocations((prev) => prev.filter((l) => l.id !== loc.id));
      toast.success('Location removed');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove location — it may still have stock batches assigned to it');
    } finally { setSaving(false); }
  };

  // ---- Batches (receive stock) ----
  const handleProductSelectForBatch = (productId: string) => {
    const p = products.find((p) => p.id === productId);
    setBatchForm((f) => ({ ...f, product_id: productId }));
    if (p) setBatchForm((f) => ({ ...f, cost_price: p.cost_price || 0 }));
  };

  const handleAddBatch = async () => {
    if (!business?.id || !batchForm.product_id || !batchForm.batch_number.trim() || batchForm.quantity <= 0) {
      toast.error('Product, batch number, and a quantity greater than 0 are required');
      return;
    }
    setSaving(true);
    try {
      const product = products.find((p) => p.id === batchForm.product_id);
      const { data: batch, error: batchError } = await supabase.from('stock_batches').insert({
        business_id: business.id,
        product_id: batchForm.product_id,
        location_id: batchForm.location_id || null,
        batch_number: batchForm.batch_number,
        quantity: batchForm.quantity,
        unit: product?.unit || 'unit',
        cost_price: batchForm.cost_price,
        manufactured_date: batchForm.manufactured_date || null,
        expiry_date: batchForm.expiry_date || null,
        supplier_id: batchForm.supplier_id || null,
        notes: batchForm.notes || null,
      }).select('*, products ( name ), stock_locations ( name, warehouses ( name ) )').single();
      if (batchError) throw batchError;

      const { error: movError } = await supabase.from('stock_movements').insert({
        business_id: business.id,
        product_id: batchForm.product_id,
        batch_id: batch.id,
        to_location_id: batchForm.location_id || null,
        movement_type: 'purchase',
        quantity: batchForm.quantity,
        unit_cost: batchForm.cost_price,
        reference: batchForm.batch_number,
      });
      if (movError) throw movError;

      toast.success('Stock received');
      setBatchForm(emptyBatchForm);
      setShowBatchModal(false);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to receive stock');
    } finally { setSaving(false); }
  };

  // ---- Transfer (splits the batch if partial quantity) ----
  const handleTransfer = async () => {
    const batch = batches.find((b) => b.id === transferForm.batch_id);
    if (!batch || !transferForm.to_location_id || transferForm.quantity <= 0) {
      toast.error('Select a batch, destination, and a quantity greater than 0');
      return;
    }
    if (transferForm.quantity > batch.quantity) {
      toast.error(`Only ${batch.quantity} ${batch.unit || 'units'} available in this batch`);
      return;
    }
    setSaving(true);
    try {
      if (transferForm.quantity === batch.quantity) {
        const { error } = await supabase.from('stock_batches').update({ location_id: transferForm.to_location_id }).eq('id', batch.id);
        if (error) throw error;
      } else {
        const { error: shrinkError } = await supabase.from('stock_batches')
          .update({ quantity: batch.quantity - transferForm.quantity })
          .eq('id', batch.id);
        if (shrinkError) throw shrinkError;

        const { error: newBatchError } = await supabase.from('stock_batches').insert({
          business_id: business!.id,
          product_id: batch.product_id,
          location_id: transferForm.to_location_id,
          batch_number: batch.batch_number,
          quantity: transferForm.quantity,
          unit: batch.unit,
          cost_price: batch.cost_price,
          expiry_date: batch.expiry_date,
          supplier_id: batch.supplier_id,
          notes: batch.notes,
        });
        if (newBatchError) throw newBatchError;
      }

      const { error: movError } = await supabase.from('stock_movements').insert({
        business_id: business!.id,
        product_id: batch.product_id,
        batch_id: batch.id,
        from_location_id: batch.location_id,
        to_location_id: transferForm.to_location_id,
        movement_type: 'transfer',
        quantity: transferForm.quantity,
        reference: batch.batch_number,
        notes: transferForm.notes || null,
      });
      if (movError) throw movError;

      toast.success('Stock transferred');
      setTransferForm(emptyTransferForm);
      setShowTransferModal(false);
      setSelectedBatch(null);
      loadAll();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to transfer stock');
    } finally { setSaving(false); }
  };

  // ---- Quick supplier add ----
  const handleAddSupplier = async () => {
    if (!business?.id || !supplierForm.name.trim()) { toast.error('Supplier name is required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('suppliers').insert({ business_id: business.id, name: supplierForm.name }).select().single();
      if (error) throw error;
      setSuppliers((prev) => [...prev, data]);
      setBatchForm((f) => ({ ...f, supplier_id: data.id }));
      setSupplierForm(emptySupplierForm);
      setShowSupplierModal(false);
      toast.success('Supplier added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add supplier');
    } finally { setSaving(false); }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Stock & Inventory</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Warehouses, batches, and stock movements</p>
          </div>
          <div className="flex gap-2">
            <button onClick={() => setShowTransferModal(true)} className="btn-secondary text-sm" disabled={batches.length === 0}>
              <ArrowRightLeft size={15} /> Transfer
            </button>
            <button onClick={() => setShowBatchModal(true)} className="btn-primary text-sm" disabled={products.length === 0}>
              <Plus size={15} /> Receive Stock
            </button>
          </div>
        </div>

        {!loading && products.length === 0 && (
          <div className="card-base p-4 bg-warning/10 border-warning/30 text-sm text-foreground">
            Add a product under Products first — stock batches need a product to belong to.
          </div>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Warehouses', value: warehouses.length },
            { label: 'Active Batches', value: batches.length },
            { label: 'Expiring Soon', value: expiringCount, color: expiringCount > 0 ? 'text-warning' : 'text-foreground' },
            { label: 'Movements Today', value: movementsToday },
          ].map((s) => (
            <div key={s.label} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color || 'text-foreground'}`}>{loading ? '—' : s.value}</p>
            </div>
          ))}
        </div>

        <div className="flex gap-1 bg-card border border-border rounded-xl p-1 w-fit">
          {(['warehouses', 'batches', 'movements'] as TabType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-4 py-1.5 rounded-lg text-sm font-semibold transition-all ${activeTab === tab ? 'bg-primary text-white' : 'text-muted-foreground hover:bg-muted'}`}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {activeTab === 'warehouses' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {loading ? (
              [0, 1, 2].map((i) => <div key={i} className="card-base p-5 h-40 skeleton-wave" />)
            ) : (
              warehouses.map((wh) => {
                const locs = locationsByWarehouse.get(wh.id) || [];
                return (
                  <div key={wh.id} className="card-base p-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center">
                          <Warehouse size={18} className="text-primary" />
                        </div>
                        <div>
                          <p className="font-bold text-foreground">{wh.name}</p>
                          {wh.is_default && <span className="badge-base text-xs bg-primary/10 text-primary">Default</span>}
                        </div>
                      </div>
                      <button onClick={() => setDeleteWarehouseConfirm(wh)} className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"><Trash2 size={14} /></button>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{wh.address || 'No address set'}</p>
                    <div className="grid grid-cols-2 gap-3 mb-4">
                      <div className="p-3 bg-muted/30 rounded-xl text-center">
                        <p className="text-lg font-bold text-foreground">{locs.length}</p>
                        <p className="text-xs text-muted-foreground">Locations</p>
                      </div>
                      <div className="p-3 bg-muted/30 rounded-xl text-center">
                        <p className="text-lg font-bold text-foreground">{batches.filter((b) => locs.some((l) => l.id === b.location_id)).length}</p>
                        <p className="text-xs text-muted-foreground">Batches</p>
                      </div>
                    </div>
                    <button onClick={() => setManageLocationsFor(wh)} className="btn-secondary text-xs w-full py-1.5"><MapPin size={13} /> Manage Locations</button>
                  </div>
                );
              })
            )}
            <button onClick={() => setShowWarehouseModal(true)} className="card-base border-2 border-dashed p-5 flex flex-col items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/40 transition-all min-h-[180px]">
              <Plus size={24} />
              <span className="text-sm font-semibold">Add Warehouse</span>
            </button>
          </div>
        )}

        {activeTab === 'batches' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Product</th>
                    <th className="table-header hidden sm:table-cell">Batch #</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header hidden md:table-cell">Location</th>
                    <th className="table-header hidden lg:table-cell">Expiry</th>
                    <th className="table-header">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [0, 1, 2].map((i) => <tr key={i}><td colSpan={6} className="table-cell"><div className="h-6 skeleton-wave rounded" /></td></tr>)
                  ) : batches.length === 0 ? (
                    <tr><td colSpan={6} className="px-4 py-12 text-center text-muted-foreground text-sm">No stock batches yet. Receive stock to get started.</td></tr>
                  ) : (
                    batches.map((b) => {
                      const status = batchStatus(b.expiry_date);
                      return (
                        <tr key={b.id} onClick={() => setSelectedBatch(b)} className="hover:bg-muted/20 transition-colors cursor-pointer">
                          <td className="table-cell"><p className="text-sm font-medium text-foreground">{b.products?.name || 'Unknown'}</p></td>
                          <td className="table-cell hidden sm:table-cell"><span className="font-mono text-xs text-muted-foreground">{b.batch_number}</span></td>
                          <td className="table-cell"><span className="font-semibold text-foreground">{b.quantity} {b.unit}</span></td>
                          <td className="table-cell hidden md:table-cell"><span className="text-sm text-muted-foreground">{b.stock_locations?.name || '—'}</span></td>
                          <td className="table-cell hidden lg:table-cell"><span className="text-sm text-muted-foreground">{b.expiry_date || '—'}</span></td>
                          <td className="table-cell"><span className={`badge-base text-xs ${status.className}`}>{status.label}</span></td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'movements' && (
          <div className="card-base overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    <th className="table-header">Type</th>
                    <th className="table-header">Product</th>
                    <th className="table-header">Qty</th>
                    <th className="table-header hidden sm:table-cell">From</th>
                    <th className="table-header hidden sm:table-cell">To</th>
                    <th className="table-header hidden md:table-cell">Reference</th>
                    <th className="table-header">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    [0, 1, 2].map((i) => <tr key={i}><td colSpan={7} className="table-cell"><div className="h-6 skeleton-wave rounded" /></td></tr>)
                  ) : movements.length === 0 ? (
                    <tr><td colSpan={7} className="px-4 py-12 text-center text-muted-foreground text-sm">No stock movements yet.</td></tr>
                  ) : (
                    movements.map((mv) => (
                      <tr key={mv.id} className="hover:bg-muted/20 transition-colors">
                        <td className="table-cell"><span className={`badge-base text-xs ${movementStyle[mv.movement_type] || 'bg-muted text-muted-foreground'}`}>{mv.movement_type}</span></td>
                        <td className="table-cell"><span className="text-sm text-foreground">{mv.products?.name || 'Unknown'}</span></td>
                        <td className="table-cell"><span className="font-bold text-foreground">{mv.quantity}</span></td>
                        <td className="table-cell hidden sm:table-cell"><span className="text-sm text-muted-foreground">{mv.from_location?.name || '—'}</span></td>
                        <td className="table-cell hidden sm:table-cell"><span className="text-sm text-foreground">{mv.to_location?.name || '—'}</span></td>
                        <td className="table-cell hidden md:table-cell"><span className="font-mono text-xs text-muted-foreground">{mv.reference || '—'}</span></td>
                        <td className="table-cell"><span className="text-sm text-muted-foreground">{new Date(mv.created_at).toLocaleDateString('en-GB')}</span></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* ADD WAREHOUSE */}
      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowWarehouseModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Add Warehouse</h3>
              <button onClick={() => setShowWarehouseModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Name</label>
                <input type="text" className="input-field" placeholder="e.g. Main Bakery" value={warehouseForm.name} onChange={(e) => setWarehouseForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                <input type="text" className="input-field" placeholder="Optional" value={warehouseForm.address} onChange={(e) => setWarehouseForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={warehouseForm.is_default} onChange={(e) => setWarehouseForm((f) => ({ ...f, is_default: e.target.checked }))} />
                Set as default warehouse
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWarehouseModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleAddWarehouse} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />} {saving ? 'Saving...' : 'Add'}</button>
            </div>
          </div>
        </div>
      )}

      {/* MANAGE LOCATIONS */}
      {manageLocationsFor && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setManageLocationsFor(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up max-h-[80vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Locations — {manageLocationsFor.name}</h3>
              <button onClick={() => setManageLocationsFor(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-2 mb-4">
              {(locationsByWarehouse.get(manageLocationsFor.id) || []).map((loc) => (
                <div key={loc.id} className="flex items-center justify-between px-3 py-2 bg-muted/30 rounded-lg">
                  <span className="text-sm text-foreground">{loc.name}</span>
                  <button onClick={() => handleDeleteLocation(loc)} className="p-1 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"><Trash2 size={13} /></button>
                </div>
              ))}
              {(locationsByWarehouse.get(manageLocationsFor.id) || []).length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-3">No locations yet.</p>
              )}
            </div>
            <div className="flex gap-2">
              <input type="text" className="input-field flex-1 text-sm" placeholder="New location name" value={locationForm.name} onChange={(e) => setLocationForm((f) => ({ ...f, name: e.target.value }))} />
              <button onClick={handleAddLocation} disabled={saving || !locationForm.name.trim()} className="btn-primary text-sm px-3"><Plus size={15} /></button>
            </div>
          </div>
        </div>
      )}

      {/* RECEIVE STOCK (Add Batch) */}
      {showBatchModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowBatchModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Receive Stock</h3>
              <button onClick={() => setShowBatchModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Product</label>
                <select className="input-field" value={batchForm.product_id} onChange={(e) => handleProductSelectForBatch(e.target.value)}>
                  <option value="">Select product...</option>
                  {products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Batch Number</label>
                  <input type="text" className="input-field" placeholder="BATCH-001" value={batchForm.batch_number} onChange={(e) => setBatchForm((f) => ({ ...f, batch_number: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Quantity</label>
                  <input type="number" className="input-field" min={0} step={0.01} value={batchForm.quantity} onChange={(e) => setBatchForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Location</label>
                <select className="input-field" value={batchForm.location_id} onChange={(e) => setBatchForm((f) => ({ ...f, location_id: e.target.value }))}>
                  <option value="">Unassigned</option>
                  {warehouses.map((wh) => (
                    <optgroup key={wh.id} label={wh.name}>
                      {(locationsByWarehouse.get(wh.id) || []).map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Manufactured</label>
                  <input type="date" className="input-field" value={batchForm.manufactured_date} onChange={(e) => setBatchForm((f) => ({ ...f, manufactured_date: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Expiry</label>
                  <input type="date" className="input-field" value={batchForm.expiry_date} onChange={(e) => setBatchForm((f) => ({ ...f, expiry_date: e.target.value }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Cost Price (per unit)</label>
                <input type="number" className="input-field" min={0} step={0.01} value={batchForm.cost_price} onChange={(e) => setBatchForm((f) => ({ ...f, cost_price: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Supplier</label>
                <div className="flex gap-2">
                  <select className="input-field flex-1" value={batchForm.supplier_id} onChange={(e) => setBatchForm((f) => ({ ...f, supplier_id: e.target.value }))}>
                    <option value="">None</option>
                    {suppliers.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
                  </select>
                  <button onClick={() => setShowSupplierModal(true)} className="btn-secondary text-xs px-3">+ New</button>
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                <textarea className="input-field resize-none" rows={2} value={batchForm.notes} onChange={(e) => setBatchForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowBatchModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleAddBatch} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <CheckCircle size={15} />} {saving ? 'Saving...' : 'Receive Stock'}</button>
            </div>
          </div>
        </div>
      )}

      {/* QUICK ADD SUPPLIER */}
      {showSupplierModal && (
        <div className="fixed inset-0 bg-black/60 z-[60] flex items-center justify-center p-4" onClick={() => setShowSupplierModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-xs p-5" onClick={(e) => e.stopPropagation()}>
            <h4 className="font-bold text-foreground mb-3">New Supplier</h4>
            <input type="text" className="input-field w-full text-sm mb-4" placeholder="Supplier name" value={supplierForm.name} onChange={(e) => setSupplierForm({ name: e.target.value })} />
            <div className="flex gap-2">
              <button onClick={() => setShowSupplierModal(false)} className="btn-secondary flex-1 text-xs py-2">Cancel</button>
              <button onClick={handleAddSupplier} disabled={saving} className="btn-primary flex-1 text-xs py-2">Add</button>
            </div>
          </div>
        </div>
      )}

      {/* BATCH DETAIL */}
      {selectedBatch && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setSelectedBatch(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-start justify-between mb-1">
              <h3 className="text-lg font-bold text-foreground">{selectedBatch.products?.name}</h3>
              <button onClick={() => setSelectedBatch(null)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <p className="text-sm text-muted-foreground mb-5">Batch: {selectedBatch.batch_number}</p>
            <div className="grid grid-cols-2 gap-3 mb-5">
              <div className="p-3 bg-muted/30 rounded-xl"><p className="text-xs text-muted-foreground">Quantity</p><p className="text-xl font-bold text-foreground">{selectedBatch.quantity} {selectedBatch.unit}</p></div>
              <div className="p-3 bg-muted/30 rounded-xl"><p className="text-xs text-muted-foreground">Location</p><p className="text-lg font-bold text-foreground">{selectedBatch.stock_locations?.name || '—'}</p></div>
              <div className="p-3 bg-muted/30 rounded-xl col-span-2"><p className="text-xs text-muted-foreground">Expiry Date</p><p className="text-xl font-bold text-foreground">{selectedBatch.expiry_date || 'No expiry'}</p></div>
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setTransferForm({ ...emptyTransferForm, batch_id: selectedBatch.id }); setShowTransferModal(true); setSelectedBatch(null); }}
                className="btn-secondary flex-1 text-sm"
              >
                <ArrowRightLeft size={14} /> Transfer
              </button>
              <button onClick={() => setSelectedBatch(null)} className="btn-primary flex-1 text-sm">Close</button>
            </div>
          </div>
        </div>
      )}

      {/* TRANSFER MODAL */}
      {showTransferModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setShowTransferModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Transfer Stock</h3>
              <button onClick={() => setShowTransferModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Batch</label>
                <select className="input-field" value={transferForm.batch_id} onChange={(e) => setTransferForm((f) => ({ ...f, batch_id: e.target.value }))}>
                  <option value="">Select batch...</option>
                  {batches.map((b) => <option key={b.id} value={b.id}>{b.products?.name} — {b.batch_number} ({b.quantity} {b.unit} @ {b.stock_locations?.name || 'unassigned'})</option>)}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Destination Location</label>
                <select className="input-field" value={transferForm.to_location_id} onChange={(e) => setTransferForm((f) => ({ ...f, to_location_id: e.target.value }))}>
                  <option value="">Select location...</option>
                  {warehouses.map((wh) => (
                    <optgroup key={wh.id} label={wh.name}>
                      {(locationsByWarehouse.get(wh.id) || []).map((loc) => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
                    </optgroup>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Quantity</label>
                <input type="number" className="input-field" min={0} step={0.01} value={transferForm.quantity} onChange={(e) => setTransferForm((f) => ({ ...f, quantity: Number(e.target.value) }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Notes</label>
                <textarea className="input-field resize-none" rows={2} value={transferForm.notes} onChange={(e) => setTransferForm((f) => ({ ...f, notes: e.target.value }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowTransferModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleTransfer} disabled={saving} className="btn-primary flex-1 text-sm">{saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <ArrowRightLeft size={14} />} {saving ? 'Transferring...' : 'Transfer'}</button>
            </div>
          </div>
        </div>
      )}

      {/* DELETE WAREHOUSE CONFIRM */}
      {deleteWarehouseConfirm && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={() => setDeleteWarehouseConfirm(null)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6 slide-up" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-danger/10 flex items-center justify-center"><Package size={18} className="text-danger" /></div>
              <div><h3 className="font-bold text-foreground">Delete Warehouse</h3><p className="text-sm text-muted-foreground">This cannot be undone.</p></div>
            </div>
            <p className="text-sm text-foreground mb-5">Delete <span className="font-semibold">{deleteWarehouseConfirm.name}</span>? This will fail if it still has locations or batches linked to it.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteWarehouseConfirm(null)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleDeleteWarehouse} disabled={saving} className="btn-danger flex-1 text-sm">{saving ? <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Trash2 size={15} />} {saving ? 'Deleting...' : 'Delete'}</button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
