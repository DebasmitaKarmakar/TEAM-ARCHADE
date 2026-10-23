import React from 'react';
import { LockKeyhole } from 'lucide-react';
import { UserRole } from '../../types/store';
import { useStore } from '../../context/StoreContext';

interface RoleGateProps {
  allow: UserRole[];
  children: React.ReactNode;
}

export const RoleGate: React.FC<RoleGateProps> = ({ allow, children }) => {
  const { currentRole, currentUser, setLoginModalOpen, setActiveView } = useStore();

  if (currentUser && allow.includes(currentRole)) return <>{children}</>;

  return (
    <section className="flex min-h-[60vh] items-center justify-center bg-[#0E0E10] px-4 text-center text-[#E8E8E8]">
      <div className="max-w-lg border border-[#2D2D35] bg-[#1A1A1E] p-8">
        <LockKeyhole className="mx-auto mb-4 h-9 w-9 text-[#C9A84C]" />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#C9A84C]">Role-protected demo workspace</p>
        <h1 className="mt-2 font-display-hero text-3xl text-[#FAF9F5]">This cockpit needs permission.</h1>
        <p className="mt-3 text-sm leading-relaxed text-[#8E8D94]">Sign in with an approved demo account to access this operational view. The storefront remains available to every visitor.</p>
        <div className="mt-6 flex justify-center gap-3">
          <button id="role-gate-login" type="button" onClick={() => setLoginModalOpen(true)} className="min-h-11 bg-[#C9A84C] px-5 font-mono text-xs font-bold uppercase tracking-wider text-[#0E0E10] hover:bg-[#d6b75e]">View demo accounts</button>
          <button id="role-gate-storefront" type="button" onClick={() => setActiveView('home')} className="min-h-11 border border-[#3E3E47] px-5 font-mono text-xs uppercase tracking-wider text-[#FAF9F5] hover:border-[#C9A84C]">Go to storefront</button>
        </div>
      </div>
    </section>
  );
};
