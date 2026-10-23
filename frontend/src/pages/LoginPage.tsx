import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';
import { Link } from 'react-router-dom';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await login(email, password);
      toast.success('Welcome back!');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Invalid credentials');
    }
  };

  const demoAccounts = [
    { label: 'Shopper', email: 'shopper@blowmaggy.demo' },
    { label: 'Maggy+ Member', email: 'plus@blowmaggy.demo' },
    { label: 'Admin', email: 'admin@blowmaggy.demo' },
    { label: 'Electronics Mgr', email: 'electronics.mgr@blowmaggy.demo' },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0C0D10' }}>
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '32px', fontWeight: 700, color: '#fff', letterSpacing: '-0.02em' }}>
            BLOW<span style={{ color: '#ba012d' }}>MAGGY</span>
          </h1>
          <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", marginTop: '8px' }}>Sign in to your account</p>
        </div>

        {/* Card */}
        <div className="p-8 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="font-label-sm uppercase tracking-wider block mb-1.5" style={{ color: '#c5c7c9', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px' }}>
                Email
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} required
                className="w-full px-4 py-3 rounded outline-none transition-all"
                style={{ background: '#111317', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '15px' }}
                placeholder="you@example.com"
                onFocus={e => (e.target.style.borderColor = '#fff')}
                onBlur={e => (e.target.style.borderColor = '#232631')}
              />
            </div>
            <div>
              <label className="font-label-sm uppercase tracking-wider block mb-1.5" style={{ color: '#c5c7c9', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px' }}>
                Password
              </label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} required
                className="w-full px-4 py-3 rounded outline-none transition-all"
                style={{ background: '#111317', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '15px' }}
                placeholder="••••••••"
                onFocus={e => (e.target.style.borderColor = '#fff')}
                onBlur={e => (e.target.style.borderColor = '#232631')}
              />
            </div>
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded font-label transition-all"
              style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 pt-6" style={{ borderTop: '1px solid #232631' }}>
            <p className="font-badge uppercase tracking-wider text-center mb-3" style={{ color: '#636466', fontSize: '10px' }}>Demo Accounts (password: Demo@123)</p>
            <div className="grid grid-cols-2 gap-2">
              {demoAccounts.map(acc => (
                <button key={acc.email}
                  onClick={() => { setEmail(acc.email); setPassword('Demo@123'); }}
                  className="px-3 py-2 rounded text-left transition-colors"
                  style={{ background: '#1f1f23', border: '1px solid #232631', color: '#c5c7c9', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px' }}
                  onMouseEnter={e => (e.currentTarget.style.borderColor = '#ba012d')}
                  onMouseLeave={e => (e.currentTarget.style.borderColor = '#232631')}>
                  {acc.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <p className="text-center mt-4" style={{ color: '#636466', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '14px' }}>
          New here?{' '}
          <Link to="/register" style={{ color: '#e3e2e6' }}>Create an account</Link>
        </p>
      </div>
    </div>
  );
}
