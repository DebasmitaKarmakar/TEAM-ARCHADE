import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import toast from 'react-hot-toast';

export default function RegisterPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { register, isLoading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      toast.success('Account created! Welcome to Blowmaggy.');
      navigate('/');
    } catch (err: any) {
      toast.error(err?.response?.data?.error?.message ?? 'Registration failed');
    }
  };

  const input = (label: string, type: string, value: string, onChange: (v: string) => void, placeholder: string) => (
    <div>
      <label className="block mb-1.5" style={{ color: '#c5c7c9', fontFamily: "'Space Grotesk',sans-serif", fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
        {label}
      </label>
      <input type={type} value={value} onChange={e => onChange(e.target.value)} required
        placeholder={placeholder}
        className="w-full px-4 py-3 rounded outline-none transition-all"
        style={{ background: '#111317', border: '1px solid #232631', color: '#e3e2e6', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '15px' }}
        onFocus={e => (e.target.style.borderColor = '#fff')}
        onBlur={e => (e.target.style.borderColor = '#232631')}
      />
    </div>
  );

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ background: '#0C0D10' }}>
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 style={{ fontFamily: "'Bodoni Moda',serif", fontSize: '32px', fontWeight: 700, color: '#fff' }}>
            BLOW<span style={{ color: '#ba012d' }}>MAGGY</span>
          </h1>
          <p style={{ color: '#8e929e', fontFamily: "'Hanken Grotesk',sans-serif", marginTop: '8px' }}>Create your account</p>
        </div>
        <div className="p-8 rounded-xl" style={{ background: '#15171D', border: '1px solid #232631' }}>
          <form onSubmit={handleSubmit} className="space-y-4">
            {input('Full Name', 'text', name, setName, 'Ananya Das')}
            {input('Email', 'email', email, setEmail, 'you@example.com')}
            {input('Password', 'password', password, setPassword, '8+ characters')}
            <button type="submit" disabled={isLoading}
              className="w-full py-3 rounded font-label transition-all"
              style={{ background: '#fff', color: '#0C0D10', fontFamily: "'Space Grotesk',sans-serif", fontSize: '14px', fontWeight: 600, opacity: isLoading ? 0.7 : 1 }}>
              {isLoading ? 'Creating...' : 'Create Account'}
            </button>
          </form>
        </div>
        <p className="text-center mt-4" style={{ color: '#636466', fontFamily: "'Hanken Grotesk',sans-serif", fontSize: '14px' }}>
          Already have an account? <Link to="/login" style={{ color: '#e3e2e6' }}>Sign in</Link>
        </p>
      </div>
    </div>
  );
}
