import { Link, useNavigate } from 'react-router-dom';
import { ShoppingBag, Heart, Search, User, ChevronDown } from 'lucide-react';
import { useState } from 'react';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

const DEPARTMENTS = [
  { slug: 'fashion',     label: 'Fashion',      accent: '#E02B43' },
  { slug: 'beauty',      label: 'Beauty',        accent: '#FF3E83' },
  { slug: 'electronics', label: 'Electronics',   accent: '#00F0FF' },
  { slug: 'home',        label: 'Home & Living', accent: '#F59E0B' },
  { slug: 'grocery',     label: 'Grocery',       accent: '#10B981' },
  { slug: 'kids',        label: 'Kids & Toys',   accent: '#8B5CF6' },
];

const fmt = (paise: number) => '₹' + (paise / 100).toLocaleString('en-IN', { maximumFractionDigits: 0 });

export default function Header() {
  const [q, setQ] = useState('');
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { toggleCart, itemCount, total } = useCartStore();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (q.trim()) navigate(`/search?q=${encodeURIComponent(q.trim())}`);
  };

  return (
    <header
      className="fixed top-0 w-full z-50"
      style={{
        background: 'linear-gradient(135deg, rgba(20,14,40,0.97) 0%, rgba(10,17,40,0.97) 100%)',
        borderBottom: '1px solid rgba(147,197,253,0.12)',
        boxShadow: '0 4px 24px -4px rgba(99,102,241,0.15)',
        backdropFilter: 'blur(20px)',
      }}
    >
      {/* Announcement bar */}
      <div
        className="w-full py-1 px-4 flex items-center justify-center gap-2"
        style={{ background: 'rgba(15,12,28,0.85)', borderBottom: '1px solid rgba(168,85,247,0.12)' }}
      >
        <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#ba012d' }} />
        <span className="font-badge uppercase tracking-widest" style={{ color: '#c5c7c9', fontSize: '10px' }}>
          Free delivery on orders ₹999+ • Use code MAGGY10 for 10% off your first order
        </span>
        <span className="w-1.5 h-1.5 rounded-full pulse-glow" style={{ background: '#ba012d' }} />
      </div>

      {/* Main nav row */}
      <div className="flex items-center justify-between px-4 md:px-6 lg:px-12" style={{ height: '64px' }}>
        {/* Logo */}
        <Link to="/" className="flex items-center gap-3 shrink-0">
          <div className="flex flex-col">
            <span
              className="font-bodoni font-bold tracking-tight"
              style={{ fontFamily: "'Bodoni Moda', serif", fontSize: '22px', letterSpacing: '-0.02em', color: '#fff' }}
            >
              BLOW<span style={{ color: '#ba012d' }}>MAGGY</span>
            </span>
            <span className="font-badge uppercase tracking-widest hidden xl:block" style={{ color: '#636466', fontSize: '9px' }}>
              Unified Department Store
            </span>
          </div>
        </Link>

        {/* Search */}
        <form
          onSubmit={handleSearch}
          className="flex-1 max-w-2xl hidden md:flex items-center mx-6 rounded-lg overflow-hidden"
          style={{ background: '#1f1f23', border: '1px solid #232631' }}
        >
          <select
            className="bg-transparent border-r px-3 py-2 text-xs font-label-sm outline-none cursor-pointer"
            style={{ borderColor: '#232631', color: '#c5c7c9', minWidth: '120px' }}
          >
            <option>All Depts</option>
            {DEPARTMENTS.map((d) => <option key={d.slug} value={d.slug}>{d.label}</option>)}
          </select>
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search fashion, gadgets, groceries..."
            className="flex-1 px-3 py-2 bg-transparent text-sm outline-none placeholder:text-outline"
            style={{ color: '#e3e2e6', fontFamily: "'Hanken Grotesk', sans-serif" }}
          />
          <button
            type="submit"
            className="px-4 py-2 flex items-center transition-colors"
            style={{ color: '#8f9194' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8f9194')}
          >
            <Search size={16} />
          </button>
        </form>

        {/* Right actions */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Role pill */}
          {user && (
            <div
              className="hidden sm:flex items-center gap-1 px-3 py-1 rounded-full font-badge uppercase cursor-pointer transition-colors"
              style={{ background: '#1f1f23', border: '1px solid #232631', color: '#c5c7c9', fontSize: '10px' }}
            >
              <span className="w-2 h-2 rounded-full" style={{ background: '#00dbe9' }} />
              <span>{user.role === 'SHOPPER' ? 'Shopper' : user.role === 'ADMIN' ? 'Admin' : 'Manager'}</span>
              <ChevronDown size={10} />
            </div>
          )}

          {/* Wishlist */}
          <button
            className="relative p-2 transition-colors"
            style={{ color: '#8f9194' }}
            onMouseEnter={(e) => (e.currentTarget.style.color = '#e3e2e6')}
            onMouseLeave={(e) => (e.currentTarget.style.color = '#8f9194')}
          >
            <Heart size={20} />
          </button>

          {/* Cart */}
          <button
            onClick={toggleCart}
            className="flex items-center gap-2 px-4 py-2 rounded font-label transition-all"
            style={{
              background: '#ffffff',
              color: '#0C0D10',
              fontFamily: "'Space Grotesk', sans-serif",
              fontSize: '13px',
              fontWeight: 600,
            }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ba012d') && (e.currentTarget.style.color = '#fff')}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; e.currentTarget.style.color = '#0C0D10'; }}
          >
            <ShoppingBag size={16} />
            <span className="hidden sm:inline">
              {itemCount() > 0 ? `${itemCount()} • ${fmt(total)}` : 'Bag'}
            </span>
            <span className="sm:hidden">{itemCount()}</span>
          </button>

          {/* Auth */}
          {user ? (
            <button
              onClick={() => logout()}
              className="p-2 rounded-full transition-colors"
              style={{ background: '#1f1f23' }}
              title={user.name}
            >
              <User size={18} style={{ color: '#e3e2e6' }} />
            </button>
          ) : (
            <Link
              to="/login"
              className="px-4 py-2 rounded font-label-sm uppercase tracking-wider transition-colors"
              style={{
                background: 'transparent',
                border: '1px solid #232631',
                color: '#e3e2e6',
                fontSize: '11px',
              }}
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Department nav */}
      <div
        className="flex items-center gap-1 overflow-x-auto px-4 md:px-6 lg:px-12 py-1"
        style={{ background: 'rgba(18,16,36,0.85)', borderTop: '1px solid rgba(147,197,253,0.06)' }}
      >
        <Link
          to="/"
          className="shrink-0 px-3 py-1.5 rounded font-badge uppercase tracking-wider text-xs transition-colors"
          style={{ color: '#e3e2e6', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          All
        </Link>
        {DEPARTMENTS.map((d) => (
          <Link
            key={d.slug}
            to={`/departments/${d.slug}`}
            className="shrink-0 px-3 py-1.5 rounded font-badge uppercase tracking-wider text-xs transition-all"
            style={{ color: '#8f9194', fontFamily: "'Space Grotesk', sans-serif" }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#e3e2e6'; e.currentTarget.style.background = '#1f1f23'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#8f9194'; e.currentTarget.style.background = 'transparent'; }}
          >
            {d.label}
          </Link>
        ))}
        <Link
          to="/search?sort=discount"
          className="shrink-0 px-3 py-1.5 rounded font-badge uppercase tracking-wider text-xs transition-colors"
          style={{ color: '#ba012d', fontFamily: "'Space Grotesk', sans-serif" }}
        >
          Today's Deals
        </Link>
      </div>
    </header>
  );
}
