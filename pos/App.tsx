import React from 'react';
import './tailwind.css';
import { POSProvider, usePOS } from './src/context/POSContext';
import { Sidebar } from './src/components/Sidebar';
import { Header } from './src/components/Header';
import { KasirScreen } from './src/screens/KasirScreen';
import { KeranjangScreen } from './src/screens/KeranjangScreen';
import { RiwayatScreen } from './src/screens/RiwayatScreen';
import { ProdukScreen } from './src/screens/ProdukScreen';
import { LainnyaScreen } from './src/screens/LainnyaScreen';
import { CashierIcon, CartIcon, HistoryIcon, ProductIcon, MoreIcon } from './src/components/Icons';
import { TabType } from './src/types';

function MainLayout() {
  const { activeTab, setActiveTab, cartTotalQty, transactions } = usePOS();

  const renderScreen = () => {
    switch (activeTab) {
      case 'kasir':
        return <KasirScreen />;
      case 'keranjang':
        return <KeranjangScreen />;
      case 'riwayat':
        return <RiwayatScreen />;
      case 'produk':
        return <ProdukScreen />;
      case 'lainnya':
        return <LainnyaScreen />;
      default:
        return <KasirScreen />;
    }
  };

  const mobileNavItems: { key: TabType; label: string; icon: React.ComponentType<{ size?: number; color?: string }>; badge?: number }[] = [
    { key: 'kasir', label: 'Kasir', icon: CashierIcon },
    { key: 'keranjang', label: 'Keranjang', icon: CartIcon, badge: cartTotalQty },
    { key: 'riwayat', label: 'Riwayat', icon: HistoryIcon, badge: transactions.length },
    { key: 'produk', label: 'Produk', icon: ProductIcon },
    { key: 'lainnya', label: 'Lainnya', icon: MoreIcon },
  ];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-100 font-sans antialiased text-slate-800">
      {/* Desktop / Tablet Sidebar */}
      <div className="hidden md:flex shrink-0">
        <Sidebar />
      </div>

      {/* Main Content Viewport */}
      <div className="flex-1 flex flex-col h-full overflow-hidden">
        <Header />
        <main className="flex-1 flex flex-col overflow-hidden relative">
          {renderScreen()}
        </main>

        {/* Mobile Bottom Navigation Bar (Hidden on md and larger) */}
        <nav className="md:hidden bg-slate-900 border-t border-slate-800 flex items-center justify-around py-2 px-1 shrink-0 z-30">
          {mobileNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            return (
              <button
                key={item.key}
                onClick={() => setActiveTab(item.key)}
                className={`relative flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                  isActive ? 'text-emerald-400 font-bold' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <div className="relative">
                  <Icon size={18} color={isActive ? '#34d399' : '#94a3b8'} />
                  {typeof item.badge === 'number' && item.badge > 0 && (
                    <span className="absolute -top-1.5 -right-2 bg-emerald-500 text-white text-[9px] font-bold w-3.5 h-3.5 rounded-full flex items-center justify-center">
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="mt-1">{item.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}

export default function App() {
  return (
    <POSProvider>
      <MainLayout />
    </POSProvider>
  );
}
