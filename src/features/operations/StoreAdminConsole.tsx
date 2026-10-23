import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId, Order } from '../../types/store';
import { AdminCatalogManager } from './AdminCatalogManager';
import { CouponManager } from './CouponManager';
import { formatInr, formatInrCompact } from '../../lib/currency';
import {
  ShieldCheck,
  TrendingUp,
  Package,
  Layers,
  Users,
  Clock,
  UserPlus,
  Trash2,
  CheckCircle2,
  Download,
  Filter,
  X,
} from 'lucide-react';

export const StoreAdminConsole: React.FC = () => {
  const {
    staffList,
    assignManager,
    revokeStaff,
    auditLogs,
    inventory,
    adjustStock,
    orders,
    updateOrderStatus,
    catalogStatus,
    updateCatalogStatus,
    products,
    setActiveView,
  } = useStore();

  const [isAssignModalOpen, setIsAssignModalOpen] = useState(false);
  const [newStaffName, setNewStaffName] = useState('');
  const [newStaffEmail, setNewStaffEmail] = useState('');
  const [selectedDeptIds, setSelectedDeptIds] = useState<DepartmentId[]>(['fashion', 'beauty']);
  const [auditFilterType, setAuditFilterType] = useState<string>('all');

  const departmentList = Object.values(DEPARTMENTS);

  const handleCreateManager = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newStaffName.trim() || !newStaffEmail.trim()) return;

    assignManager(newStaffName.trim(), newStaffEmail.trim(), selectedDeptIds);
    setNewStaffName('');
    setNewStaffEmail('');
    setIsAssignModalOpen(false);
  };

  const toggleDeptSelection = (deptId: DepartmentId) => {
    if (selectedDeptIds.includes(deptId)) {
      if (selectedDeptIds.length > 1) {
        setSelectedDeptIds(selectedDeptIds.filter((id) => id !== deptId));
      }
    } else {
      setSelectedDeptIds([...selectedDeptIds, deptId]);
    }
  };

  const filteredAuditLogs = auditFilterType === 'all'
    ? auditLogs
    : auditLogs.filter((log) => log.type === auditFilterType);

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Executive Banner (Image 6) */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2D2D35]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-none bg-[#C9A84C]/10 border-2 border-[#C9A84C] flex items-center justify-center font-display-hero text-2xl text-[#C9A84C]">
                SS
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#C9A84C] mb-1">
                  <span>ADMINISTRATIVE GOVERNANCE</span>
                  <span>•</span>
                  <span className="text-[#22C55E]">2FA VERIFIED ACTIVE SESSION</span>
                </div>
                <h1 className="font-display-hero text-2xl sm:text-3xl text-[#FAF9F5]">
                  Sophia Sterling — Chief Operating Officer
                </h1>
                <p className="text-xs font-mono text-[#8E8D94] mt-0.5">
                  Store Administrator · Level 1 Unrestricted RBAC Scope · All 6 Departments
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsAssignModalOpen(true)}
                className="flex items-center gap-2 bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] px-4 py-2.5 font-mono text-xs uppercase tracking-wider font-bold transition-colors cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>Assign Department Manager</span>
              </button>
            </div>
          </div>

          {/* Top KPI Bento Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="flex items-center justify-between text-[#8E8D94] text-xs font-mono mb-1">
                <span>Gross Merchandise Value (GMV)</span>
                <TrendingUp className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="font-mono text-2xl font-bold text-[#FAF9F5]">{formatInrCompact(1428500)}</div>
              <div className="text-[10px] font-mono text-[#22C55E] mt-1">+18.4% MoM across 6 depts</div>
            </div>

            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="flex items-center justify-between text-[#8E8D94] text-xs font-mono mb-1">
                <span>Multi-Department Orders</span>
                <Layers className="w-4 h-4 text-[#C9A84C]" />
              </div>
              <div className="font-mono text-2xl font-bold text-[#FAF9F5]">3,892</div>
              <div className="text-[10px] font-mono text-[#8E8D94] mt-1">68.4% of total order volume</div>
            </div>

            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="flex items-center justify-between text-[#8E8D94] text-xs font-mono mb-1">
                <span>Active Catalog SKUs</span>
                <Package className="w-4 h-4 text-[#3B82F6]" />
              </div>
              <div className="font-mono text-2xl font-bold text-[#FAF9F5]">14,240</div>
              <div className="text-[10px] font-mono text-[#8E8D94] mt-1">Synchronized real-time</div>
            </div>

            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="flex items-center justify-between text-[#8E8D94] text-xs font-mono mb-1">
                <span>Single-Parcel Cross-Dock SLA</span>
                <Clock className="w-4 h-4 text-[#22C55E]" />
              </div>
              <div className="font-mono text-2xl font-bold text-[#22C55E]">99.4%</div>
              <div className="text-[10px] font-mono text-[#8E8D94] mt-1">On-time Bay 4 consolidation</div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 2xl:grid-cols-2">
          <AdminCatalogManager />
          <CouponManager />
        </div>

        <section className="rounded-2xl border border-violet-200 bg-gradient-to-r from-blue-50 via-violet-50 to-amber-50 p-6 shadow-sm">
          <p className="font-mono text-[10px] font-bold uppercase tracking-[0.2em] text-violet-700">Admin workspace</p>
          <h2 className="mt-1 text-2xl font-semibold text-slate-900">Editorial & design tools</h2>
          <p className="mt-1 text-sm text-slate-600">Store-only controls moved out of the shopper navigation.</p>
          <div className="mt-4 flex flex-wrap gap-3"><button type="button" onClick={() => setActiveView('magazine')} className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-blue-800">Open Everything Issue</button><button type="button" onClick={() => setActiveView('theme-lab')} className="rounded-lg bg-violet-700 px-4 py-2 text-sm font-semibold text-white transition hover:-translate-y-0.5 hover:bg-violet-800">Open Token Lab</button></div>
        </section>

        {/* Live catalog, stock and fulfillment controls */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          <section className="bg-[#1A1A1E] border border-[#2D2D35] p-6" aria-labelledby="catalog-operations-title">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#2D2D35] pb-4">
              <div>
                <h2 id="catalog-operations-title" className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-[#FAF9F5]">
                  <Package className="h-4 w-4 text-[#C9A84C]" /> Catalog & stock controls
                </h2>
                <p className="mt-1 text-xs text-[#8E8D94]">Pause a shopper listing or apply a quick stock correction. Every mutation appears in the audit ledger.</p>
              </div>
              <span className="border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-1 font-mono text-[10px] text-[#C9A84C]">ADMIN ONLY</span>
            </div>
            <div className="max-h-[31rem] overflow-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="sticky top-0 bg-[#141417] text-[10px] uppercase tracking-wider text-[#8E8D94]">
                  <tr><th className="px-3 py-3">Product</th><th className="px-3 py-3">Stock</th><th className="px-3 py-3 text-right">Catalog</th></tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D35]">
                  {products.map((product) => {
                    const stock = inventory[product.sku]?.stock ?? product.stockCount;
                    const status = catalogStatus[product.id];
                    return (
                      <tr key={product.id} className="hover:bg-[#141417]/50">
                        <td className="px-3 py-3">
                          <span className="block font-sans font-medium text-[#FAF9F5]">{product.name}</span>
                          <span className="text-[10px] text-[#8E8D94]">{product.sku} · {DEPARTMENTS[product.department].title}</span>
                        </td>
                        <td className="px-3 py-3">
                          <div className="flex items-center gap-2">
                            <button id={`admin-stock-minus-${product.id}`} type="button" onClick={() => adjustStock(product.sku, product.name, -5, 'Admin stock correction', product.department)} className="h-7 w-7 border border-[#3E3E47] text-[#FAF9F5] transition-colors hover:border-[#C9A84C]" aria-label={`Reduce ${product.name} stock by 5`}>−</button>
                            <span className="min-w-7 text-center text-[#FAF9F5]">{stock}</span>
                            <button id={`admin-stock-plus-${product.id}`} type="button" onClick={() => adjustStock(product.sku, product.name, 5, 'Admin stock correction', product.department)} className="h-7 w-7 border border-[#3E3E47] text-[#FAF9F5] transition-colors hover:border-[#C9A84C]" aria-label={`Increase ${product.name} stock by 5`}>+</button>
                          </div>
                        </td>
                        <td className="px-3 py-3 text-right">
                          <button id={`admin-catalog-toggle-${product.id}`} type="button" onClick={() => updateCatalogStatus(product.id, status === 'live' ? 'paused' : 'live')} className={`border px-2 py-1 text-[10px] font-bold uppercase transition-colors ${status === 'live' ? 'border-[#22C55E]/40 bg-[#22C55E]/10 text-[#22C55E] hover:border-[#F59E0B] hover:text-[#F59E0B]' : 'border-[#F59E0B]/40 bg-[#F59E0B]/10 text-[#F59E0B] hover:border-[#22C55E] hover:text-[#22C55E]'}`}>
                            {status === 'live' ? 'Live · pause' : 'Paused · restore'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </section>

          <section className="bg-[#1A1A1E] border border-[#2D2D35] p-6" aria-labelledby="order-operations-title">
            <div className="mb-4 flex items-start justify-between gap-4 border-b border-[#2D2D35] pb-4">
              <div>
                <h2 id="order-operations-title" className="flex items-center gap-2 font-mono text-sm font-semibold uppercase tracking-wider text-[#FAF9F5]">
                  <Clock className="h-4 w-4 text-[#C9A84C]" /> Order fulfillment controls
                </h2>
                <p className="mt-1 text-xs text-[#8E8D94]">Changing an order stage immediately updates the shopper tracking timeline in this demo.</p>
              </div>
              <span className="border border-[#C9A84C]/30 bg-[#C9A84C]/10 px-2 py-1 font-mono text-[10px] text-[#C9A84C]">LIVE DEMO</span>
            </div>
            <div className="max-h-[31rem] overflow-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead className="sticky top-0 bg-[#141417] text-[10px] uppercase tracking-wider text-[#8E8D94]">
                  <tr><th className="px-3 py-3">Order</th><th className="px-3 py-3">Total</th><th className="px-3 py-3 text-right">Fulfillment stage</th></tr>
                </thead>
                <tbody className="divide-y divide-[#2D2D35]">
                  {orders.map((order) => (
                    <tr key={order.id} className="hover:bg-[#141417]/50">
                      <td className="px-3 py-3">
                        <span className="block font-semibold text-[#FAF9F5]">{order.id}</span>
                        <span className="text-[10px] text-[#8E8D94]">{order.departmentCount} depts · {order.items.length} line items</span>
                      </td>
                      <td className="px-3 py-3 font-semibold text-[#C9A84C]">{formatInr(order.total)}</td>
                      <td className="px-3 py-3 text-right">
                        <select id={`admin-order-status-${order.id}`} value={order.status} onChange={(event) => updateOrderStatus(order.id, event.target.value as Order['status'])} className="border border-[#3E3E47] bg-[#141417] px-2 py-1.5 text-[10px] uppercase text-[#FAF9F5] outline-none focus:border-[#C9A84C]">
                          <option value="placed">Placed</option>
                          <option value="packed">Packed</option>
                          <option value="shipped">Shipped</option>
                          <option value="out_for_delivery">Out for delivery</option>
                          <option value="delivered">Delivered</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* 6-Department Real-Time Fulfillment & Stock Health Matrix */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2D2D35]">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#C9A84C]" />
                6-Department Executive Matrix & Cross-Dock Routing
              </h2>
              <p className="text-xs text-[#8E8D94]">Live inventory health and revenue contribution per flagship wing</p>
            </div>
            <span className="text-[10px] font-mono bg-[#22C55E]/10 text-[#22C55E] px-2 py-0.5 border border-[#22C55E]/30">
              Cross-Dock Synchronized
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departmentList.map((dept) => (
              <div
                key={dept.id}
                className="bg-[#141417] border border-[#2D2D35] p-4 relative overflow-hidden group hover:border-[#C9A84C] transition-colors"
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: dept.colorAccent }}
                />
                <div className="flex justify-between items-start mb-2">
                  <div>
                    <h3 className="font-sans font-semibold text-base text-[#FAF9F5]">{dept.title}</h3>
                    <div className="text-[10px] font-mono text-[#8E8D94] uppercase tracking-wider">
                      {dept.subtitle}
                    </div>
                  </div>
                  <span
                    className="text-[9px] font-mono px-2 py-0.5 uppercase border"
                    style={{
                      borderColor: `${dept.colorAccent}50`,
                      color: dept.colorAccent,
                    }}
                  >
                    Bay #{dept.id === 'electronics' ? '4A' : dept.id === 'fashion' ? '2B' : '3C'}
                  </span>
                </div>

                <div className="mt-4 pt-3 border-t border-[#2D2D35] grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <span className="text-[#8E8D94] block text-[10px]">Stock Health</span>
                    <span className="text-[#22C55E] font-medium">{dept.stockHealth}% Optimal</span>
                  </div>
                  <div>
                    <span className="text-[#8E8D94] block text-[10px]">Active Lead</span>
                    <span className="text-[#FAF9F5] truncate block">
                      {dept.manager}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* RBAC Staff Assignment Matrix (Image 6 Table) */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-[#2D2D35]">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                <Users className="w-4 h-4 text-[#C9A84C]" />
                RBAC Staff Assignment Matrix & Scoped Authorities
              </h2>
              <p className="text-xs text-[#8E8D94]">Hierarchical permission boundaries enforced at gateway API and UI</p>
            </div>
            <button
              onClick={() => setIsAssignModalOpen(true)}
              className="text-xs font-mono text-[#C9A84C] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" /> + Add Delegate
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141417] text-[#8E8D94] uppercase tracking-wider border-b border-[#2D2D35]">
                <tr>
                  <th className="py-3 px-4">Staff Member & Email</th>
                  <th className="py-3 px-4">RBAC System Role</th>
                  <th className="py-3 px-4">Authorized Departments</th>
                  <th className="py-3 px-4">MFA Status</th>
                  <th className="py-3 px-4">Account Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D35]">
                {staffList.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#141417]/50 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-sans font-medium text-[#FAF9F5]">{staff.name}</div>
                      <div className="text-[11px] text-[#8E8D94]">{staff.email}</div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span
                        className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                          staff.systemRole === 'Store Admin'
                            ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/40'
                            : 'bg-[#3B82F6]/10 text-[#3B82F6] border-[#3B82F6]/40'
                        }`}
                      >
                        {staff.systemRole}
                      </span>
                    </td>
                    <td className="py-3.5 px-4">
                      <div className="flex flex-wrap gap-1">
                        {staff.assignedDeptIds.map((dId) => {
                          const d = DEPARTMENTS[dId];
                          return (
                            <span
                              key={dId}
                              className="text-[9px] px-1.5 py-0.5 border"
                              style={{
                                borderColor: `${d?.colorAccent || '#C9A84C'}40`,
                                color: d?.colorAccent || '#C9A84C',
                              }}
                            >
                              {d?.title || dId}
                            </span>
                          );
                        })}
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="flex items-center gap-1 text-[#22C55E]">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Enforced (FIDO2)</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-[#8E8D94]">
                      <span className="text-[#FAF9F5]">{staff.status}</span>
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      {staff.systemRole !== 'Store Admin' && (
                        <button
                          onClick={() => revokeStaff(staff.id)}
                          className="text-[#8E8D94] hover:text-[#DC2626] p-1.5 transition-colors cursor-pointer"
                          title="Revoke Permissions"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Store-wide Immutable Audit Trail (Image 6 Bottom) */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#2D2D35] gap-4">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#C9A84C]" />
                Cryptographically Chained Audit Ledger
              </h2>
              <p className="text-xs text-[#8E8D94]">Append-only modification records with SHA-256 state hashes</p>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 bg-[#141417] px-2.5 py-1.5 border border-[#2D2D35] text-xs font-mono">
                <Filter className="w-3.5 h-3.5 text-[#8E8D94]" />
                <select
                  value={auditFilterType}
                  onChange={(e) => setAuditFilterType(e.target.value)}
                  className="bg-transparent text-[#FAF9F5] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Events</option>
                  <option value="approval">Approval</option>
                  <option value="security_alert">Security Alert</option>
                  <option value="config_update">Config Update</option>
                  <option value="inventory_adjustment">Inventory Adjustment</option>
                </select>
              </div>

              <button
                onClick={() => {
                  const csv = `Timestamp,Actor,Type,Title,Description,Badge\n` +
                    auditLogs.map((l) => `"${l.timestamp}","${l.actor}","${l.type}","${l.title}","${l.description}","${l.badgeText}"`).join('\n');
                  const blob = new Blob([csv], { type: 'text/csv' });
                  const url = URL.createObjectURL(blob);
                  const a = document.createElement('a');
                  a.href = url;
                  a.download = `blowmaggy-audit-ledger-${Date.now()}.csv`;
                  a.click();
                }}
                className="flex items-center gap-1.5 px-3 py-1.5 border border-[#2D2D35] bg-[#141417] text-xs font-mono text-[#8E8D94] hover:text-[#FAF9F5] transition-colors cursor-pointer"
              >
                <Download className="w-3.5 h-3.5 text-[#C9A84C]" />
                <span>Export CSV</span>
              </button>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141417] text-[#8E8D94] uppercase tracking-wider border-b border-[#2D2D35]">
                <tr>
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Operator</th>
                  <th className="py-2.5 px-3">Event Type</th>
                  <th className="py-2.5 px-3">Action Title</th>
                  <th className="py-2.5 px-3">Description</th>
                  <th className="py-2.5 px-3">Audit Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D35]">
                {filteredAuditLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-[#141417]/50 transition-colors">
                    <td className="py-2.5 px-3 text-[#8E8D94] whitespace-nowrap">
                      {log.timeAgo}
                    </td>
                    <td className="py-2.5 px-3 whitespace-nowrap">
                      <span className="text-[#FAF9F5] font-semibold">{log.actor}</span>
                    </td>
                    <td className="py-2.5 px-3">
                      <span className="text-[#C9A84C] uppercase text-[10px]">{log.type.replace('_', ' ')}</span>
                    </td>
                    <td className="py-2.5 px-3 text-[#FAF9F5]">
                      {log.title}
                    </td>
                    <td className="py-2.5 px-3 text-[#8E8D94] text-[11px] max-w-xs truncate">
                      {log.description}
                    </td>
                    <td className="py-2.5 px-3 text-[10px]">
                      <span
                        className={`px-2 py-0.5 border uppercase font-bold ${
                          log.badgeType === 'danger'
                            ? 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
                            : log.badgeType === 'success'
                            ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                            : 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30'
                        }`}
                      >
                        {log.badgeText}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Assign Manager Modal */}
      {isAssignModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1E] border border-[#2D2D35] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsAssignModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display-hero text-xl text-[#FAF9F5] mb-1">
              Assign Department Manager
            </h3>
            <p className="text-xs font-mono text-[#8E8D94] mb-4">
              Enforce scoped Level 2 RBAC. Managers can only modify inventory inside granted departments.
            </p>

            <form onSubmit={handleCreateManager} className="space-y-4 text-xs font-mono">
              <div>
                <label className="text-[#8E8D94] block uppercase mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Julian Vance"
                  value={newStaffName}
                  onChange={(e) => setNewStaffName(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="text-[#8E8D94] block uppercase mb-1">Corporate Email</label>
                <input
                  type="email"
                  required
                  placeholder="julian@blowmaggy.com"
                  value={newStaffEmail}
                  onChange={(e) => setNewStaffEmail(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                />
              </div>

              <div>
                <label className="text-[#8E8D94] block uppercase mb-2">
                  Granted Department Boundaries ({selectedDeptIds.length} selected)
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {departmentList.map((d) => {
                    const isSelected = selectedDeptIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleDeptSelection(d.id)}
                        className={`p-2 border text-left flex items-center justify-between transition-colors cursor-pointer ${
                          isSelected
                            ? 'border-[#C9A84C] bg-[#C9A84C]/10 text-[#FAF9F5]'
                            : 'border-[#2D2D35] bg-[#141417] text-[#8E8D94]'
                        }`}
                      >
                        <span className="truncate">{d.title}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-[#C9A84C] flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="pt-4 border-t border-[#2D2D35] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsAssignModalOpen(false)}
                  className="px-4 py-2 border border-[#2D2D35] text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] px-4 py-2 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Confirm & Provision
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
