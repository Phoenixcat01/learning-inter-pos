import React, { useState, useEffect } from 'react';
import { usePOS } from '../context/POSContext';
import { CartIcon } from './Icons';
import { formatRupiah } from '../utils/format';

export const Header: React.FC = () => {
  const { activeTab, setActiveTab, cartTotalQty, cartGrandTotal } = usePOS();
  const [currentDateTime, setCurrentDateTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentDateTime(
        now.toLocaleDateString('id-ID', {
          weekday: 'long',
          year: 'numeric',
          month: 'short',
          day: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  const getTabTitle = () => {
    switch (activeTab) {
      case 'kasir':
        return 'Kasir Penjualan';
      case 'keranjang':
        return 'Keranjang Belanja';
      case 'riwayat':
        return 'Riwayat Transaksi';
      case 'produk':
        return 'Katalog Produk';
      case 'lainnya':
        return 'Menu Lainnya';
      default:
        return 'Point of Sale';
    }
  };

  return (
    <header className="h-18 bg-white border-b border-slate-200 px-8 flex items-center justify-between shrink-0 shadow-xs">
      <div>
        <h2 className="text-xl font-bold text-slate-800 tracking-tight">{getTabTitle()}</h2>
        <p className="text-xs text-slate-500 font-medium">{currentDateTime || 'Memuat waktu...'}</p>
      </div>

      <div className="flex items-center space-x-4">
        {/* Quick Cart Pill */}
        <button
          onClick={() => setActiveTab('keranjang')}
          className={`flex items-center space-x-3 px-4 py-2 rounded-xl transition-all border cursor-pointer ${
            activeTab === 'keranjang'
              ? 'bg-emerald-50 border-emerald-500 text-emerald-800'
              : 'bg-slate-50 hover:bg-slate-100 border-slate-200 text-slate-700'
          }`}
        >
          <div className="relative">
            <CartIcon size={20} color={activeTab === 'keranjang' ? '#047857' : '#475569'} />
            {cartTotalQty > 0 && (
              <span className="absolute -top-2 -right-2 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {cartTotalQty}
              </span>
            )}
          </div>
          <div className="text-left">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total Keranjang</span>
            <span className="text-sm font-bold text-slate-900">{formatRupiah(cartGrandTotal)}</span>
          </div>
        </button>
      </div>
    </header>
  );
};
