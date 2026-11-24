import React from 'react';
import { MoreIcon } from '../components/Icons';

export const LainnyaScreen: React.FC = () => {
  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto p-8 bg-slate-50">
      {/* Empty State / Placeholder Header */}
      <div className="max-w-2xl mx-auto w-full text-center py-8">
        <div className="w-20 h-20 rounded-3xl bg-slate-100 border border-slate-200 text-slate-400 flex items-center justify-center mx-auto mb-4 shadow-xs">
          <MoreIcon size={36} color="#64748b" />
        </div>
        <h3 className="text-xl font-bold text-slate-800">Menu Lainnya</h3>
        <p className="text-xs text-slate-500 max-w-md mx-auto mt-2 leading-relaxed">
          Menu ini sengaja disediakan sebagai placeholder/penampung fitur tambahan di masa mendatang sesuai perencanaan awal proyek.
        </p>

        {/* Feature Placeholders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-8 text-left">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs opacity-75">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              Segera Hadir
            </span>
            <h4 className="font-bold text-slate-800 text-sm mt-2">Pengaturan Profil Toko</h4>
            <p className="text-xs text-slate-400 mt-1">
              Atur nama toko, alamat, logo struk, dan persentase pajak (PPN).
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs opacity-75">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              Segera Hadir
            </span>
            <h4 className="font-bold text-slate-800 text-sm mt-2">Laporan & Analitik Penjualan</h4>
            <p className="text-xs text-slate-400 mt-1">
              Grafik penjualan harian/bulanan, produk terlaris, dan ekspor data ke Excel/CSV.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs opacity-75">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              Segera Hadir
            </span>
            <h4 className="font-bold text-slate-800 text-sm mt-2">Integrasi Printer Kasir</h4>
            <p className="text-xs text-slate-400 mt-1">
              Hubungkan ke printer thermal 58mm / 80mm via Bluetooth atau USB.
            </p>
          </div>

          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs opacity-75">
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700 border border-amber-200 uppercase tracking-wide">
              Segera Hadir
            </span>
            <h4 className="font-bold text-slate-800 text-sm mt-2">Manajemen Staf & Akses</h4>
            <p className="text-xs text-slate-400 mt-1">
              Kelola akun kasir, pergantian shift kasir (cash drawer count), dan hak akses.
            </p>
          </div>
        </div>

        {/* Technical Info Box */}
        <div className="mt-8 p-4 rounded-2xl bg-white border border-slate-200 text-left">
          <p className="text-xs font-bold text-slate-700">Informasi Teknis Aplikasi</p>
          <div className="mt-2 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] text-slate-500">
            <div>
              <span className="text-slate-400 block">Framework:</span> Expo SDK 58
            </div>
            <div>
              <span className="text-slate-400 block">Engine:</span> React 19 Web
            </div>
            <div>
              <span className="text-slate-400 block">Styling:</span> Tailwind CSS
            </div>
            <div>
              <span className="text-slate-400 block">Target:</span> Static Web Bundle
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
