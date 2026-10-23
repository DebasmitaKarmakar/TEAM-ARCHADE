import React, { useEffect, useState } from 'react';
import { LockKeyhole, ShieldCheck, X } from 'lucide-react';
import { DEMO_ACCOUNTS } from '../../config/demoAccounts';
import { useStore } from '../../context/StoreContext';

export const LoginModal: React.FC = () => {
  const { isLoginModalOpen, setLoginModalOpen, loginWithDemo } = useStore();
  const [email, setEmail] = useState(DEMO_ACCOUNTS[0].email);
  const [password, setPassword] = useState(DEMO_ACCOUNTS[0].password);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isLoginModalOpen) setError('');
  }, [isLoginModalOpen]);

  if (!isLoginModalOpen) return null;

  const chooseAccount = (account: (typeof DEMO_ACCOUNTS)[number]) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const result = loginWithDemo(email, password);
    if (!result.success) setError(result.message);
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-[#0E0E10]/90 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-labelledby="demo-login-title">
      <div className="w-full max-w-2xl border border-[#3E3E47] bg-[#1A1A1E] p-5 shadow-2xl sm:p-7">
        <div className="mb-6 flex items-start justify-between border-b border-[#2D2D35] pb-5">
          <div>
            <div className="mb-2 flex items-center gap-2 font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">
              <ShieldCheck className="h-4 w-4" /> BLOWMAGGY DEMO ACCESS
            </div>
            <h2 id="demo-login-title" className="font-display-hero text-2xl text-[#FAF9F5]">Choose a working perspective</h2>
            <p className="mt-1 text-xs text-[#8E8D94]">Local-only credentials for judging the shopper and operational workflows.</p>
          </div>
          <button id="close-demo-login" type="button" onClick={() => setLoginModalOpen(false)} aria-label="Close demo sign in" className="p-2 text-[#8E8D94] transition-colors hover:text-[#FAF9F5]">
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mb-6 grid gap-3 sm:grid-cols-3">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.id}
              id={`demo-account-${account.role}`}
              type="button"
              onClick={() => chooseAccount(account)}
              className={`border p-4 text-left transition-colors ${email === account.email ? 'border-[#C9A84C] bg-[#C9A84C]/10' : 'border-[#2D2D35] bg-[#141417] hover:border-[#3E3E47]'}`}
            >
              <span className="mb-3 flex h-10 w-10 items-center justify-center rounded-full border border-[#C9A84C]/40 bg-[#C9A84C]/10 font-mono text-xs font-bold text-[#C9A84C]">{account.initials}</span>
              <span className="block text-sm font-semibold text-[#FAF9F5]">{account.roleLabel}</span>
              <span className="mt-1 block text-[11px] leading-relaxed text-[#8E8D94]">{account.departmentScope}</span>
              <span className="mt-3 block font-mono text-[10px] text-[#C9A84C]">{account.email}</span>
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="grid gap-4 border-t border-[#2D2D35] pt-5 sm:grid-cols-[1fr_1fr_auto] sm:items-end">
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">
            Demo login ID
            <input id="demo-login-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} className="mt-1.5 w-full border border-[#2D2D35] bg-[#141417] px-3 py-2.5 text-xs text-[#FAF9F5] outline-none focus:border-[#C9A84C]" />
          </label>
          <label className="block text-[10px] font-mono uppercase tracking-wider text-[#8E8D94]">
            Demo password
            <input id="demo-login-password" type="password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-1.5 w-full border border-[#2D2D35] bg-[#141417] px-3 py-2.5 text-xs text-[#FAF9F5] outline-none focus:border-[#C9A84C]" />
          </label>
          <button id="demo-login-submit" type="submit" className="flex min-h-11 items-center justify-center gap-2 bg-[#C9A84C] px-5 py-2.5 font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E10] transition-colors hover:bg-[#d6b75e]">
            <LockKeyhole className="h-4 w-4" /> Sign in
          </button>
          {error && <p className="sm:col-span-3 text-xs text-[#F87171]" role="alert">{error}</p>}
        </form>
        <p className="mt-4 text-[10px] leading-relaxed text-[#8E8D94]">This proof-of-concept keeps credentials in frontend code only so judges can test every role. Production authentication requires server-side password hashing, sessions, rate limiting, CSRF protection, and audit logging.</p>
      </div>
    </div>
  );
};
