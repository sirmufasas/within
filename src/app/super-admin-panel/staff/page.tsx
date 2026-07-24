'use client';
import React from 'react';
import SuperAdminLayout from '@/components/SuperAdminLayout';
import { Plus } from 'lucide-react';

const mockStaff = [
  { id: '1', name: 'Ricardo Alves', email: 'superadmin@within.app', role: 'super_admin', status: 'active', lastLogin: '2026-07-22' },
  { id: '2', name: 'Sofia Martins', email: 'sofia@within.app', role: 'support', status: 'active', lastLogin: '2026-07-21' },
  { id: '3', name: 'Bruno Costa', email: 'bruno@within.app', role: 'support', status: 'inactive', lastLogin: '2026-07-10' },
];

export const dynamic = 'force-dynamic';

export default function SuperAdminStaffPage() {
  return (
    <SuperAdminLayout adminName="Ricardo Alves" suspendedCount={2} expiringCount={5}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Staff & Admins</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{mockStaff?.length} platform staff members</p>
          </div>
          <button className="btn-primary text-sm">
            <Plus size={16} /> Add Staff Member
          </button>
        </div>

        <div className="card-base overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="table-header">Staff Member</th>
                  <th className="table-header hidden sm:table-cell">Email</th>
                  <th className="table-header">Role</th>
                  <th className="table-header hidden md:table-cell">Last Login</th>
                  <th className="table-header">Status</th>
                </tr>
              </thead>
              <tbody>
                {mockStaff?.map((staff) => (
                  <tr key={staff?.id} className="hover:bg-muted/20 transition-colors">
                    <td className="table-cell">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full within-gradient flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                          {staff?.name?.[0]}
                        </div>
                        <p className="font-medium text-foreground text-sm">{staff?.name}</p>
                      </div>
                    </td>
                    <td className="table-cell hidden sm:table-cell">
                      <span className="text-sm text-muted-foreground">{staff?.email}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${staff?.role === 'super_admin' ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'}`}>
                        {staff?.role === 'super_admin' ? 'Super Admin' : 'Support'}
                      </span>
                    </td>
                    <td className="table-cell hidden md:table-cell">
                      <span className="text-sm text-muted-foreground">{staff?.lastLogin}</span>
                    </td>
                    <td className="table-cell">
                      <span className={`badge-base text-xs ${staff?.status === 'active' ? 'bg-success/10 text-success' : 'bg-muted text-muted-foreground'}`}>
                        {staff?.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </SuperAdminLayout>
  );
}
