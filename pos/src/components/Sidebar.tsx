import React from 'react';
import { usePOS } from '../context/POSContext';
import { TabType } from '../types';
import { CashierIcon, CartIcon, HistoryIcon, ProductIcon, MoreIcon } from './Icons';

interface NavItem {
  key: TabType;
  label: string;
  icon: React.ComponentType<{ size?: number; color?: string; className?: string }>;
  badge?: number;
}

export const Sidebar: React.FC = () => {
  const { activeTab, setActiveTab, cartTotalQty, transactions } = usePOS();

  const navItems: NavItem[] = [
    { key: 'kasir', label: 'Kasir', icon: CashierIcon },
    { key: 'keranjang', label: 'Keranjang', icon: CartIcon, badge: cartTotalQty },
    { key: 'riwayat', label: 'Riwayat', icon: HistoryIcon, badge: transactions.length },
    { key: 'produk', label: 'Produk', icon: ProductIcon },
    { key: 'lainnya', label: 'Lainnya', icon: MoreIcon },
  ];

  return (
    <aside className="w-64 bg-slate-900 text-white flex flex-col justify-between shrink-0 shadow-xl border-r border-slate-800">
      {/* Brand Header */}
      <div>
        <div className="p-6 border-b border-slate-800 flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-500 to-teal-400 flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <CashierIcon size={24} color="#ffffff" />
          </div>
          <div>
            <h1 className="font-bold text-lg tracking-tight text-white">Belajar POS</h1>
            <div className="flex items-center space-x-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <p className="text-xs text-slate-400">Web Static Edition</p>
            </div>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;

            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`w-full flex items-center justify-between px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 cursor-pointer ${
                  isActive
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-600/30'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Icon
                    size={20}
                    color={isActive ? '#ffffff' : '#94a3b8'}
                  />
                  <span>{item.label}</span>
                </div>

                {typeof item.badge === 'number' && item.badge > 0 && (
                  <span
                    className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                      isActive
                        ? 'bg-white text-emerald-700'
                        : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>

      {/* Footer Info */}
      <div className="p-4 border-t border-slate-800/80 bg-slate-950/40">
        <div className="rounded-xl bg-slate-800/60 p-3 border border-slate-800">
          <p className="text-xs font-semibold text-slate-300">Point of Sale v1.0</p>
          <p className="text-[11px] text-slate-500 mt-0.5">Expo + Tailwind + Static Web</p>
        </div>
      </div>
    </aside>
  );
};
