'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Sheet, Plus, X, CheckCircle, Copy, RefreshCw, Trash2, Edit2, ExternalLink, Users,
} from 'lucide-react';
import {
  getServiceAccountInfo, testAndSaveConnection, getSectionLiveData,
  saveSectionStock, saveSectionEstimates, saveCustomerSyncConfig, syncCustomersFromSheet,
} from './actions';

interface Connection {
  spreadsheet_id: string;
  spreadsheet_label: string | null;
  last_verified_at: string | null;
}

interface SectionRowConfig {
  id: string;
  name: string;
  tab_name: string;
  name_column: string;
  stock_column: string;
  estimate_column: string;
  header_row: number;
}

interface LiveRow {
  row: number;
  name: string;
  stock: number;
  estimate: number;
}

const emptySectionForm = { name: '', tab_name: '', name_column: 'A', stock_column: 'F', estimate_column: 'G', header_row: 1 };

export default function StockSheetPage() {
  const { business } = useAuth();
  const supabase = createClient();

  const [loading, setLoading] = useState(true);
  const [connection, setConnection] = useState<Connection | null>(null);
  const [sections, setSections] = useState<SectionRowConfig[]>([]);
  const [serviceEmail, setServiceEmail] = useState<string | null>(null);

  const [sheetInput, setSheetInput] = useState('');
  const [connecting, setConnecting] = useState(false);

  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [sectionForm, setSectionForm] = useState(emptySectionForm);
  const [savingSection, setSavingSection] = useState(false);

  const [activeSectionId, setActiveSectionId] = useState<string | null>(null);
  const [liveRows, setLiveRows] = useState<LiveRow[]>([]);
  const [rowsLoading, setRowsLoading] = useState(false);
  const [stockEdits, setStockEdits] = useState<Record<number, number>>({});
  const [estimateEdits, setEstimateEdits] = useState<Record<number, number>>({});
  const [savingStock, setSavingStock] = useState(false);
  const [savingEstimates, setSavingEstimates] = useState(false);
  const [rowsError, setRowsError] = useState<string | null>(null);
  const [rowMode, setRowMode] = useState<'stock' | 'estimates'>('stock');
  const [rowSearch, setRowSearch] = useState('');
  const [showAllRows, setShowAllRows] = useState(false);

  const [customerSyncForm, setCustomerSyncForm] = useState({ tab_name: '', name_column: 'A', driver_column: 'D', header_row: 1 });
  const [savingCustomerConfig, setSavingCustomerConfig] = useState(false);
  const [syncingCustomers, setSyncingCustomers] = useState(false);
  const [customerSyncResult, setCustomerSyncResult] = useState<string | null>(null);

  const loadSetup = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [connRes, sectionsRes, svcRes, custSyncRes] = await Promise.all([
        supabase.from('google_sheet_connections').select('spreadsheet_id, spreadsheet_label, last_verified_at').eq('business_id', business.id).maybeSingle(),
        supabase.from('stock_sections').select('*').eq('business_id', business.id).order('sort_order'),
        getServiceAccountInfo(),
        supabase.from('customer_sync_config').select('*').eq('business_id', business.id).maybeSingle(),
      ]);
      if (connRes.error) throw connRes.error;
      if (sectionsRes.error) throw sectionsRes.error;
      setConnection(connRes.data || null);
      setSections(sectionsRes.data || []);
      setServiceEmail(svcRes.email);
      if (custSyncRes.data) {
        setCustomerSyncForm({
          tab_name: custSyncRes.data.tab_name,
          name_column: custSyncRes.data.name_column,
          driver_column: custSyncRes.data.driver_column,
          header_row: custSyncRes.data.header_row,
        });
      }
      if (sectionsRes.data && sectionsRes.data.length > 0 && !activeSectionId) {
        setActiveSectionId(sectionsRes.data[0].id);
      }
    } catch (err: any) {
      toast.error(err?.message || 'Failed to load setup');
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [business?.id, supabase]);

  useEffect(() => { loadSetup(); }, [loadSetup]);

  const loadLiveRows = useCallback(async (sectionId: string) => {
    setRowsLoading(true);
    setRowsError(null);
    try {
      const result = await getSectionLiveData(sectionId);
      if (result.error) {
        setRowsError(result.error);
        setLiveRows([]);
      } else {
        setLiveRows(result.rows || []);
        setStockEdits({});
        setEstimateEdits({});
      }
    } catch (err: any) {
      setRowsError(err?.message || 'Failed to load sheet data');
    } finally {
      setRowsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (activeSectionId) loadLiveRows(activeSectionId);
  }, [activeSectionId, loadLiveRows]);

  const handleConnect = async () => {
    if (!sheetInput.trim()) { toast.error('Paste a spreadsheet ID or URL'); return; }
    setConnecting(true);
    try {
      const result = await testAndSaveConnection(sheetInput);
      if (result.error) {
        toast.error(result.error);
      } else {
        toast.success(`Connected to "${result.title}"`);
        setSheetInput('');
        loadSetup();
      }
    } finally {
      setConnecting(false);
    }
  };

  const openAddSection = () => {
    setEditingSectionId(null);
    setSectionForm(emptySectionForm);
    setShowSectionModal(true);
  };

  const openEditSection = (s: SectionRowConfig) => {
    setEditingSectionId(s.id);
    setSectionForm({
      name: s.name, tab_name: s.tab_name, name_column: s.name_column,
      stock_column: s.stock_column, estimate_column: s.estimate_column, header_row: s.header_row,
    });
    setShowSectionModal(true);
  };

  const handleSaveSection = async () => {
    if (!business?.id || !sectionForm.name.trim() || !sectionForm.tab_name.trim()) {
      toast.error('Section name and tab name are required');
      return;
    }
    setSavingSection(true);
    try {
      if (editingSectionId) {
        const { error } = await supabase.from('stock_sections').update(sectionForm).eq('id', editingSectionId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('stock_sections').insert({
          ...sectionForm, business_id: business.id, sort_order: sections.length,
        });
        if (error) throw error;
      }
      toast.success('Section saved');
      setShowSectionModal(false);
      loadSetup();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save section');
    } finally {
      setSavingSection(false);
    }
  };

  const handleDeleteSection = async (id: string) => {
    try {
      const { error } = await supabase.from('stock_sections').delete().eq('id', id);
      if (error) throw error;
      toast.success('Section removed');
      if (activeSectionId === id) setActiveSectionId(null);
      loadSetup();
    } catch (err: any) {
      toast.error(err?.message || 'Failed to remove section');
    }
  };

  const handleSaveStock = async () => {
    if (!activeSectionId) return;
    const updates = Object.entries(stockEdits).map(([row, quantity]) => ({ row: Number(row), quantity }));
    if (updates.length === 0) { toast.error('No changes to save'); return; }
    setSavingStock(true);
    try {
      const result = await saveSectionStock(activeSectionId, updates);
      if (result.error) throw new Error(result.error);
      toast.success(`Stock saved (${result.updated} row${result.updated !== 1 ? 's' : ''})`);
      loadLiveRows(activeSectionId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save stock');
    } finally {
      setSavingStock(false);
    }
  };

  const handleSaveEstimates = async () => {
    if (!activeSectionId) return;
    const updates = Object.entries(estimateEdits).map(([row, quantity]) => ({ row: Number(row), quantity }));
    if (updates.length === 0) { toast.error('No changes to save'); return; }
    setSavingEstimates(true);
    try {
      const result = await saveSectionEstimates(activeSectionId, updates);
      if (result.error) throw new Error(result.error);
      toast.success(`Estimates saved (${result.updated} row${result.updated !== 1 ? 's' : ''})`);
      loadLiveRows(activeSectionId);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save estimates');
    } finally {
      setSavingEstimates(false);
    }
  };

  const copyServiceEmail = () => {
    if (!serviceEmail) return;
    navigator.clipboard.writeText(serviceEmail);
    toast.success('Copied \u2014 share your sheet with this email as Editor');
  };

  const handleSaveCustomerConfig = async () => {
    if (!customerSyncForm.tab_name.trim()) { toast.error('Tab name is required'); return; }
    setSavingCustomerConfig(true);
    try {
      const result = await saveCustomerSyncConfig(customerSyncForm);
      if (result.error) throw new Error(result.error);
      toast.success('Customer sync configured');
    } catch (err: any) {
      toast.error(err?.message || 'Failed to save configuration');
    } finally {
      setSavingCustomerConfig(false);
    }
  };

  const handleSyncCustomers = async () => {
    setSyncingCustomers(true);
    setCustomerSyncResult(null);
    try {
      const result = await syncCustomersFromSheet();
      if (result.error) throw new Error(result.error);
      const msg = `Synced ${result.total} customers \u2014 ${result.created} new, ${result.updated} updated`;
      setCustomerSyncResult(msg);
      toast.success(msg);
    } catch (err: any) {
      toast.error(err?.message || 'Failed to sync customers');
      setCustomerSyncResult(null);
    } finally {
      setSyncingCustomers(false);
    }
  };

  useEffect(() => {
    setRowSearch('');
    setShowAllRows(false);
  }, [activeSectionId, rowMode]);

  const activeEdits = rowMode === 'stock' ? stockEdits : estimateEdits;
  const setActiveEdits = rowMode === 'stock' ? setStockEdits : setEstimateEdits;
  const valueForRow = (row: number, original: number) => activeEdits[row] ?? original;
  const anyRowHasValue = liveRows.some((r) => (rowMode === 'stock' ? r.stock : r.estimate) > 0);

  const filteredSortedRows = useMemo(() => {
    const s = rowSearch.trim().toLowerCase();
    return liveRows
      .filter((r) => {
        if (s && !r.name.toLowerCase().includes(s)) return false;
        const original = rowMode === 'stock' ? r.stock : r.estimate;
        const current = valueForRow(r.row, original);
        if (anyRowHasValue && !showAllRows && current <= 0) return false;
        return true;
      })
      .sort((a, b) => {
        const aOrig = rowMode === 'stock' ? a.stock : a.estimate;
        const bOrig = rowMode === 'stock' ? b.stock : b.estimate;
        const aFilled = valueForRow(a.row, aOrig) > 0 ? 0 : 1;
        const bFilled = valueForRow(b.row, bOrig) > 0 ? 0 : 1;
        if (aFilled !== bFilled) return aFilled - bFilled;
        return a.name.localeCompare(b.name);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveRows, rowSearch, showAllRows, anyRowHasValue, rowMode, stockEdits, estimateEdits]);

  const activeChangedCount = Object.keys(activeEdits).length;
  const activeSaving = rowMode === 'stock' ? savingStock : savingEstimates;
  const handleActiveSave = rowMode === 'stock' ? handleSaveStock : handleSaveEstimates;

  if (loading) {
    return (
      <BusinessLayout>
        <div className="space-y-4">
          <div className="h-8 w-64 skeleton-wave rounded-lg" />
          <div className="h-40 skeleton-wave rounded-xl" />
        </div>
      </BusinessLayout>
    );
  }

  return (
    <BusinessLayout>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Stock & Estimates (Google Sheet)</h1>
          <p className="text-sm text-muted-foreground mt-0.5">Live-synced directly to your own Google Sheet</p>
        </div>

        {!serviceEmail && (
          <div className="card-base p-4 bg-danger/10 border-danger/30 text-sm text-foreground">
            Google Sheets isn't configured on this deployment yet \u2014 an admin needs to add
            <code className="mx-1 px-1.5 py-0.5 bg-black/5 rounded">GOOGLE_SERVICE_ACCOUNT_EMAIL</code> and
            <code className="mx-1 px-1.5 py-0.5 bg-black/5 rounded">GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY</code> to the environment.
          </div>
        )}

        {!connection ? (
          <div className="card-base p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center"><Sheet size={18} className="text-primary" /></div>
              <div>
                <h3 className="font-bold text-foreground">Connect your Google Sheet</h3>
                <p className="text-sm text-muted-foreground">Two steps: share it with our service account, then paste the link.</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Step 1 \u2014 Share your sheet with:</p>
                <div className="flex items-center gap-2">
                  <code className="flex-1 text-xs bg-muted/50 px-3 py-2 rounded-lg truncate">{serviceEmail || 'Not configured'}</code>
                  <button onClick={copyServiceEmail} disabled={!serviceEmail} className="btn-secondary text-xs px-3 py-2 disabled:opacity-50"><Copy size={13} /></button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">Open your sheet &rarr; Share &rarr; add this email as Editor.</p>
              </div>
              <div>
                <p className="text-xs font-medium text-foreground mb-1.5">Step 2 \u2014 Paste your sheet's ID or full URL:</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    className="input-field flex-1 text-sm"
                    placeholder="https://docs.google.com/spreadsheets/d/..."
                    value={sheetInput}
                    onChange={(e) => setSheetInput(e.target.value)}
                  />
                  <button onClick={handleConnect} disabled={connecting || !serviceEmail} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                    {connecting && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                    {connecting ? 'Testing...' : 'Test & Connect'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="card-base p-4 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-success/10 flex items-center justify-center"><Sheet size={16} className="text-success" /></div>
                <div>
                  <p className="text-sm font-semibold text-foreground">{connection.spreadsheet_label || 'Connected sheet'}</p>
                  <p className="text-xs text-muted-foreground">Connected {connection.last_verified_at ? new Date(connection.last_verified_at).toLocaleDateString('en-GB') : ''}</p>
                </div>
              </div>
              <a
                href={`https://docs.google.com/spreadsheets/d/${connection.spreadsheet_id}/edit`}
                target="_blank" rel="noopener noreferrer"
                className="btn-secondary text-xs flex items-center gap-1.5"
              >
                <ExternalLink size={13} /> Open Sheet
              </a>
            </div>

            {/* CUSTOMER SYNC — pull customers directly from a tab in the same sheet */}
            <div className="card-base p-5">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-9 h-9 rounded-lg bg-primary/10 flex items-center justify-center"><Users size={16} className="text-primary" /></div>
                <div>
                  <h3 className="font-bold text-foreground">Sync Customers from Sheet</h3>
                  <p className="text-xs text-muted-foreground">Pulls customer names + driver from a tab, creates new customers automatically (each gets their own order link).</p>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
                <div className="col-span-2">
                  <label className="block text-xs font-medium text-foreground mb-1.5">Tab Name</label>
                  <input type="text" className="input-field text-sm" placeholder="e.g. Customer Order Details" value={customerSyncForm.tab_name} onChange={(e) => setCustomerSyncForm((f) => ({ ...f, tab_name: e.target.value }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Name Col</label>
                  <input type="text" maxLength={2} className="input-field text-sm uppercase" value={customerSyncForm.name_column} onChange={(e) => setCustomerSyncForm((f) => ({ ...f, name_column: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Driver Col</label>
                  <input type="text" maxLength={2} className="input-field text-sm uppercase" value={customerSyncForm.driver_column} onChange={(e) => setCustomerSyncForm((f) => ({ ...f, driver_column: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div className="flex gap-3">
                <button onClick={handleSaveCustomerConfig} disabled={savingCustomerConfig} className="btn-secondary text-sm flex items-center gap-2">
                  {savingCustomerConfig && <span className="w-4 h-4 border-2 border-current/30 border-t-current rounded-full animate-spin" />}
                  Save Config
                </button>
                <button onClick={handleSyncCustomers} disabled={syncingCustomers || !customerSyncForm.tab_name} className="btn-primary text-sm flex items-center gap-2 disabled:opacity-50">
                  {syncingCustomers && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                  <RefreshCw size={14} /> {syncingCustomers ? 'Syncing...' : 'Sync Customers Now'}
                </button>
              </div>
              {customerSyncResult && (
                <p className="text-xs text-success mt-3 flex items-center gap-1.5"><CheckCircle size={13} /> {customerSyncResult}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex gap-2 overflow-x-auto">
                {sections.map((s) => (
                  <button
                    key={s.id}
                    onClick={() => setActiveSectionId(s.id)}
                    className={`px-4 py-2 rounded-lg text-sm font-semibold whitespace-nowrap transition-all ${
                      activeSectionId === s.id ? 'bg-primary text-white' : 'bg-muted text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {s.name}
                  </button>
                ))}
              </div>
              <button onClick={openAddSection} className="btn-secondary text-sm flex-shrink-0"><Plus size={15} /> Add Section</button>
            </div>

            {sections.length === 0 ? (
              <div className="card-base p-10 text-center">
                <p className="font-medium text-foreground">No sections yet</p>
                <p className="text-sm text-muted-foreground mt-1">Add a section (e.g. "Production" or "Freezer") pointing at a tab in your sheet.</p>
              </div>
            ) : (
              <div className="card-base p-5">
                {sections.filter((s) => s.id === activeSectionId).map((s) => (
                  <div key={s.id} className="flex items-center justify-between mb-4">
                    <p className="text-sm text-muted-foreground">
                      Tab: <span className="font-mono text-foreground">{s.tab_name}</span> &middot;
                      Name col {s.name_column} &middot; Stock col {s.stock_column} &middot; Estimate col {s.estimate_column}
                    </p>
                    <div className="flex gap-1.5">
                      <button onClick={() => openEditSection(s)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><Edit2 size={14} /></button>
                      <button onClick={() => handleDeleteSection(s.id)} className="p-1.5 rounded hover:bg-danger/10 text-muted-foreground hover:text-danger"><Trash2 size={14} /></button>
                      <button onClick={() => activeSectionId && loadLiveRows(activeSectionId)} className="p-1.5 rounded hover:bg-muted text-muted-foreground hover:text-foreground"><RefreshCw size={14} /></button>
                    </div>
                  </div>
                ))}

                {/* Stock / Estimates mode switch — matches the reference app's separate tabs */}
                <div className="flex gap-1 bg-muted/30 rounded-xl p-1 w-fit mb-4">
                  {(['stock', 'estimates'] as const).map((m) => (
                    <button
                      key={m}
                      onClick={() => setRowMode(m)}
                      className={`px-4 py-1.5 rounded-lg text-sm font-semibold capitalize transition-all ${
                        rowMode === m ? 'bg-primary text-white' : 'text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {rowsLoading ? (
                  <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 skeleton-wave rounded-lg" />)}</div>
                ) : rowsError ? (
                  <div className="p-4 bg-danger/10 rounded-lg text-sm text-foreground">{rowsError}</div>
                ) : liveRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No product rows found on this tab yet.</p>
                ) : (
                  <>
                    <div className="flex flex-wrap items-center gap-3 mb-3">
                      <input
                        value={rowSearch}
                        onChange={(e) => setRowSearch(e.target.value)}
                        placeholder="Search products..."
                        className="input-field flex-1 min-w-[180px] text-sm"
                      />
                      <label className="flex items-center gap-2 text-xs font-semibold text-muted-foreground flex-shrink-0">
                        <input type="checkbox" checked={showAllRows} onChange={(e) => setShowAllRows(e.target.checked)} />
                        Show all products
                      </label>
                    </div>

                    <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
                      {filteredSortedRows.length === 0 ? (
                        <div className="p-6 text-center text-sm text-muted-foreground">
                          {anyRowHasValue ? 'No products match. Toggle "Show all products" to see everything.' : 'No products match your search.'}
                        </div>
                      ) : (
                        filteredSortedRows.map((r) => {
                          const original = rowMode === 'stock' ? r.stock : r.estimate;
                          const current = valueForRow(r.row, original);
                          return (
                            <div key={r.row} className="p-3 flex items-center justify-between gap-3 hover:bg-muted/20">
                              <div className="font-semibold text-sm text-foreground truncate">{r.name}</div>
                              <input
                                type="text"
                                inputMode="numeric"
                                value={current === 0 ? '' : current}
                                placeholder="0"
                                onChange={(e) => {
                                  const raw = e.target.value.replace(/[^0-9]/g, '');
                                  setActiveEdits((prev) => ({ ...prev, [r.row]: raw === '' ? 0 : Math.max(0, Number(raw)) }));
                                }}
                                className="w-20 h-9 text-center font-bold border border-border rounded-lg bg-muted/30 focus:outline-none"
                              />
                            </div>
                          );
                        })
                      )}
                    </div>

                    <div className="flex items-center gap-3 mt-4">
                      <div className="text-xs text-muted-foreground flex-1">
                        {activeChangedCount > 0 ? `${activeChangedCount} change${activeChangedCount === 1 ? '' : 's'} pending` : 'No changes'}
                      </div>
                      <button
                        onClick={handleActiveSave}
                        disabled={activeSaving || activeChangedCount === 0}
                        className="btn-primary text-sm px-5 flex items-center gap-2"
                      >
                        {activeSaving && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {activeSaving ? 'Saving...' : `Save ${rowMode === 'stock' ? 'Stock' : 'Estimates'}`}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

      {(savingStock || savingEstimates) && (
        <div className="fixed inset-0 z-[80] bg-black/40 flex items-center justify-center p-6">
          <div className="bg-card rounded-3xl shadow-xl px-8 py-7 flex flex-col items-center gap-4 max-w-xs w-full text-center">
            <span className="w-9 h-9 border-4 border-primary/25 border-t-primary rounded-full animate-spin" />
            <div>
              <p className="font-bold text-foreground">Saving {savingStock ? 'stock' : 'estimates'}...</p>
              <p className="text-xs text-muted-foreground mt-1">Writing directly to your Google Sheet.</p>
            </div>
          </div>
        </div>
      )}


      {showSectionModal && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setShowSectionModal(false)}>
          <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-lg font-bold text-foreground">{editingSectionId ? 'Edit Section' : 'Add Section'}</h3>
              <button onClick={() => setShowSectionModal(false)} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground"><X size={16} /></button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Section Name</label>
                <input type="text" className="input-field" placeholder="e.g. Production" value={sectionForm.name} onChange={(e) => setSectionForm((f) => ({ ...f, name: e.target.value }))} />
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Tab Name (exact match in your sheet)</label>
                <input type="text" className="input-field" placeholder="e.g. Production" value={sectionForm.tab_name} onChange={(e) => setSectionForm((f) => ({ ...f, tab_name: e.target.value }))} />
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Name Col</label>
                  <input type="text" maxLength={2} className="input-field uppercase" value={sectionForm.name_column} onChange={(e) => setSectionForm((f) => ({ ...f, name_column: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Stock Col</label>
                  <input type="text" maxLength={2} className="input-field uppercase" value={sectionForm.stock_column} onChange={(e) => setSectionForm((f) => ({ ...f, stock_column: e.target.value.toUpperCase() }))} />
                </div>
                <div>
                  <label className="block text-xs font-medium text-foreground mb-1.5">Estimate Col</label>
                  <input type="text" maxLength={2} className="input-field uppercase" value={sectionForm.estimate_column} onChange={(e) => setSectionForm((f) => ({ ...f, estimate_column: e.target.value.toUpperCase() }))} />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-foreground mb-1.5">Header Row (data starts on the next row)</label>
                <input type="number" min={1} className="input-field" value={sectionForm.header_row} onChange={(e) => setSectionForm((f) => ({ ...f, header_row: Number(e.target.value) }))} />
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button onClick={() => setShowSectionModal(false)} className="btn-secondary flex-1 text-sm">Cancel</button>
              <button onClick={handleSaveSection} disabled={savingSection} className="btn-primary flex-1 text-sm flex items-center justify-center gap-2">
                {savingSection && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                <CheckCircle size={15} /> {savingSection ? 'Saving...' : 'Save Section'}
              </button>
            </div>
          </div>
        </div>
      )}
    </BusinessLayout>
  );
}
