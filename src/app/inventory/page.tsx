'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { Warehouse, Plus, X, CheckCircle, Search, Package } from 'lucide-react';

interface WarehouseRow { id: string; name: string; address: string | null; is_default: boolean; }
interface LocationRow { id: string; warehouse_id: string; name: string; }
interface StockByProduct { product_id: string; product_name: string; unit: string | null; quantity: number; }

const emptyWarehouseForm = { name: '', address: '', is_default: false };

export default function InventoryPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [warehouses, setWarehouses] = useState<WarehouseRow[]>([]);
  const [locations, setLocations] = useState<LocationRow[]>([]);
  const [selectedWarehouseId, setSelectedWarehouseId] = useState<string | null>(null);
  const [stockByProduct, setStockByProduct] = useState<StockByProduct[]>([]);
  const [stockLoading, setStockLoading] = useState(false);
  const [search, setSearch] = useState('');

  const [showWarehouseModal, setShowWarehouseModal] = useState(false);
  const [warehouseForm, setWarehouseForm] = useState(emptyWarehouseForm);
  const [saving, setSaving] = useState(false);
  const [newLocationName, setNewLocationName] = useState('');
  const [savingLocation, setSavingLocation] = useState(false);

  const loadWarehouses = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [whRes, locRes] = await Promise.all([
        supabase.from('warehouses').select('id, name, address, is_default').eq('business_id', business.id).order('created_at'),
        supabase.from('stock_locations').select('id, warehouse_id, name').eq('business_id', business.id),
      ]);
      if (whRes.error) throw whRes.error;
      if (locRes.error) throw locRes.error;
      setWarehouses(whRes.data || []);
      setLocations(locRes.data || []);
      if (whRes.data && whRes.data.length > 0 && !selectedWarehouseId) {
        setSelectedWarehouseId(whRes.data[0].id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load warehouses');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, supabase]);

  useEffect(() => { loadWarehouses(); }, [loadWarehouses]);

  const loadStockForWarehouse = useCallback(async (warehouseId: string) => {
    setStockLoading(true);
    try {
      const locationIds = locations.filter((l) => l.warehouse_id === warehouseId).map((l) => l.id);
      if (locationIds.length === 0) {
        setStockByProduct([]);
        return;
      }
      const { data, error } = await supabase
        .from('stock_batches')
        .select('quantity, products ( id, name, unit )')
        .in('location_id', locationIds);
      if (error) throw error;

      const totals = new Map<string, StockByProduct>();
      (data as any[] || []).forEach((row) => {
        const p = row.products;
        if (!p) return;
        const existing = totals.get(p.id);
        if (existing) {
          existing.quantity += Number(row.quantity || 0);
        } else {
          totals.set(p.id, { product_id: p.id, product_name: p.name, unit: p.unit, quantity: Number(row.quantity || 0) });
        }
      });
      setStockByProduct(Array.from(totals.values()).sort((a, b) => a.product_name.localeCompare(b.product_name)));
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load stock for this location');
    } finally {
      setStockLoading(false);
    }
  }, [locations, supabase]);

  useEffect(() => {
    if (selectedWarehouseId) loadStockForWarehouse(selectedWarehouseId);
  }, [selectedWarehouseId, loadStockForWarehouse]);

  const filteredStock = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return stockByProduct;
    return stockByProduct.filter((p) => p.product_name.toLowerCase().includes(s));
  }, [stockByProduct, search]);

  const handleAddWarehouse = async () => {
    if (!business?.id || !warehouseForm.name.trim()) { toast.error('Warehouse/branch name is required'); return; }
    setSaving(true);
    try {
      const { data, error } = await supabase.from('warehouses').insert({ ...warehouseForm, business_id: business.id }).select().single();
      if (error) throw error;
      setWarehouses((prev) => [...prev, data]);
      setSelectedWarehouseId(data.id);
      setWarehouseForm(emptyWarehouseForm);
      setShowWarehouseModal(false);
      toast.success('Branch added');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add branch');
    } finally {
      setSaving(false);
    }
  };

  const selectedWarehouse = warehouses.find((w) => w.id === selectedWarehouseId);
  const warehouseLocations = locations.filter((l) => l.warehouse_id === selectedWarehouseId);
  const totalStockValue = stockByProduct.reduce((s, p) => s + p.quantity, 0);

  const handleAddLocation = async () => {
    if (!business?.id || !selectedWarehouseId || !newLocationName.trim()) { toast.error('Location name is required'); return; }
    setSavingLocation(true);
    try {
      const { data, error } = await supabase.from('stock_locations').insert({
        business_id: business.id, warehouse_id: selectedWarehouseId, name: newLocationName,
      }).select().single();
      if (error) throw error;
      setLocations((prev) => [...prev, data]);
      setNewLocationName('');
      toast.success('Location added \u2014 you can now receive stock into it via Purchase Orders');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to add location');
    } finally {
      setSavingLocation(false);
    }
  };

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Warehouse Stock</h1>
            <p className="text-sm text-muted-foreground mt-0.5">See how much stock each branch/location has on hand</p>
          </div>
          <button onClick={() => setShowWarehouseModal(true)} className="btn-primary text-sm">
            <Plus size={16} /> Add Branch
          </button>
        </div>

        {loading ? (
          <div className="flex gap-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 w-32 skeleton-wave rounded-lg" />)}</div>
        ) : warehouses.length === 0 ? (
          <div className="card-base p-10 text-center">
            <Warehouse className="mx-auto mb-3 text-muted-foreground" size={32} />
            <p className="font-medium text-foreground">No branches/warehouses yet</p>
            <p className="text-sm text-muted-foreground mt-1">Add your first one (e.g. "Main" or "Town") to start tracking stock by location.</p>
          </div>
        ) : (
          <>
            {/* Branch switcher */}
            <div className="flex gap-2 overflow-x-auto pb-1">
              {warehouses.map((w) => (
                <button
                  key={w.id}
                  onClick={() => setSelectedWarehouseId(w.id)}
                  className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all flex items-center gap-2 ${
                    selectedWarehouseId === w.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Warehouse size={14} /> {w.name}
                  {w.is_default && <span className="text-[10px] opacity-70">(Default)</span>}
                </button>
              ))}
            </div>

            {selectedWarehouse && (
              <>
                <div className="grid grid-cols-2 gap-4">
                  <div className="card-base p-4">
                    <p className="text-xs text-muted-foreground mb-1">Products in stock</p>
                    <p className="text-2xl font-bold text-foreground">{stockLoading ? '—' : stockByProduct.length}</p>
                  </div>
                  <div className="card-base p-4">
                    <p className="text-xs text-muted-foreground mb-1">Total units on hand</p>
                    <p className="text-2xl font-bold text-foreground">{stockLoading ? '—' : totalStockValue.toLocaleString()}</p>
                  </div>
                </div>

                <div className="card-base p-5">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h3 className="font-bold text-foreground">{selectedWarehouse.name}</h3>
                      {selectedWarehouse.address && <p className="text-xs text-muted-foreground">{selectedWarehouse.address}</p>}
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2 mb-4 pb-4 border-b border-border">
                    <span className="text-xs text-muted-foreground">Locations:</span>
                    {warehouseLocations.length === 0 && <span className="text-xs text-muted-foreground italic">none yet</span>}
                    {warehouseLocations.map((l) => (
                      <span key={l.id} className="badge-base text-xs bg-muted text-foreground">{l.name}</span>
                    ))}
                    <div className="flex items-center gap-1.5 ml-auto">
                      <input
                        type="text"
                        placeholder="New location name"
                        value={newLocationName}
                        onChange={(e) => setNewLocationName(e.target.value)}
                        className="input-field text-xs py-1.5 w-36"
                      />
                      <button onClick={handleAddLocation} disabled={savingLocation || !newLocationName.trim()} className="btn-secondary text-xs px-2 py-1.5"><Plus size={13} /></button>
                    </div>
                  </div>
                  <div className="relative mb-4">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search products..."
                      className="input-field pl-9 w-full text-sm"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                    />
                  </div>

                  {stockLoading ? (
                    <div className="space-y-2">{[0, 1, 2].map((i) => <div key={i} className="h-10 skeleton-wave rounded-lg" />)}</div>
                  ) : filteredStock.length === 0 ? (
                    <div className="text-center py-10">
                      <Package className="mx-auto mb-2 text-muted-foreground" size={24} />
                      <p className="text-sm text-muted-foreground">
                        {stockByProduct.length === 0 ? 'No stock recorded at this branch yet.' : 'No products match your search.'}
                      </p>
                      {stockByProduct.length === 0 && (
                        <p className="text-xs text-muted-foreground mt-1">Stock gets added here when you receive a Purchase Order to this location.</p>
                      )}
                    </div>
                  ) : (
                    <div className="bg-card rounded-xl border border-border divide-y divide-border overflow-hidden">
                      {filteredStock.map((p) => (
                        <div key={p.product_id} className="p-3 flex items-center justify-between hover:bg-muted/20">
                          <span className="text-sm font-medium text-foreground">{p.product_name}</span>
                          <span className="text-sm font-bold text-foreground">{p.quantity.toLocaleString()} {p.unit || 'units'}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </>
            )}
          </>
        )}
      </div>

      {showWarehouseModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowWarehouseModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-sm p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">Add Branch / Warehouse</h3>
              <button onClick={() => setShowWarehouseModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Name</label>
                <input type="text" className="input-field" placeholder="e.g. Main, Town Branch" value={warehouseForm.name} onChange={(e) => setWarehouseForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Address</label>
                <input type="text" className="input-field" placeholder="Optional" value={warehouseForm.address} onChange={(e) => setWarehouseForm((f) => ({ ...f, address: e.target.value }))} />
              </div>
              <label className="flex items-center gap-2 text-sm text-foreground">
                <input type="checkbox" checked={warehouseForm.is_default} onChange={(e) => setWarehouseForm((f) => ({ ...f, is_default: e.target.checked }))} />
                Set as default branch
              </label>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowWarehouseModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleAddWarehouse} disabled={saving} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {saving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <CheckCircle size={15} /> {saving ? 'Saving...' : 'Add'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
