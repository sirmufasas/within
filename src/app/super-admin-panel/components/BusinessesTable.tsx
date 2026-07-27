'use client';
import React, { useState } from 'react';
import {
  Search, ChevronUp, ChevronDown, Eye, Settings,
  Ban, MoreHorizontal,
} from 'lucide-react';
import Badge from '@/components/ui/Badge';
import { toast } from 'sonner';

type SubStatus = 'active' | 'trial' | 'expiring' | 'expired' | 'suspended';

interface Business {
  id: string;
  name: string;
  type: string;
  typeEmoji: string;
  plan: string;
  status: SubStatus;
  mrr: string;
  users: number;
  ordersMonth: number;
  joined: string;
  trialEnd: string | null;
  lastActive: string;
  country: string;
}

const businesses: Business[] = [
  {
    id: 'biz-001',
    name: 'Padaria São João',
    type: 'Bakery',
    typeEmoji: '🥖',
    plan: 'Growth',
    status: 'active',
    mrr: 'R 89',
    users: 4,
    ordersMonth: 847,
    joined: '12/01/2025',
    trialEnd: null,
    lastActive: '2 min ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-002',
    name: 'Talho do Mercado',
    type: 'Butchery',
    typeEmoji: '🥩',
    plan: 'Starter',
    status: 'suspended',
    mrr: 'R 49',
    users: 2,
    ordersMonth: 312,
    joined: '03/03/2025',
    trialEnd: null,
    lastActive: '3 days ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-003',
    name: 'Restaurante O Forno',
    type: 'Restaurant',
    typeEmoji: '🍽️',
    plan: 'Growth',
    status: 'trial',
    mrr: 'R 0',
    users: 3,
    ordersMonth: 128,
    joined: '15/07/2026',
    trialEnd: '29/07/2026',
    lastActive: '1 hr ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-004',
    name: 'Café Bica & Cia',
    type: 'Coffee Shop',
    typeEmoji: '☕',
    plan: 'Starter',
    status: 'active',
    mrr: 'R 49',
    users: 2,
    ordersMonth: 411,
    joined: '08/11/2024',
    trialEnd: null,
    lastActive: '4 hr ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-005',
    name: 'Hortifrutti Lisboa',
    type: 'Fruit & Veg',
    typeEmoji: '🥦',
    plan: 'Pro',
    status: 'active',
    mrr: 'R 149',
    users: 8,
    ordersMonth: 1204,
    joined: '22/06/2024',
    trialEnd: null,
    lastActive: '30 min ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-006',
    name: 'Distribuidora Norte',
    type: 'Distributor',
    typeEmoji: '🚚',
    plan: 'Pro',
    status: 'active',
    mrr: 'R 149',
    users: 12,
    ordersMonth: 2891,
    joined: '14/02/2024',
    trialEnd: null,
    lastActive: '15 min ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-007',
    name: 'Pastelaria Doce Lar',
    type: 'Bakery',
    typeEmoji: '🥖',
    plan: 'Starter',
    status: 'expiring',
    mrr: 'R 49',
    users: 1,
    ordersMonth: 189,
    joined: '20/04/2025',
    trialEnd: null,
    lastActive: '2 days ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-008',
    name: 'Caterings Lisboa',
    type: 'Catering',
    typeEmoji: '🍱',
    plan: 'Growth',
    status: 'active',
    mrr: 'R 89',
    users: 5,
    ordersMonth: 634,
    joined: '30/09/2024',
    trialEnd: null,
    lastActive: '6 hr ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-009',
    name: 'CleanPro Supplies',
    type: 'Cleaning',
    typeEmoji: '🧹',
    plan: 'Growth',
    status: 'trial',
    mrr: 'R 0',
    users: 2,
    ordersMonth: 44,
    joined: '18/07/2026',
    trialEnd: '01/08/2026',
    lastActive: '5 hr ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-010',
    name: 'Grossista Alentejo',
    type: 'Wholesaler',
    typeEmoji: '📦',
    plan: 'Pro',
    status: 'active',
    mrr: 'R 149',
    users: 9,
    ordersMonth: 1876,
    joined: '05/05/2024',
    trialEnd: null,
    lastActive: '1 hr ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-011',
    name: 'Padaria São Jorge',
    type: 'Bakery',
    typeEmoji: '🥖',
    plan: 'Growth',
    status: 'expiring',
    mrr: 'R 89',
    users: 3,
    ordersMonth: 521,
    joined: '10/06/2025',
    trialEnd: null,
    lastActive: '1 day ago',
    country: '🇵🇹',
  },
  {
    id: 'biz-012',
    name: 'Fábrica de Pão Minho',
    type: 'Manufacturer',
    typeEmoji: '🏭',
    plan: 'Pro',
    status: 'active',
    mrr: 'R 149',
    users: 15,
    ordersMonth: 3124,
    joined: '01/01/2024',
    trialEnd: null,
    lastActive: '20 min ago',
    country: '🇵🇹',
  },
];

const planBadge: Record<string, string> = {
  Starter: 'bg-slate-100 text-slate-600',
  Growth: 'bg-primary/10 text-primary',
  Pro: 'bg-violet-100 text-violet-700',
};

export default function BusinessesTable() {
  const [tableData, setTableData] = useState<Business[]>(businesses);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [planFilter, setPlanFilter] = useState('all');
  const [sortField, setSortField] = useState<keyof Business>('ordersMonth');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [selectedRows, setSelectedRows] = useState<Set<string>>(new Set());
  const [currentPage, setCurrentPage] = useState(1);
  const [openMenu, setOpenMenu] = useState<string | null>(null);
  const pageSize = 7;

  const filtered = tableData
    .filter((b) => {
      const q = search.toLowerCase();
      const matchSearch =
        b.name.toLowerCase().includes(q) ||
        b.type.toLowerCase().includes(q);
      const matchStatus = statusFilter === 'all' || b.status === statusFilter;
      const matchPlan = planFilter === 'all' || b.plan === planFilter;
      return matchSearch && matchStatus && matchPlan;
    })
    .sort((a, b) => {
      const av = a[sortField] ?? '';
      const bv = b[sortField] ?? '';
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const totalPages = Math.ceil(filtered.length / pageSize);
  const paged = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const toggleSort = (field: keyof Business) => {
    if (sortField === field) setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const toggleRow = (id: string) => {
    const next = new Set(selectedRows);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    setSelectedRows(next);
  };

  const toggleAll = () => {
    if (selectedRows.size === paged.length) setSelectedRows(new Set());
    else setSelectedRows(new Set(paged.map((b) => b.id)));
  };

  const suspendBusiness = (id: string) => {
    setTableData((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'suspended' as SubStatus } : b))
    );
    setOpenMenu(null);
    toast.warning('Business account suspended');
  };

  const activateBusiness = (id: string) => {
    setTableData((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status: 'active' as SubStatus } : b))
    );
    setOpenMenu(null);
    toast.success('Business account reactivated');
  };

  const SortIcon = ({ field }: { field: keyof Business }) => {
    if (sortField !== field) return <ChevronUp size={12} className="text-muted-foreground opacity-30" />;
    return sortDir === 'asc'
      ? <ChevronUp size={12} className="text-primary" />
      : <ChevronDown size={12} className="text-primary" />;
  };

  return (
    <div className="card-base overflow-hidden">
      {/* Header */}
      <div className="px-5 py-4 border-b border-border flex flex-col sm:flex-row gap-3 sm:items-center sm:justify-between">
        <div>
          <h3 className="text-base font-semibold text-foreground">All Businesses</h3>
          <p className="text-xs text-muted-foreground mt-0.5">{filtered.length} tenants on platform</p>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={search}
              onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
              placeholder="Search businesses..."
              className="input-field pl-8 py-2 text-sm w-44"
            />
          </div>
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
            className="input-field py-2 text-sm w-36"
          >
            <option value="all">All Statuses</option>
            <option value="active">Active</option>
            <option value="trial">Trial</option>
            <option value="expiring">Expiring</option>
            <option value="suspended">Suspended</option>
          </select>
          <select
            value={planFilter}
            onChange={(e) => { setPlanFilter(e.target.value); setCurrentPage(1); }}
            className="input-field py-2 text-sm w-32"
          >
            <option value="all">All Plans</option>
            <option value="Starter">Starter</option>
            <option value="Growth">Growth</option>
            <option value="Pro">Pro</option>
          </select>
        </div>
      </div>

      {/* Bulk Action Bar */}
      {selectedRows.size > 0 && (
        <div className="px-5 py-2.5 bg-primary/5 border-b border-primary/20 flex items-center gap-4 slide-up">
          <span className="text-sm font-medium text-primary">{selectedRows.size} selected</span>
          <button
            onClick={() => {
              selectedRows.forEach((id) => suspendBusiness(id));
              setSelectedRows(new Set());
            }}
            className="text-xs text-warning font-medium hover:underline"
          >
            Suspend selected
          </button>
          <button
            onClick={() => setSelectedRows(new Set())}
            className="text-xs text-muted-foreground hover:underline ml-auto"
          >
            Deselect all
          </button>
        </div>
      )}

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr>
              <th className="table-header w-10 text-center">
                <input
                  type="checkbox"
                  checked={selectedRows.size === paged.length && paged.length > 0}
                  onChange={toggleAll}
                  className="w-4 h-4 rounded border-border text-primary"
                  aria-label="Select all businesses"
                />
              </th>
              {[
                { key: 'name', label: 'Business' },
                { key: 'type', label: 'Type' },
                { key: 'plan', label: 'Plan' },
                { key: 'status', label: 'Status' },
                { key: 'mrr', label: 'MRR' },
                { key: 'users', label: 'Users' },
                { key: 'ordersMonth', label: 'Orders/Mo' },
                { key: 'joined', label: 'Joined' },
                { key: 'trialEnd', label: 'Trial Ends' },
                { key: 'lastActive', label: 'Last Active' },
              ].map((col) => (
                <th
                  key={`sa-th-${col.key}`}
                  className="table-header cursor-pointer select-none"
                  onClick={() => toggleSort(col.key as keyof Business)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <SortIcon field={col.key as keyof Business} />
                  </div>
                </th>
              ))}
              <th className="table-header text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            {paged.length === 0 ? (
              <tr>
                <td colSpan={12} className="table-cell text-center py-12 text-muted-foreground">
                  No businesses match your search
                </td>
              </tr>
            ) : (
              paged.map((biz) => (
                <tr
                  key={biz.id}
                  className={`hover:bg-muted/40 transition-colors duration-100 ${
                    selectedRows.has(biz.id) ? 'bg-primary/5' : ''
                  } ${biz.status === 'suspended' ? 'opacity-70' : ''}`}
                >
                  <td className="table-cell text-center">
                    <input
                      type="checkbox"
                      checked={selectedRows.has(biz.id)}
                      onChange={() => toggleRow(biz.id)}
                      className="w-4 h-4 rounded border-border text-primary"
                      aria-label={`Select ${biz.name}`}
                    />
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center text-base flex-shrink-0">
                        {biz.typeEmoji}
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-foreground truncate max-w-[140px]">{biz.name}</p>
                        <p className="text-xs text-muted-foreground">{biz.country} Portugal</p>
                      </div>
                    </div>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-secondary-foreground">{biz.type}</span>
                  </td>
                  <td className="table-cell">
                    <span className={`badge-base text-xs ${planBadge[biz.plan] || 'bg-slate-100 text-slate-600'}`}>
                      {biz.plan}
                    </span>
                  </td>
                  <td className="table-cell">
                    <Badge variant={biz.status} dot>
                      {biz.status === 'active' ? 'Active'
                        : biz.status === 'trial' ? 'Trial'
                        : biz.status === 'expiring' ? 'Expiring'
                        : biz.status === 'expired'? 'Expired' :'Suspended'}
                    </Badge>
                  </td>
                  <td className="table-cell">
                    <span className="font-semibold text-foreground tabular-nums">{biz.mrr}</span>
                  </td>
                  <td className="table-cell">
                    <span className="tabular-nums text-foreground">{biz.users}</span>
                  </td>
                  <td className="table-cell">
                    <span className="tabular-nums text-foreground">{biz.ordersMonth.toLocaleString()}</span>
                  </td>
                  <td className="table-cell">
                    <span className="text-sm text-secondary-foreground">{biz.joined}</span>
                  </td>
                  <td className="table-cell">
                    {biz.trialEnd ? (
                      <span className="text-sm text-warning font-medium">{biz.trialEnd}</span>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </td>
                  <td className="table-cell">
                    <span className="text-xs text-muted-foreground">{biz.lastActive}</span>
                  </td>
                  <td className="table-cell">
                    <div className="flex items-center gap-1 justify-center">
                      <button
                        className="p-1.5 rounded-lg hover:bg-primary/10 text-muted-foreground hover:text-primary transition-all duration-150 group/btn relative"
                        aria-label={`View ${biz.name}`}
                      >
                        <Eye size={14} />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                          View business
                        </span>
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-accent/10 text-muted-foreground hover:text-accent transition-all duration-150 group/btn relative"
                        aria-label={`Settings for ${biz.name}`}
                      >
                        <Settings size={14} />
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 px-2 py-1 bg-foreground text-primary-foreground text-xs rounded whitespace-nowrap opacity-0 group-hover/btn:opacity-100 transition-opacity pointer-events-none">
                          Manage settings
                        </span>
                      </button>
                      <div className="relative">
                        <button
                          onClick={() => setOpenMenu(openMenu === biz.id ? null : biz.id)}
                          className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-all duration-150"
                          aria-label="More actions"
                        >
                          <MoreHorizontal size={14} />
                        </button>
                        {openMenu === biz.id && (
                          <div className="absolute right-0 top-full mt-1 w-40 bg-card border border-border rounded-xl shadow-modal z-20 py-1 fade-in">
                            {biz.status !== 'suspended' ? (
                              <button
                                onClick={() => suspendBusiness(biz.id)}
                                className="w-full text-left px-3 py-2 text-sm text-warning hover:bg-warning/10 transition-colors duration-100 flex items-center gap-2"
                              >
                                <Ban size={13} />
                                Suspend account
                              </button>
                            ) : (
                              <button
                                onClick={() => activateBusiness(biz.id)}
                                className="w-full text-left px-3 py-2 text-sm text-success hover:bg-success/10 transition-colors duration-100"
                              >
                                Reactivate account
                              </button>
                            )}
                            <button
                              onClick={() => {
                                setOpenMenu(null);
                                toast.info('Subscription email sent');
                              }}
                              className="w-full text-left px-3 py-2 text-sm text-foreground hover:bg-muted transition-colors duration-100"
                            >
                              Send reminder
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-5 py-3 border-t border-border flex flex-col sm:flex-row items-center justify-between gap-3">
        <span className="text-sm text-muted-foreground">
          Showing {Math.min((currentPage - 1) * pageSize + 1, filtered.length)}–{Math.min(currentPage * pageSize, filtered.length)} of {filtered.length} businesses
        </span>
        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }).map((_, i) => (
            <button
              key={`sa-page-${i + 1}`}
              onClick={() => setCurrentPage(i + 1)}
              className={`w-8 h-8 text-sm rounded-lg transition-all duration-150 ${
                currentPage === i + 1
                  ? 'bg-primary text-primary-foreground font-semibold'
                  : 'border border-border hover:bg-muted text-foreground'
              }`}
            >
              {i + 1}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 text-sm rounded-lg border border-border hover:bg-muted disabled:opacity-40 disabled:cursor-not-allowed transition-all duration-150"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}