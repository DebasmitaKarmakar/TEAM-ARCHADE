import { Link } from 'react-router-dom';
import { BarChart3, Package, Users, Tag, ShoppingBag, TrendingUp } from 'lucide-react';

export default function AdminDashboard() {
  const cards = [
    { label: 'Total Orders', value: '—', icon: ShoppingBag, color: '#E02B43' },
    { label: 'Revenue', value: '—', icon: TrendingUp, color: '#10B981' },
    { label: 'Products', value: '—', icon: Package, color: '#00F0FF' },
    { label: 'Users', value: '—', icon: Users, color: '#8B5CF6' },
    { label: 'Coupons', value: '—', icon: Tag, color: '#F59E0B' },
    { label: 'Analytics', value: '—', icon: BarChart3, color: '#FF3E83' },
  ];

  return (
    <div className="px-4 md:px-6 lg:px-12 py-10 max-w-7xl mx-auto" style={{ background: '#0C0D10', minHeight: '100vh' }}>
      <div className="flex items-center justify-between mb-8">
        <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '36px', fontWeight: 600, color: '#e3e2e6' }}>Admin Console</h1>
        <span className="px-3 py-1.5 rounded font-badge uppercase" style={{ background: 'rgba(224,43,67,0.15)', color: '#E02B43', border: '1px solid rgba(224,43,67,0.3)', fontSize: '10px' }}>
          ADMIN
        </span>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
        {cards.map(c => (
          <div key={c.label} className="p-5 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
            <div className="flex items-center justify-between mb-3">
              <c.icon size={20} style={{ color: c.color }} />
              <span className="font-badge uppercase" style={{ color: '#636466', fontSize: '9px' }}>LIVE</span>
            </div>
            <p style={{ fontFamily: "'Space Grotesk',sans-serif", fontSize: '28px', fontWeight: 700, color: '#fff' }}>{c.value}</p>
            <p className="font-badge uppercase tracking-wider" style={{ color: '#636466', fontSize: '10px' }}>{c.label}</p>
          </div>
        ))}
      </div>
      <div className="p-6 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
        <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif" }}>
          Admin dashboard — connects to <code style={{ color: '#00F0FF' }}>/api/v1/admin/*</code> endpoints.<br />
          Requires <strong style={{ color: '#c5c7c9' }}>ADMIN</strong> role JWT.
        </p>
        <div className="flex gap-3 mt-4">
          <Link to="/admin/dept" className="px-4 py-2 rounded font-label-sm"
            style={{ background: '#1f1f23', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Space Grotesk',sans-serif", fontSize: '12px' }}>
            Department Manager
          </Link>
        </div>
      </div>
    </div>
  );
}
