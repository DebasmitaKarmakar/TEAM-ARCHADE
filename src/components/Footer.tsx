import React, { useState } from 'react';
import { useStore } from '../context/StoreContext';
import { DepartmentId } from '../types/store';

export const Footer: React.FC = () => {
  const { setActiveView, navigateToDept, showToastNotification } = useStore();
  const [email, setEmail] = useState('');

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    showToastNotification('VIP Access Enrolled', `Executive concierge dispatch linked to ${email}`);
    setEmail('');
  };

  return (
    <footer
      className="w-full bg-[#0d0e11] text-[#c5c7c9] mt-16 pt-16 pb-12 border-t border-[#343538]"
      style={{
        background: 'linear-gradient(115deg, #263c91 0%, #6e4ebd 55%, #d9ae36 125%)',
        borderTop: '1px solid rgba(196, 181, 253, 0.15)',
      }}
    >
      <div className="w-full px-4 sm:px-8 lg:px-12 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 pb-12">
          {/* Brand & Newsletter Column (2 cols on lg) */}
          <div className="lg:col-span-2 space-y-4">
            <img
              alt="Blowmaggy Wordmark Logo"
              className="h-7 w-auto object-contain cursor-pointer"
              onClick={() => setActiveView('home')}
              src="https://lh3.googleusercontent.com/aida/AEtjO1UADMaEayZO_xcBmngPCX5LyZIt1G7x-oeCDUy_llM1iaH6jRZm3BMMwm3VnKS1TkhaYmsBSQeZ_NUoOybgtE03a2lg4tfy5JRmbY4c4OhZrV0knNSP2thrgqySDOhhvzdAPufi4tRWt0iwK2Vv2M2kcHXPCcDbc2dP2jSYt6ZcbrXSOBv67_NLwf9JHS75rjCx7Y7Kl35I9M-QM_30yBAJw1EBw-UfBi1BmJZehBlJD85k5iDJ5WH7u6Ly"
            />
            <p className="font-['Hanken_Grotesk'] text-[14px] text-[#c5c7c9] max-w-md leading-relaxed">
              Every department. One cart. One checkout. The luxury multi-category digital department store built for frictionless unified curation.
            </p>
            <div className="space-y-2 pt-2">
              <p className="font-['Space_Grotesk'] text-[12px] uppercase tracking-wider text-white font-semibold">
                Executive Newsletter Subscription
              </p>
              <form onSubmit={handleNewsletterSubmit} className="flex max-w-sm">
                <input
                  className="bg-[#1f1f23] px-3 py-2 text-white font-['Hanken_Grotesk'] text-[13px] rounded-l border border-[#343538] focus:outline-none focus:border-white flex-1"
                  placeholder="Enter your executive email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
                <button
                  type="submit"
                  className="bg-white text-[#121316] font-['Space_Grotesk'] text-[12px] font-bold px-4 py-2 rounded-r hover:bg-[#e2e2e4] transition-colors"
                >
                  Join
                </button>
              </form>
            </div>
          </div>

          {/* Customer Service */}
          <div>
            <h4 className="font-['Space_Grotesk'] text-[14px] uppercase tracking-wider text-white mb-3 font-bold">
              Customer Service
            </h4>
            <ul className="space-y-2 font-['Hanken_Grotesk'] text-[13px]">
              <li>
                <button
                  onClick={() => showToastNotification('Concierge Connected', '24/7 dedicated retail concierge active')}
                  className="hover:text-white transition-colors text-left"
                >
                  24/7 Concierge Support
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('order-tracking')}
                  className="hover:text-white transition-colors text-left"
                >
                  Unified Order Tracking
                </button>
              </li>
              <li>
                <button
                  onClick={() => showToastNotification('Returns Guarantee', '30-Day single-label return policy')}
                  className="hover:text-white transition-colors text-left"
                >
                  Returns & Exchanges
                </button>
              </li>
              <li>
                <button
                  onClick={() => setActiveView('magazine')}
                  className="hover:text-white transition-colors text-left"
                >
                  Multi-Cart Logistics SLA
                </button>
              </li>
            </ul>
          </div>

          {/* Departments */}
          <div>
            <h4 className="font-['Space_Grotesk'] text-[14px] uppercase tracking-wider text-white mb-3 font-bold">
              Departments
            </h4>
            <ul className="space-y-2 font-['Hanken_Grotesk'] text-[13px]">
              <li>
                <button onClick={() => navigateToDept('fashion')} className="hover:text-white transition-colors">
                  Atelier Fashion
                </button>
              </li>
              <li>
                <button onClick={() => navigateToDept('beauty')} className="hover:text-white transition-colors">
                  Cosmetics & Beauty
                </button>
              </li>
              <li>
                <button onClick={() => navigateToDept('electronics')} className="hover:text-white transition-colors">
                  Electronics Lab
                </button>
              </li>
              <li>
                <button onClick={() => navigateToDept('home')} className="hover:text-white transition-colors">
                  Home & Living
                </button>
              </li>
              <li>
                <button onClick={() => navigateToDept('grocery')} className="hover:text-white transition-colors">
                  Pantry & Grocery
                </button>
              </li>
              <li>
                <button onClick={() => navigateToDept('kids')} className="hover:text-white transition-colors">
                  Kids & Toys
                </button>
              </li>
            </ul>
          </div>

          {/* About & Systems */}
          <div>
            <h4 className="font-['Space_Grotesk'] text-[14px] uppercase tracking-wider text-white mb-3 font-bold">
              Architecture & Docs
            </h4>
            <ul className="space-y-2 font-['Hanken_Grotesk'] text-[13px]">
              <li>
                <button onClick={() => setActiveView('magazine')} className="hover:text-white transition-colors">
                  The Everything Issue (PRD)
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('theme-lab')} className="hover:text-white transition-colors">
                  Token Lab & WCAG Panel
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('store_admin')} className="hover:text-white transition-colors">
                  RBAC Matrix & Governance
                </button>
              </li>
              <li>
                <button onClick={() => setActiveView('dept_manager')} className="hover:text-white transition-colors">
                  Electronics & Beauty Cockpit
                </button>
              </li>
              <li>
                <button
                  onClick={() => showToastNotification('Compliance Active', 'PCI DSS Level 1 encryption certified')}
                  className="hover:text-white transition-colors"
                >
                  PCI DSS Level 1 Security
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Trust Badges & Payments Strip */}
        <div className="pt-6 border-t border-[#292a2d] flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-3 font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase tracking-wider">
            <span className="flex items-center gap-1 text-white">
              <span className="material-symbols-outlined text-[14px] text-emerald-400">verified_user</span>
              256-Bit SSL Encrypted
            </span>
            <span>•</span>
            <span>SOC2 Certified</span>
            <span>•</span>
            <span className="text-[#7df4ff]">Multi-Origin Hub Fulfillment</span>
          </div>

          <div className="flex items-center gap-3">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase text-[#8f9194]">Instant Payment Networks:</span>
            <div className="flex items-center gap-1 font-['Space_Grotesk'] text-[10px] text-white font-bold">
              <span className="px-2 py-1 bg-[#1f1f23] rounded border border-[#343538]">VISA</span>
              <span className="px-2 py-1 bg-[#1f1f23] rounded border border-[#343538]">MASTERCARD</span>
              <span className="px-2 py-1 bg-[#1f1f23] rounded border border-[#343538] text-[#7df4ff]">UPI</span>
              <span className="px-2 py-1 bg-[#1f1f23] rounded border border-[#343538]">APPLE PAY</span>
              <span className="px-2 py-1 bg-[#1f1f23] rounded border border-[#343538] text-[#ffb3b3]">KLARNA</span>
            </div>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="text-center font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8f9194] pt-8">
          © 2026 BLOWMAGGY INC. ALL RIGHTS RESERVED. EVERY DEPARTMENT. ONE CART. ONE CHECKOUT.
          <p className="mt-2 normal-case tracking-normal text-xs font-semibold text-white">Developed by Himanshu Yadav and Debasmita Karmakar</p>
        </div>
      </div>
    </footer>
  );
};
