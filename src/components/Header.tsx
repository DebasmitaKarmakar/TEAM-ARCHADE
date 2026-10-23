import React, { useState } from 'react';
import { useStore, ActiveView } from '../context/StoreContext';
import { DepartmentId, UserRole } from '../types/store';
import { formatInr } from '../lib/currency';

export const Header: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentRole,
    currentUser,
    setLoginModalOpen,
    logout,
    selectedDeptId,
    navigateToDept,
    cartTotalQuantity,
    cartSubtotal,
    wishlist,
    setCommandPaletteOpen,
    searchQuery: globalSearchQuery,
    setSearchQuery,
  } = useStore();

  const [roleDropdownOpen, setRoleDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleRoleSelect = (_role: UserRole) => {
    setLoginModalOpen(true);
    setRoleDropdownOpen(false);
  };

  const roleLabels: Record<UserRole, { label: string; desc: string; color: string }> = {
    shopper: { label: 'Role: Shopper', desc: 'Browsing Storefront', color: 'bg-emerald-400' },
    dept_manager: { label: 'Role: Dept Manager', desc: 'Marcus Chen (#DEP-02 & #DEP-03)', color: 'bg-[#7df4ff]' },
    store_admin: { label: 'Role: Store Admin', desc: 'Sophia Sterling (COO)', color: 'bg-[#ba012d]' },
  };

  return (
    <header
      className="fixed top-0 w-full z-50 bg-[#121316]/95 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.4)]"
      style={{
        background: 'linear-gradient(110deg, #273c92 0%, #6547b8 52%, #e0b83f 130%)',
        borderBottom: '1px solid rgba(147, 197, 253, 0.15)',
        boxShadow: 'rgba(99, 102, 241, 0.12) 0px 4px 20px -2px',
      }}
    >
      {/* Top Banner */}
      <div
        className="w-full bg-[#0d0e11] text-[#c5c7c9] font-['Space_Grotesk'] text-[10px] tracking-widest uppercase py-1 px-4 sm:px-8 lg:px-12 flex items-center justify-between"
        style={{ background: 'linear-gradient(90deg, #22357f, #6d4bc2, #d9aa31)', borderBottom: '1px solid rgba(255,255,255,0.3)' }}
      >
        <div className="flex items-center gap-2 mx-auto text-center truncate">
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba012d] animate-pulse shrink-0"></span>
          <span className="truncate">
            PREVIEW SALE: Enjoy free delivery on multi-department orders over {formatInr(75)} with code <strong className="text-white">ONECART</strong> • 24/7 Concierge Support
          </span>
          <span className="w-1.5 h-1.5 rounded-full bg-[#ba012d] shrink-0"></span>
        </div>
      </div>

      {/* Main Header Row */}
      <div className="h-20 w-full px-4 sm:px-8 lg:px-12 flex items-center justify-between gap-4">
        {/* Brand / Logo */}
        <div
          onClick={() => setActiveView('home')}
          className="flex items-center gap-3 shrink-0 cursor-pointer group"
        >
          <img
            alt="Blowmaggy Wordmark Logo"
            className="h-8 w-auto object-contain transition-transform group-hover:scale-105"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UADMaEayZO_xcBmngPCX5LyZIt1G7x-oeCDUy_llM1iaH6jRZm3BMMwm3VnKS1TkhaYmsBSQeZ_NUoOybgtE03a2lg4tfy5JRmbY4c4OhZrV0knNSP2thrgqySDOhhvzdAPufi4tRWt0iwK2Vv2M2kcHXPCcDbc2dP2jSYt6ZcbrXSOBv67_NLwf9JHS75rjCx7Y7Kl35I9M-QM_30yBAJw1EBw-UfBi1BmJZehBlJD85k5iDJ5WH7u6Ly"
          />
          <div className="hidden xl:flex flex-col">
            <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8f9194]">
              Unified Department Store
            </span>
          </div>
        </div>

        {/* Global Search Bar (with ⌘K trigger) */}
        <div className="flex-1 max-w-2xl hidden md:flex items-center">
          <div
            onClick={() => setCommandPaletteOpen(true)}
            className="w-full flex items-center bg-[#1b1b1f] hover:bg-[#292a2d] transition-colors rounded-lg p-1.5 cursor-pointer border border-[#343538]"
          >
            <div className="relative shrink-0">
              <select
                className="bg-[#292a2d] text-[#e3e2e6] font-['Space_Grotesk'] text-[12px] px-2 py-1 rounded appearance-none cursor-pointer focus:outline-none pr-6"
                onChange={(e) => {
                  e.stopPropagation();
                  if (e.target.value === 'all') setActiveView('home');
                  else navigateToDept(e.target.value as DepartmentId);
                }}
                value={activeView === 'department' ? selectedDeptId : 'all'}
              >
                <option value="all">All Departments</option>
                <option value="fashion">Fashion Atelier</option>
                <option value="beauty">Beauty & Apothecary</option>
                <option value="electronics">Electronics Lab</option>
                <option value="home">Home & Living</option>
                <option value="grocery">Pantry & Grocery</option>
                <option value="kids">Kids & Toys</option>
              </select>
              <span className="material-symbols-outlined text-[16px] text-[#8f9194] absolute right-1.5 top-1.5 pointer-events-none">
                expand_more
              </span>
            </div>
            <div className="w-px h-5 bg-[#343538] mx-2"></div>
            <div className="flex-1 flex items-center px-1">
              <span className="material-symbols-outlined text-[#8f9194] text-[18px] mr-2">
                search
              </span>
              <input
                id="header-product-search"
                className="w-full bg-transparent text-[#e3e2e6] font-['Hanken_Grotesk'] text-[13px] placeholder:text-[#8f9194] focus:outline-none"
                placeholder="Search apparel, gadgets, pantry items, home curation..."
                type="text"
                value={globalSearchQuery}
                onClick={(event) => event.stopPropagation()}
                onChange={(event) => setSearchQuery(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    setActiveView('search');
                  }
                }}
              />
            </div>
            <button id="header-search-submit" type="button" onClick={(event) => { event.stopPropagation(); setActiveView('search'); }} className="font-['Space_Grotesk'] text-[10px] text-[#8f9194] uppercase px-2 py-0.5 rounded bg-[#292a2d] border border-[#44474a] hidden lg:inline hover:text-white">Search</button>
          </div>
        </div>

        {/* Right Action Icons: Role Switcher, Wishlist, Cart Pill, Avatar */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Quick Role Switcher */}
          <div className="relative">
            <button
              onClick={() => setRoleDropdownOpen(!roleDropdownOpen)}
              className="flex items-center gap-1.5 bg-[#292a2d] px-3 py-1.5 rounded-full font-['Space_Grotesk'] text-[12px] text-[#c5c7c9] hover:text-white hover:bg-[#343538] transition-colors border border-[#44474a]"
              title="Choose a demo account"
            >
              <span className={`w-2 h-2 rounded-full ${roleLabels[currentRole].color}`}></span>
              <span className="font-['Space_Grotesk'] text-[10px] uppercase font-bold tracking-wider">
                {currentUser ? roleLabels[currentRole].label : 'Demo sign in'}
              </span>
              <span className="material-symbols-outlined text-[14px]">arrow_drop_down</span>
            </button>

            {roleDropdownOpen && (
              <div
                className="absolute right-0 mt-2 w-72 bg-[#1b1b1f] border border-[#343538] rounded-xl shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150"
                onMouseLeave={() => setRoleDropdownOpen(false)}
              >
                <div className="px-3 py-2 border-b border-[#292a2d] mb-1">
                  <span className="font-['Space_Grotesk'] text-[10px] uppercase tracking-wider text-[#8f9194]">
                    Switch User Perspective
                  </span>
                </div>
                <button
                  onClick={() => handleRoleSelect('shopper')}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentRole === 'shopper' ? 'bg-[#292a2d] text-white font-bold' : 'hover:bg-[#292a2d]/60 text-[#c5c7c9]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shrink-0"></span>
                  <div>
                    <div className="font-['Space_Grotesk'] text-[12px] font-bold">Shopper Perspective</div>
                    <div className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Unified store, 360° PDP, cart & checkout</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect('dept_manager')}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentRole === 'dept_manager' ? 'bg-[#292a2d] text-white font-bold' : 'hover:bg-[#292a2d]/60 text-[#c5c7c9]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#7df4ff] shrink-0"></span>
                  <div>
                    <div className="font-['Space_Grotesk'] text-[12px] font-bold">Marcus Chen (Dept Manager)</div>
                    <div className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Level 2 Scoped: Electronics & Beauty</div>
                  </div>
                </button>
                <button
                  onClick={() => handleRoleSelect('store_admin')}
                  className={`w-full text-left p-2.5 rounded-lg flex items-center gap-3 transition-colors ${
                    currentRole === 'store_admin' ? 'bg-[#292a2d] text-white font-bold' : 'hover:bg-[#292a2d]/60 text-[#c5c7c9]'
                  }`}
                >
                  <span className="w-2.5 h-2.5 rounded-full bg-[#ba012d] shrink-0"></span>
                  <div>
                    <div className="font-['Space_Grotesk'] text-[12px] font-bold">Sophia Sterling (Store Admin)</div>
                    <div className="font-['Hanken_Grotesk'] text-[11px] text-[#8f9194]">Executive Governance, RBAC & Audit</div>
                  </div>
                </button>
                {currentUser && (
                  <button
                    id="header-demo-logout"
                    onClick={() => {
                      logout();
                      setRoleDropdownOpen(false);
                    }}
                    className="mt-1 w-full border-t border-[#343538] px-3 py-2.5 text-left font-['Space_Grotesk'] text-[11px] uppercase tracking-wider text-[#8f9194] transition-colors hover:text-white"
                  >
                    Sign out of {currentUser.name}'s demo session
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Button */}
          <button
            onClick={() => setActiveView('wishlist')}
            className="relative p-2 text-[#c5c7c9] hover:text-white transition-colors"
            title="View Wishlist"
          >
            <span className="material-symbols-outlined text-[22px]">favorite</span>
            {wishlist.length > 0 && (
              <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-[#ba012d] text-white font-['Space_Grotesk'] text-[10px] flex items-center justify-center font-bold">
                {wishlist.length}
              </span>
            )}
          </button>

          {/* Unified Cart Pill */}
          <button
            onClick={() => setActiveView('cart')}
            className={`flex items-center gap-2 px-3 py-2 rounded font-['Space_Grotesk'] text-[14px] transition-all duration-200 ${
              activeView === 'cart'
                ? 'bg-white text-[#121316] font-bold shadow-lg shadow-white/10'
                : 'bg-white text-[#121316] hover:bg-[#e2e2e4] font-semibold'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">shopping_bag</span>
            <span className="hidden sm:inline font-['Space_Grotesk'] text-[13px] font-bold">
              {cartTotalQuantity} {cartTotalQuantity === 1 ? 'item' : 'items'} • {formatInr(cartSubtotal)}
            </span>
            <span className="sm:hidden font-['Space_Grotesk'] text-[12px] font-bold">
              {cartTotalQuantity}
            </span>
          </button>

          {/* Quick Avatar / Cockpit Jump */}
          <div
            onClick={() => {
              if (!currentUser) setLoginModalOpen(true);
              else if (currentRole === 'shopper') setActiveView('order-history');
              else if (currentRole === 'dept_manager') setActiveView('dept_manager');
              else setActiveView('store_admin');
            }}
            className="w-8 h-8 rounded-full bg-white flex items-center justify-center cursor-pointer hover:ring-2 hover:ring-[#7df4ff] transition-all"
            title="Profile / Workspace"
          >
            <span className="material-symbols-outlined text-[#121316] text-[18px]">person</span>
          </div>

          {/* Mobile hamburger toggle */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-1 text-[#c5c7c9] hover:text-white"
          >
            <span className="material-symbols-outlined text-[24px]">
              {mobileMenuOpen ? 'close' : 'menu'}
            </span>
          </button>
        </div>
      </div>

      {/* Department Navigation Bar */}
      <div
        className="w-full bg-[#1b1b1f] px-4 sm:px-8 lg:px-12 border-t border-[#343538]/50 overflow-x-auto"
        style={{ background: 'rgba(18, 16, 36, 0.85)', borderTop: '1px solid rgba(147, 197, 253, 0.08)' }}
      >
        <nav className="flex items-center gap-4 sm:gap-6 md:gap-8 overflow-x-auto py-2.5">
          <button
            onClick={() => setActiveView('home')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors ${
              activeView === 'home'
                ? 'text-white font-bold border-b-2 border-white'
                : 'text-[#c5c7c9] hover:text-white'
            }`}
          >
            All Departments
          </button>

          <button
            onClick={() => navigateToDept('fashion')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'fashion'
                ? 'text-[#FF4F8B] font-bold border-b-2 border-[#FF4F8B]'
                : 'text-[#c5c7c9] hover:text-[#FF4F8B]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF4F8B]"></span>
            Fashion
          </button>

          <button
            onClick={() => navigateToDept('beauty')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'beauty'
                ? 'text-[#FF8A65] font-bold border-b-2 border-[#FF8A65]'
                : 'text-[#c5c7c9] hover:text-[#FF8A65]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF8A65]"></span>
            Beauty
          </button>

          <button
            onClick={() => navigateToDept('electronics')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'electronics'
                ? 'text-[#22D3EE] font-bold border-b-2 border-[#22D3EE]'
                : 'text-[#c5c7c9] hover:text-[#22D3EE]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#22D3EE]"></span>
            Electronics
          </button>

          <button
            onClick={() => navigateToDept('home')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'home'
                ? 'text-[#D97757] font-bold border-b-2 border-[#D97757]'
                : 'text-[#c5c7c9] hover:text-[#D97757]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#D97757]"></span>
            Home & Living
          </button>

          <button
            onClick={() => navigateToDept('grocery')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'grocery'
                ? 'text-[#84CC16] font-bold border-b-2 border-[#84CC16]'
                : 'text-[#c5c7c9] hover:text-[#84CC16]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#84CC16]"></span>
            Grocery
          </button>

          <button
            onClick={() => navigateToDept('kids')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'department' && selectedDeptId === 'kids'
                ? 'text-[#FACC15] font-bold border-b-2 border-[#FACC15]'
                : 'text-[#c5c7c9] hover:text-[#FACC15]'
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-[#FACC15]"></span>
            Kids & Toys
          </button>


          {/* Consignment Tracking */}
          <button
            onClick={() => setActiveView('order-tracking')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'order-tracking'
                ? 'text-white font-bold border-b-2 border-white'
                : 'text-[#c5c7c9] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">local_shipping</span>
            Track Order
          </button>

          <button
            id="header-order-history"
            onClick={() => setActiveView('order-history')}
            className={`shrink-0 py-1 font-['Space_Grotesk'] text-[12px] tracking-wider uppercase transition-colors flex items-center gap-1.5 ${
              activeView === 'order-history'
                ? 'text-white font-bold border-b-2 border-white'
                : 'text-[#c5c7c9] hover:text-white'
            }`}
          >
            <span className="material-symbols-outlined text-[14px]">receipt_long</span>
            Orders
          </button>

          {/* Direct admin jump if role selected */}
          {currentRole === 'dept_manager' && (
            <button
              onClick={() => setActiveView('dept_manager')}
              className="shrink-0 py-1 px-2.5 bg-[#7df4ff]/20 text-[#7df4ff] rounded font-['Space_Grotesk'] text-[11px] uppercase font-bold tracking-wider hover:bg-[#7df4ff]/30"
            >
              Manager Cockpit
            </button>
          )}

          {currentRole === 'store_admin' && (
            <button
              onClick={() => setActiveView('store_admin')}
              className="shrink-0 py-1 px-2.5 bg-[#ba012d]/30 text-white rounded font-['Space_Grotesk'] text-[11px] uppercase font-bold tracking-wider hover:bg-[#ba012d]/50"
            >
              Executive Console
            </button>
          )}
        </nav>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-[#121316] border-b border-[#343538] p-4 flex flex-col gap-3">
          <div
            onClick={() => {
              setCommandPaletteOpen(true);
              setMobileMenuOpen(false);
            }}
            className="w-full flex items-center gap-2 bg-[#1b1b1f] p-2.5 rounded-lg text-[#8f9194] text-sm"
          >
            <span className="material-symbols-outlined text-[18px]">search</span>
            <span>Search entire catalog...</span>
          </div>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#292a2d]">
            <button
              onClick={() => {
                setActiveView('home');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#e3e2e6]"
            >
              Home Storefront
            </button>
            <button
              onClick={() => {
                setActiveView('cart');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#e3e2e6]"
            >
              Universal Cart ({cartTotalQuantity})
            </button>
            <button
              onClick={() => {
                setActiveView('magazine');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#e3e2e6]"
            >
              The Everything Issue
            </button>
            <button
              onClick={() => {
                setActiveView('theme-lab');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#e3e2e6]"
            >
              Token Lab
            </button>
            <button
              onClick={() => {
                setActiveView('dept_manager');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#7df4ff]"
            >
              Dept Manager Cockpit
            </button>
            <button
              onClick={() => {
                setActiveView('store_admin');
                setMobileMenuOpen(false);
              }}
              className="text-left py-2 px-3 bg-[#1f1f23] rounded text-sm text-[#ffb3b3]"
            >
              Store Admin Console
            </button>
          </div>
        </div>
      )}
    </header>
  );
};
