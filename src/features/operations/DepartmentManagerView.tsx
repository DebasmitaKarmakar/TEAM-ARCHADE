import React, { useState } from 'react';
import { useStore } from '../../context/StoreContext';
import { DEPARTMENTS } from '../../data/mockData';
import { DepartmentId } from '../../types/store';
import {
  Lock,
  Layers,
  CheckCircle,
  Sliders,
  X,
  Search,
  KeyRound,
  ShieldAlert,
  Send,
} from 'lucide-react';

export const DepartmentManagerView: React.FC = () => {
  const { inventory, adjustStock, showToastNotification, currentUser, products } = useStore();

  const assignedDepts: DepartmentId[] = currentUser?.assignedDeptIds || [];
  const managerName = currentUser?.name || 'Department Manager';
  const managerInitials = currentUser?.initials || 'DM';
  const scopeLabel = assignedDepts.map((id) => DEPARTMENTS[id]?.title || id).join(' & ');
  const [selectedFilterDept, setSelectedFilterDept] = useState<'all' | DepartmentId>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Stock Adjustment Modal state
  const [adjustingProduct, setAdjustingProduct] = useState<{
    sku: string;
    title: string;
    currentStock: number;
    department: string;
  } | null>(null);
  const [deltaCount, setDeltaCount] = useState<number>(10);
  const [adjustReason, setAdjustReason] = useState<string>('Receiving Inbound Shipment (Dock 4)');

  // Boundary Escalation state
  const [isEscalateModalOpen, setIsEscalateModalOpen] = useState(false);
  const [escalateDept, setEscalateDept] = useState<string>('Fashion');
  const [escalateReason, setEscalateReason] = useState('');
  const [escalateSuccess, setEscalateSuccess] = useState(false);

  // Scoped Products
  const scopedProducts = products.filter((p) => assignedDepts.includes(p.department));

  const displayedProducts = scopedProducts.filter((p) => {
    if (selectedFilterDept !== 'all' && p.department !== selectedFilterDept) return false;
    if (
      searchQuery &&
      !p.name.toLowerCase().includes(searchQuery.toLowerCase()) &&
      !p.sku.toLowerCase().includes(searchQuery.toLowerCase())
    ) {
      return false;
    }
    return true;
  });

  const handleOpenAdjust = (prod: typeof scopedProducts[0]) => {
    const current = inventory[prod.sku]?.stock ?? prod.stockCount;
    setAdjustingProduct({
      sku: prod.sku,
      title: prod.name,
      currentStock: current,
      department: prod.department,
    });
    setDeltaCount(10);
  };

  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustingProduct) return;

    adjustStock(
      adjustingProduct.sku,
      adjustingProduct.title,
      deltaCount,
      adjustReason,
      adjustingProduct.department
    );

    setAdjustingProduct(null);
  };

  const handleSendEscalation = (e: React.FormEvent) => {
    e.preventDefault();
    setEscalateSuccess(true);
    showToastNotification(
      'Escalation Request Filed',
      `COO Sophia Sterling has been notified for scoped access to ${escalateDept}.`
    );
    setTimeout(() => {
      setEscalateSuccess(false);
      setIsEscalateModalOpen(false);
      setEscalateReason('');
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-[#0E0E10] text-[#E8E8E8] py-8 sm:py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        {/* Manager Banner (Image 2) */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6 sm:p-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-6 border-b border-[#2D2D35]">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-none bg-[#3B82F6]/10 border-2 border-[#3B82F6] flex items-center justify-center font-display-hero text-2xl text-[#3B82F6]">
                {managerInitials}
              </div>
              <div>
                <div className="flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-[#3B82F6] mb-1">
                  <span>DEPARTMENT MANAGER COCKPIT</span>
                  <span>•</span>
                  <span className="text-[#22C55E]">LEVEL 2 RBAC TOKEN VALID</span>
                </div>
                <h1 className="font-display-hero text-2xl sm:text-3xl text-[#FAF9F5]">
                  {managerName} — Department Manager
                </h1>
                <p className="text-xs font-mono text-[#8E8D94] mt-0.5">
                  Scoped Authority: <strong className="text-[#FAF9F5]">{scopeLabel || 'No departments assigned'}</strong> · Write Permissions Confined
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono text-[#8E8D94] bg-[#141417] px-3 py-1.5 border border-[#2D2D35] flex items-center gap-1.5">
                <KeyRound className="w-3.5 h-3.5 text-[#C9A84C]" />
                JWT Scopes: <code className="text-[#C9A84C]">dept:electronics:write</code>, <code className="text-[#C9A84C]">dept:beauty:write</code>
              </span>
            </div>
          </div>

          {/* Scoped KPI Bento */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="text-[#8E8D94] text-xs font-mono mb-1">Electronics In-Stock SLA</div>
              <div className="font-mono text-2xl font-bold text-[#22C55E]">98.6%</div>
              <div className="text-[10px] font-mono text-[#8E8D94] mt-1">48 SKUs tracked at Bay 4A</div>
            </div>

            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="text-[#8E8D94] text-xs font-mono mb-1">Beauty Safety Stock Buffer</div>
              <div className="font-mono text-2xl font-bold text-[#FAF9F5]">12.4% Avg</div>
              <div className="text-[10px] font-mono text-[#22C55E] mt-1">+2.1% above minimum threshold</div>
            </div>

            <div className="bg-[#141417] p-4 border border-[#2D2D35]">
              <div className="text-[#8E8D94] text-xs font-mono mb-1">Consolidated Multi-Dept Orders</div>
              <div className="font-mono text-2xl font-bold text-[#C9A84C]">1,420 Active</div>
              <div className="text-[10px] font-mono text-[#8E8D94] mt-1">Single-box cross-dock staged</div>
            </div>
          </div>
        </div>

        {/* Scoped SKU Directory Table (Image 2) */}
        <div className="bg-[#1A1A1E] border border-[#2D2D35] p-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 mb-4 border-b border-[#2D2D35] gap-4">
            <div>
              <h2 className="font-mono text-sm uppercase tracking-wider text-[#FAF9F5] font-semibold flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#3B82F6]" />
                Assigned Department SKU Directory ({scopedProducts.length} Items)
              </h2>
              <p className="text-xs text-[#8E8D94]">Live inventory balances, safety buffers, and delta adjustments</p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter */}
              <div className="flex items-center gap-2 bg-[#141417] px-2.5 py-1.5 border border-[#2D2D35] text-xs font-mono">
                <span className="text-[#8E8D94]">Dept:</span>
                <select
                  value={selectedFilterDept}
                  onChange={(e) => setSelectedFilterDept(e.target.value as any)}
                  className="bg-transparent text-[#FAF9F5] focus:outline-none cursor-pointer"
                >
                  <option value="all">All Assigned Departments</option>
                  {assignedDepts.map((departmentId) => (
                    <option key={departmentId} value={departmentId}>{DEPARTMENTS[departmentId]?.title || departmentId}</option>
                  ))}
                </select>
              </div>

              {/* Search */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2.5 text-[#8E8D94]" />
                <input
                  type="text"
                  placeholder="Filter SKU or Title..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#141417] border border-[#2D2D35] pl-8 pr-3 py-1.5 text-xs font-mono text-[#FAF9F5] focus:outline-none focus:border-[#3B82F6] placeholder-[#8E8D94]/50"
                />
              </div>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead className="bg-[#141417] text-[#8E8D94] uppercase tracking-wider border-b border-[#2D2D35]">
                <tr>
                  <th className="py-3 px-4">SKU Code</th>
                  <th className="py-3 px-4">Product Name & Department</th>
                  <th className="py-3 px-4">Available Stock</th>
                  <th className="py-3 px-4">Safety Buffer</th>
                  <th className="py-3 px-4">Health Status</th>
                  <th className="py-3 px-4 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D35]">
                {displayedProducts.map((p) => {
                  const inv = inventory[p.sku] || {
                    stock: p.stockCount,
                    buffer: p.safetyBuffer,
                    status: p.stockStatus,
                  };
                  const dept = DEPARTMENTS[p.department];

                  return (
                    <tr key={p.id} className="hover:bg-[#141417]/50 transition-colors">
                      <td className="py-3.5 px-4 font-bold text-[#FAF9F5]">
                        {p.sku}
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <img src={p.images.front} alt="" className="w-8 h-8 object-cover border border-[#2D2D35]" />
                          <div>
                            <div className="font-sans font-medium text-[#FAF9F5]">{p.name}</div>
                            <span
                              className="text-[9px] uppercase px-1.5 py-0.2 border"
                              style={{
                                borderColor: `${dept?.colorAccent || '#3B82F6'}40`,
                                color: dept?.colorAccent || '#3B82F6',
                              }}
                            >
                              {dept?.title || p.deptLabel || p.department}
                            </span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-base text-[#FAF9F5]">
                        {inv.stock} <span className="text-[10px] text-[#8E8D94] font-normal">units</span>
                      </td>
                      <td className="py-3.5 px-4 text-[#8E8D94]">
                        {inv.buffer} units threshold
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`px-2 py-0.5 text-[10px] uppercase font-bold border ${
                            inv.status === 'optimal'
                              ? 'bg-[#22C55E]/10 text-[#22C55E] border-[#22C55E]/30'
                              : inv.status === 'low_warning'
                              ? 'bg-[#C9A84C]/10 text-[#C9A84C] border-[#C9A84C]/30'
                              : 'bg-[#DC2626]/10 text-[#DC2626] border-[#DC2626]/30'
                          }`}
                        >
                          {inv.status.replace('_', ' ')}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={() => handleOpenAdjust(p)}
                          className="inline-flex items-center gap-1.5 bg-[#2D2D35] hover:bg-[#3E3E47] text-[#FAF9F5] px-3 py-1.5 border border-[#3E3E47] transition-colors cursor-pointer"
                        >
                          <Sliders className="w-3.5 h-3.5 text-[#C9A84C]" />
                          <span>Adjust Stock</span>
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

        {/* Locked RBAC Boundary Section (Image 2) */}
        <div className="bg-[#141417] border border-[#DC2626]/40 p-6 sm:p-8 relative">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 bg-[#DC2626]/10 border border-[#DC2626]/40 text-[#DC2626] flex-shrink-0">
                <ShieldAlert className="w-8 h-8" />
              </div>
              <div>
                <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#DC2626] font-bold">
                  <Lock className="w-3.5 h-3.5" />
                  <span>Enforced Boundary — Restricted Departments</span>
                </div>
                <h3 className="font-display-hero text-xl text-[#FAF9F5] mt-1">
                  Fashion, Grocery, Home & Living, Kids & Toys
                </h3>
                <p className="text-xs text-[#8E8D94] mt-2 max-w-2xl leading-relaxed font-sans">
                  {managerName}’s Level 2 token is scoped exclusively to {scopeLabel || 'assigned departments'}. Any attempt to mutate
                  SKUs or stock levels in outside departments is blocked both in this client UI and rejected with
                  HTTP 403 Forbidden by the server RBAC middleware.
                </p>

                {/* Locked department indicators */}
                <div className="flex flex-wrap gap-2 mt-4">
                  {(['fashion', 'grocery', 'home', 'kids'] as DepartmentId[]).map((dId) => {
                    const d = DEPARTMENTS[dId];
                    return (
                      <div
                        key={dId}
                        className="flex items-center gap-2 bg-[#0E0E10] px-3 py-1.5 border border-[#2D2D35] text-xs font-mono text-[#8E8D94]"
                      >
                        <Lock className="w-3 h-3 text-[#DC2626]" />
                        <span>{d?.title || dId}</span>
                        <span className="text-[10px] text-[#DC2626]">[Access Denied]</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsEscalateModalOpen(true)}
              className="px-4 py-2.5 bg-[#2D2D35] hover:bg-[#3E3E47] text-[#FAF9F5] border border-[#3E3E47] font-mono text-xs uppercase tracking-wider flex items-center gap-2 flex-shrink-0 cursor-pointer"
            >
              <KeyRound className="w-4 h-4 text-[#C9A84C]" />
              <span>Request Escalation</span>
            </button>
          </div>
        </div>
      </div>

      {/* Adjust Stock Modal */}
      {adjustingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1E] border border-[#2D2D35] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setAdjustingProduct(null)}
              className="absolute top-4 right-4 text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 text-xs font-mono uppercase text-[#3B82F6] mb-1">
              <Sliders className="w-3.5 h-3.5" />
              <span>Inventory Modification Protocol</span>
            </div>
            <h3 className="font-display-hero text-xl text-[#FAF9F5] mb-1">
              Adjust Stock: {adjustingProduct.sku}
            </h3>
            <p className="text-xs text-[#8E8D94] mb-4 font-sans">{adjustingProduct.title}</p>

            <form onSubmit={handleConfirmAdjust} className="space-y-4 text-xs font-mono">
              <div className="bg-[#141417] p-3 border border-[#2D2D35] flex justify-between items-center">
                <span className="text-[#8E8D94]">Current Stock Count:</span>
                <span className="text-[#FAF9F5] font-bold text-base">{adjustingProduct.currentStock} units</span>
              </div>

              <div>
                <label className="text-[#8E8D94] block uppercase mb-1">Stock Adjustment Quantity</label>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setDeltaCount((d) => d - 5)}
                    className="px-3 py-2 bg-[#2D2D35] text-[#FAF9F5] hover:bg-[#3E3E47] cursor-pointer"
                  >
                    -5
                  </button>
                  <input
                    type="number"
                    value={deltaCount}
                    onChange={(e) => setDeltaCount(parseInt(e.target.value) || 0)}
                    className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-center text-base font-bold text-[#FAF9F5] focus:outline-none focus:border-[#3B82F6]"
                  />
                  <button
                    type="button"
                    onClick={() => setDeltaCount((d) => d + 5)}
                    className="px-3 py-2 bg-[#2D2D35] text-[#FAF9F5] hover:bg-[#3E3E47] cursor-pointer"
                  >
                    +5
                  </button>
                </div>
                <div className="text-[11px] text-[#22C55E] mt-1 text-center">
                  New Resulting Stock: <strong>{adjustingProduct.currentStock + deltaCount} units</strong>
                </div>
              </div>

              <div>
                <label className="text-[#8E8D94] block uppercase mb-1">
                  Mandatory Audit Reason Code *
                </label>
                <select
                  value={adjustReason}
                  onChange={(e) => setAdjustReason(e.target.value)}
                  className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#3B82F6]"
                >
                  <option value="Receiving Inbound Shipment (Dock 4)">Receiving Inbound Shipment (Dock 4)</option>
                  <option value="Physical Cycle Count Correction">Physical Cycle Count Correction</option>
                  <option value="Promotional Allocation Release">Promotional Allocation Release</option>
                  <option value="Damaged Stock Quarantine">Damaged Stock Quarantine</option>
                  <option value="Direct Supplier Cross-Dock Arrival">Direct Supplier Cross-Dock Arrival</option>
                </select>
              </div>

              <div className="pt-4 border-t border-[#2D2D35] flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustingProduct(null)}
                  className="px-4 py-2 border border-[#2D2D35] text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-[#3B82F6] hover:bg-[#2563EB] text-[#FAF9F5] px-4 py-2 font-bold uppercase tracking-wider cursor-pointer"
                >
                  Commit & Log Audit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalation Request Modal */}
      {isEscalateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#1A1A1E] border border-[#2D2D35] max-w-md w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsEscalateModalOpen(false)}
              className="absolute top-4 right-4 text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <h3 className="font-display-hero text-xl text-[#FAF9F5] mb-1">
              Request RBAC Scope Escalation
            </h3>
            <p className="text-xs font-mono text-[#8E8D94] mb-4">
              Requests require dual-authorization by COO Sophia Sterling.
            </p>

            {escalateSuccess ? (
              <div className="p-4 bg-[#22C55E]/10 border border-[#22C55E]/30 text-[#22C55E] text-xs font-mono flex items-center gap-2">
                <CheckCircle className="w-5 h-5" />
                <span>Escalation dispatched to Sophia Sterling.</span>
              </div>
            ) : (
              <form onSubmit={handleSendEscalation} className="space-y-4 text-xs font-mono">
                <div>
                  <label className="text-[#8E8D94] block uppercase mb-1">Target Department</label>
                  <select
                    value={escalateDept}
                    onChange={(e) => setEscalateDept(e.target.value)}
                    className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                  >
                    <option value="Fashion">Fashion (Apparel & Outerwear)</option>
                    <option value="Grocery">Grocery (Artisanal Pantry)</option>
                    <option value="Home & Living">Home & Living (Culinary & Decor)</option>
                    <option value="Kids & Toys">Kids & Toys (Montessori)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[#8E8D94] block uppercase mb-1">Business Justification *</label>
                  <textarea
                    required
                    rows={3}
                    placeholder="e.g. Covering for maternity leave in Fashion wing, handling winter jacket restocking."
                    value={escalateReason}
                    onChange={(e) => setEscalateReason(e.target.value)}
                    className="w-full bg-[#141417] border border-[#2D2D35] px-3 py-2 text-[#FAF9F5] focus:outline-none focus:border-[#C9A84C]"
                  />
                </div>

                <div className="pt-4 border-t border-[#2D2D35] flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsEscalateModalOpen(false)}
                    className="px-4 py-2 border border-[#2D2D35] text-[#8E8D94] hover:text-[#FAF9F5] cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="bg-[#C9A84C] hover:bg-[#d6b75e] text-[#0E0E10] px-4 py-2 font-bold uppercase tracking-wider flex items-center gap-1.5 cursor-pointer"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Submit Request</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
