'use client';
export const dynamic = 'force-dynamic';

import React, { useState } from 'react';
import BusinessLayout from '@/components/BusinessLayout';
import { Users, Building2, Shield, Activity, Plus, Search, Edit, CheckCircle, XCircle, Clock, MoreVertical, Key, X,  } from 'lucide-react';

type TabType = 'employees' | 'departments' | 'roles' | 'activity';

const mockDepartments = [
  { id: 'd1', name: 'Production', headCount: 4, manager: 'João Silva', color: 'bg-primary/10 text-primary' },
  { id: 'd2', name: 'Sales & Orders', headCount: 3, manager: 'Ana Costa', color: 'bg-success/10 text-success' },
  { id: 'd3', name: 'Delivery', headCount: 2, manager: 'Miguel Santos', color: 'bg-warning/10 text-warning' },
  { id: 'd4', name: 'Administration', headCount: 2, manager: 'Sofia Ferreira', color: 'bg-danger/10 text-danger' },
];

const mockRoles = [
  {
    id: 'r1', name: 'Manager', color: 'bg-primary/10 text-primary',
    permissions: ['view_orders', 'edit_orders', 'view_customers', 'edit_customers', 'view_reports', 'manage_staff'],
  },
  {
    id: 'r2', name: 'Sales Rep', color: 'bg-success/10 text-success',
    permissions: ['view_orders', 'edit_orders', 'view_customers'],
  },
  {
    id: 'r3', name: 'Driver', color: 'bg-warning/10 text-warning',
    permissions: ['view_orders'],
  },
  {
    id: 'r4', name: 'Warehouse', color: 'bg-muted text-muted-foreground',
    permissions: ['view_orders', 'view_inventory', 'edit_inventory'],
  },
];

const allPermissions = [
  { key: 'view_orders', label: 'View Orders' },
  { key: 'edit_orders', label: 'Edit Orders' },
  { key: 'view_customers', label: 'View Customers' },
  { key: 'edit_customers', label: 'Edit Customers' },
  { key: 'view_reports', label: 'View Reports' },
  { key: 'view_inventory', label: 'View Inventory' },
  { key: 'edit_inventory', label: 'Edit Inventory' },
  { key: 'manage_staff', label: 'Manage Staff' },
];

const mockEmployees = [
  { id: 'e1', name: 'João Silva', email: 'joao@padaria.pt', phone: '+351 91 234 5678', department: 'Production', role: 'Manager', status: 'active', joinedDate: '2024-03-01', lastActive: '2026-07-22' },
  { id: 'e2', name: 'Ana Costa', email: 'ana@padaria.pt', phone: '+351 91 234 5679', department: 'Sales & Orders', role: 'Manager', status: 'active', joinedDate: '2024-05-15', lastActive: '2026-07-22' },
  { id: 'e3', name: 'Miguel Santos', email: 'miguel@padaria.pt', phone: '+351 91 234 5680', department: 'Delivery', role: 'Driver', status: 'active', joinedDate: '2024-06-01', lastActive: '2026-07-21' },
  { id: 'e4', name: 'Sofia Ferreira', email: 'sofia@padaria.pt', phone: '+351 91 234 5681', department: 'Administration', role: 'Manager', status: 'active', joinedDate: '2024-01-10', lastActive: '2026-07-22' },
  { id: 'e5', name: 'Carlos Mendes', email: 'carlos@padaria.pt', phone: '+351 91 234 5682', department: 'Delivery', role: 'Driver', status: 'inactive', joinedDate: '2024-08-20', lastActive: '2026-07-10' },
  { id: 'e6', name: 'Beatriz Lopes', email: 'beatriz@padaria.pt', phone: '+351 91 234 5683', department: 'Sales & Orders', role: 'Sales Rep', status: 'active', joinedDate: '2025-01-05', lastActive: '2026-07-22' },
  { id: 'e7', name: 'Rui Oliveira', email: 'rui@padaria.pt', phone: '+351 91 234 5684', department: 'Production', role: 'Warehouse', status: 'active', joinedDate: '2025-02-14', lastActive: '2026-07-21' },
];

const mockActivity = [
  { id: 'a1', user: 'João Silva', action: 'Updated order #ORD-042 status to Delivered', time: '10 min ago', type: 'order' },
  { id: 'a2', user: 'Ana Costa', action: 'Added new customer: Café Bom Dia', time: '32 min ago', type: 'customer' },
  { id: 'a3', user: 'Miguel Santos', action: 'Marked delivery route complete', time: '1 hr ago', type: 'delivery' },
  { id: 'a4', user: 'Beatriz Lopes', action: 'Created order #ORD-043 for Padaria Estrela', time: '2 hr ago', type: 'order' },
  { id: 'a5', user: 'Rui Oliveira', action: 'Updated stock: Farinha T65 +200kg', time: '3 hr ago', type: 'inventory' },
  { id: 'a6', user: 'Sofia Ferreira', action: 'Generated monthly revenue report', time: '5 hr ago', type: 'report' },
  { id: 'a7', user: 'João Silva', action: 'Added new product: Pão de Centeio', time: 'Yesterday', type: 'product' },
  { id: 'a8', user: 'Ana Costa', action: 'Updated customer contact: Hotel Lisboa', time: 'Yesterday', type: 'customer' },
];

const activityTypeColor: Record<string, string> = {
  order: 'bg-primary/10 text-primary',
  customer: 'bg-success/10 text-success',
  delivery: 'bg-warning/10 text-warning',
  inventory: 'bg-muted text-muted-foreground',
  report: 'bg-primary/10 text-primary',
  product: 'bg-success/10 text-success',
};

interface AddEmployeeModalProps {
  onClose: () => void;
}

function AddEmployeeModal({ onClose }: AddEmployeeModalProps) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', department: '', role: '' });
  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 fade-in" onClick={onClose}>
      <div className="bg-card rounded-2xl shadow-xl w-full max-w-md p-6 slide-up" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-bold text-foreground">Add Staff Member</h3>
          <button onClick={onClose} className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
            <X size={18} />
          </button>
        </div>
        <div className="space-y-4">
          {[
            { key: 'name', label: 'Full Name', placeholder: 'e.g. João Silva' },
            { key: 'email', label: 'Email', placeholder: 'joao@business.pt' },
            { key: 'phone', label: 'Phone', placeholder: '+351 91 000 0000' },
          ].map(field => (
            <div key={field.key}>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">{field.label}</label>
              <input
                type="text"
                placeholder={field.placeholder}
                className="input-field"
                value={form[field.key as keyof typeof form]}
                onChange={e => setForm(f => ({ ...f, [field.key]: e.target.value }))}
              />
            </div>
          ))}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Department</label>
              <select className="input-field" value={form.department} onChange={e => setForm(f => ({ ...f, department: e.target.value }))}>
                <option value="">Select...</option>
                {mockDepartments.map(d => <option key={d.id} value={d.name}>{d.name}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-muted-foreground mb-1.5">Role</label>
              <select className="input-field" value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="">Select...</option>
                {mockRoles.map(r => <option key={r.id} value={r.name}>{r.name}</option>)}
              </select>
            </div>
          </div>
        </div>
        <div className="flex gap-3 mt-6">
          <button onClick={onClose} className="btn-secondary flex-1 text-sm">Cancel</button>
          <button onClick={onClose} className="btn-primary flex-1 text-sm">Add Member</button>
        </div>
      </div>
    </div>
  );
}

export default function StaffManagementPage() {
  const [activeTab, setActiveTab] = useState<TabType>('employees');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);
  const [expandedRole, setExpandedRole] = useState<string | null>(null);

  const filteredEmployees = mockEmployees.filter(e =>
    e.name.toLowerCase().includes(search.toLowerCase()) ||
    e.email.toLowerCase().includes(search.toLowerCase()) ||
    e.department.toLowerCase().includes(search.toLowerCase())
  );

  const tabs = [
    { key: 'employees' as TabType, label: 'Employees', icon: Users, count: mockEmployees.length },
    { key: 'departments' as TabType, label: 'Departments', icon: Building2, count: mockDepartments.length },
    { key: 'roles' as TabType, label: 'Roles & Permissions', icon: Shield, count: mockRoles.length },
    { key: 'activity' as TabType, label: 'Activity Log', icon: Activity, count: mockActivity.length },
  ];

  return (
    <BusinessLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff Management</h1>
            <p className="text-sm text-muted-foreground mt-0.5">Manage your team, departments, roles, and permissions</p>
          </div>
          <button onClick={() => setShowAddModal(true)} className="btn-primary text-sm flex items-center gap-2">
            <Plus size={16} /> Add Staff Member
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'Total Staff', value: mockEmployees.length.toString(), color: 'text-primary' },
            { label: 'Active', value: mockEmployees.filter(e => e.status === 'active').length.toString(), color: 'text-success' },
            { label: 'Departments', value: mockDepartments.length.toString(), color: 'text-foreground' },
            { label: 'Roles', value: mockRoles.length.toString(), color: 'text-foreground' },
          ].map((s, i) => (
            <div key={i} className="card-base p-4">
              <p className="text-xs text-muted-foreground mb-1">{s.label}</p>
              <p className={`text-2xl font-bold ${s.color}`}>{s.value}</p>
            </div>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 overflow-x-auto">
          {tabs.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap min-h-[44px] flex-shrink-0 ${
                activeTab === tab.key
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <tab.icon size={15} />
              <span className="hidden sm:inline">{tab.label}</span>
              <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.key ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Employees Tab */}
        {activeTab === 'employees' && (
          <div className="space-y-4">
            <div className="card-base p-4">
              <div className="relative">
                <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <input
                  type="text"
                  placeholder="Search employees..."
                  className="input-field pl-9"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>
            </div>
            <div className="card-base overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-border bg-muted/30">
                      <th className="table-header">Employee</th>
                      <th className="table-header hidden sm:table-cell">Department</th>
                      <th className="table-header hidden md:table-cell">Role</th>
                      <th className="table-header">Status</th>
                      <th className="table-header hidden lg:table-cell">Last Active</th>
                      <th className="table-header w-10"></th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEmployees.map((emp) => (
                      <tr key={emp.id} className="hover:bg-muted/20 transition-colors">
                        <td className="table-cell">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-full within-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                              {emp.name[0]}
                            </div>
                            <div className="min-w-0">
                              <p className="font-medium text-foreground text-sm truncate">{emp.name}</p>
                              <p className="text-xs text-muted-foreground truncate">{emp.email}</p>
                            </div>
                          </div>
                        </td>
                        <td className="table-cell hidden sm:table-cell">
                          <span className="text-sm text-muted-foreground">{emp.department}</span>
                        </td>
                        <td className="table-cell hidden md:table-cell">
                          {(() => {
                            const role = mockRoles.find(r => r.name === emp.role);
                            return (
                              <span className={`badge-base text-xs ${role?.color || 'bg-muted text-muted-foreground'}`}>
                                {emp.role}
                              </span>
                            );
                          })()}
                        </td>
                        <td className="table-cell">
                          <span className={`badge-base text-xs flex items-center gap-1 w-fit ${emp.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                            {emp.status === 'active' ? <CheckCircle size={11} /> : <XCircle size={11} />}
                            <span className="hidden sm:inline">{emp.status}</span>
                          </span>
                        </td>
                        <td className="table-cell hidden lg:table-cell">
                          <span className="text-xs text-muted-foreground">{emp.lastActive}</span>
                        </td>
                        <td className="table-cell">
                          <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
                            <MoreVertical size={15} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Departments Tab */}
        {activeTab === 'departments' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {mockDepartments.map((dept) => (
              <div key={dept.id} className="card-base p-5">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${dept.color}`}>
                      <Building2 size={18} />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{dept.name}</p>
                      <p className="text-xs text-muted-foreground">Manager: {dept.manager}</p>
                    </div>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors">
                    <Edit size={15} />
                  </button>
                </div>
                <div className="flex items-center justify-between pt-3 border-t border-border">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Users size={14} />
                    <span>{dept.headCount} members</span>
                  </div>
                  <div className="flex -space-x-2">
                    {mockEmployees
                      .filter(e => e.department === dept.name)
                      .slice(0, 4)
                      .map((emp) => (
                        <div
                          key={emp.id}
                          className="w-7 h-7 rounded-full within-gradient border-2 border-card flex items-center justify-center text-white text-xs font-semibold"
                          title={emp.name}
                        >
                          {emp.name[0]}
                        </div>
                      ))}
                  </div>
                </div>
              </div>
            ))}
            <button
              onClick={() => setShowAddModal(true)}
              className="card-base p-5 border-dashed flex items-center justify-center gap-2 text-muted-foreground hover:text-primary hover:border-primary/30 transition-all min-h-[120px]"
            >
              <Plus size={18} />
              <span className="text-sm font-medium">Add Department</span>
            </button>
          </div>
        )}

        {/* Roles & Permissions Tab */}
        {activeTab === 'roles' && (
          <div className="space-y-4">
            {mockRoles.map((role) => (
              <div key={role.id} className="card-base overflow-hidden">
                <button
                  onClick={() => setExpandedRole(expandedRole === role.id ? null : role.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-muted/20 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${role.color}`}>
                      <Shield size={16} />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-foreground">{role.name}</p>
                      <p className="text-xs text-muted-foreground">{role.permissions.length} permissions</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground hidden sm:block">
                      {mockEmployees.filter(e => e.role === role.name).length} staff
                    </span>
                    <Key size={15} className="text-muted-foreground" />
                  </div>
                </button>
                {expandedRole === role.id && (
                  <div className="px-5 pb-5 border-t border-border pt-4">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Permissions</p>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      {allPermissions.map((perm) => {
                        const hasPermission = role.permissions.includes(perm.key);
                        return (
                          <div
                            key={perm.key}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium ${
                              hasPermission
                                ? 'bg-success/10 text-success' :'bg-muted/50 text-muted-foreground'
                            }`}
                          >
                            {hasPermission ? <CheckCircle size={12} /> : <XCircle size={12} />}
                            {perm.label}
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        {/* Activity Log Tab */}
        {activeTab === 'activity' && (
          <div className="card-base overflow-hidden">
            <div className="p-4 border-b border-border flex items-center justify-between">
              <h3 className="font-semibold text-foreground">Staff Activity Log</h3>
              <span className="text-xs text-muted-foreground">{mockActivity.length} recent actions</span>
            </div>
            <div className="divide-y divide-border">
              {mockActivity.map((log) => (
                <div key={log.id} className="p-4 flex items-start gap-3 hover:bg-muted/20 transition-colors">
                  <div className="w-9 h-9 rounded-full within-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 mt-0.5">
                    {log.user[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-sm font-semibold text-foreground">{log.user}</span>
                        <span className="text-sm text-muted-foreground"> {log.action}</span>
                      </div>
                      <span className={`badge-base text-xs flex-shrink-0 ${activityTypeColor[log.type] || 'bg-muted text-muted-foreground'}`}>
                        {log.type}
                      </span>
                    </div>
                    <div className="flex items-center gap-1 mt-1">
                      <Clock size={11} className="text-muted-foreground" />
                      <span className="text-xs text-muted-foreground">{log.time}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {showAddModal && <AddEmployeeModal onClose={() => setShowAddModal(false)} />}
    </BusinessLayout>
  );
}
