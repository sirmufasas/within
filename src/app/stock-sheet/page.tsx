'use client';
export const dynamic = 'force-dynamic';

import React, { useCallback, useEffect, useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { useAuth } from '@/contexts/AuthContext';
import { createClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import {
  Sheet, Plus, X, CheckCircle, Copy, RefreshCw, Trash2, Edit2, ExternalLink,
} from 'lucide-react';
import {
  getServiceAccountInfo, testAndSaveConnection, getSectionLiveData,
  saveSectionStock, saveSectionEstimates,
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

  const loadSetup = useCallback(async () => {
    if (!business?.id) return;
    setLoading(true);
    try {
      const [connRes, sectionsRes, svcRes] = await Promise.all([
        supabase.from('google_sheet_connections').select('spreadsheet_id, spreadsheet_label, last_verified_at').eq('business_id', business.id).maybeSingle(),
        supabase.from('stock_sections').select('*').eq('business_id', business.id).order('sort_order'),
        getServiceAccountInfo(),
      ]);
      if (connRes.error) throw connRes.error;
      if (sectionsRes.error) throw sectionsRes.error;
      setConnection(connRes.data || null);
      setSections(sectionsRes.data || []);
      setServiceEmail(svcRes.email);
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

                {rowsLoading ? (
                  <div className="space-y-2">{[0, 1, 2, 3].map((i) => <div key={i} className="h-10 skeleton-wave rounded-lg" />)}</div>
                ) : rowsError ? (
                  <div className="p-4 bg-danger/10 rounded-lg text-sm text-foreground">{rowsError}</div>
                ) : liveRows.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No product rows found on this tab yet.</p>
                ) : (
                  <>
                    <div className="overflow-x-auto">
                      <table className="w-full">
                        <thead>
                          <tr className="border-b border-border">
                            <th className="table-header">Product</th>
                            <th className="table-header">Stock</th>
                            <th className="table-header">Estimate</th>
                          </tr>
                        </thead>
                        <tbody>
                          {liveRows.map((r) => (
                            <tr key={r.row} className="hover:bg-muted/20">
                              <td className="table-cell text-sm text-foreground">{r.name}</td>
                              <td className="table-cell">
                                <input
                                  type="number" min={0}
                                  className="input-field w-24 text-sm py-1.5"
                                  value={stockEdits[r.row] ?? r.stock}
                                  onChange={(e) => setStockEdits((prev) => ({ ...prev, [r.row]: Number(e.target.value) }))}
                                />
                              </td>
                              <td className="table-cell">
                                <input
                                  type="number" min={0}
                                  className="input-field w-24 text-sm py-1.5"
                                  value={estimateEdits[r.row] ?? r.estimate}
                                  onChange={(e) => setEstimateEdits((prev) => ({ ...prev, [r.row]: Number(e.target.value) }))}
                                />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    <div className="flex gap-3 mt-5">
                      <button onClick={handleSaveStock} disabled={savingStock} className="btn-primary text-sm flex-1 flex items-center justify-center gap-2">
                        {savingStock && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {savingStock ? 'Saving...' : 'Save Stock'}
                      </button>
                      <button onClick={handleSaveEstimates} disabled={savingEstimates} className="btn-primary text-sm flex-1 flex items-center justify-center gap-2">
                        {savingEstimates && <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />}
                        {savingEstimates ? 'Saving...' : 'Save Estimates'}
                      </button>
                    </div>
                  </>
                )}
              </div>
            )}
          </>
        )}
      </div>

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
