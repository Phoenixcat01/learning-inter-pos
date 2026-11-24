import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Transaction } from '../types';
import { HistoryIcon, SearchIcon, CloseIcon } from '../components/Icons';
import { formatRupiah, formatDateTime } from '../utils/format';

export const RiwayatScreen: React.FC = () => {
  const { transactions, setActiveTab } = usePOS();
  const [search, setSearch] = useState<string>('');
  const [selectedTrx, setSelectedTrx] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter((t) => {
    const q = search.toLowerCase();
    return (
      t.invoiceNumber.toLowerCase().includes(q) ||
      (t.customerName && t.customerName.toLowerCase().includes(q)) ||
      t.paymentMethod.toLowerCase().includes(q)
    );
  });

  const totalRevenue = transactions.reduce((sum, t) => sum + t.total, 0);
  const totalItemsSold = transactions.reduce(
    (sum, t) => sum + t.items.reduce((itemSum, item) => itemSum + item.quantity, 0),
    0
  );
  const avgTransaction = transactions.length > 0 ? Math.round(totalRevenue / transactions.length) : 0;

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Stats Banner */}
      <div className="p-6 pb-2 grid grid-cols-1 md:grid-cols-3 gap-4 shrink-0">
        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Pendapatan
          </span>
          <p className="text-xl font-extrabold text-emerald-700 mt-1">{formatRupiah(totalRevenue)}</p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Jumlah Transaksi
          </span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">
            {transactions.length} <span className="text-xs font-medium text-slate-500">transaksi ({totalItemsSold} item)</span>
          </p>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-slate-200 shadow-xs">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Rata-rata Transaksi
          </span>
          <p className="text-xl font-extrabold text-slate-800 mt-1">{formatRupiah(avgTransaction)}</p>
        </div>
      </div>

      {/* Search Bar */}
      <div className="px-6 py-2 flex items-center justify-between shrink-0">
        <div className="relative w-full max-w-sm">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <SearchIcon size={16} />
          </span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cari nomor nota, pelanggan, atau metode..."
            className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
          />
        </div>
      </div>

      {/* Transactions List */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        {filteredTransactions.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 border-dashed">
            <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <HistoryIcon size={24} />
            </div>
            <h4 className="font-bold text-slate-700 text-base">Belum Ada Riwayat Transaksi</h4>
            <p className="text-xs text-slate-400 max-w-xs mt-1">
              Transaksi yang berhasil dilakukan melalui menu Kasir & Keranjang akan tercatat di sini secara otomatis.
            </p>
            <button
              onClick={() => setActiveTab('kasir')}
              className="mt-4 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              Mulai Transaksi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
                  <tr>
                    <th className="py-3.5 px-4">No. Invoice</th>
                    <th className="py-3.5 px-4">Waktu</th>
                    <th className="py-3.5 px-4">Pelanggan</th>
                    <th className="py-3.5 px-4">Item</th>
                    <th className="py-3.5 px-4">Metode</th>
                    <th className="py-3.5 px-4 text-right">Total</th>
                    <th className="py-3.5 px-4 text-center">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredTransactions.map((trx) => (
                    <tr key={trx.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3 px-4 font-mono font-bold text-slate-800">{trx.invoiceNumber}</td>
                      <td className="py-3 px-4 text-slate-500">{formatDateTime(trx.date)}</td>
                      <td className="py-3 px-4 font-medium text-slate-700">{trx.customerName || 'Pelanggan Umum'}</td>
                      <td className="py-3 px-4 text-slate-500">
                        {trx.items.length} jenis ({trx.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                      </td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700">
                          {trx.paymentMethod}
                        </span>
                      </td>
                      <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                        {formatRupiah(trx.total)}
                      </td>
                      <td className="py-3 px-4 text-center">
                        <button
                          onClick={() => setSelectedTrx(trx)}
                          className="px-3 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] transition-colors cursor-pointer"
                        >
                          Lihat Struk
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Transaction Detail Modal */}
      {selectedTrx && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <div>
                <h4 className="font-extrabold text-base text-slate-800">Detail Nota Transaksi</h4>
                <p className="text-xs font-mono text-slate-500">{selectedTrx.invoiceNumber}</p>
              </div>
              <button
                onClick={() => setSelectedTrx(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="py-3 text-xs space-y-1 text-slate-500 border-b border-slate-100">
              <div className="flex justify-between">
                <span>Waktu Transaksi:</span>
                <span className="font-medium text-slate-800">{formatDateTime(selectedTrx.date)}</span>
              </div>
              <div className="flex justify-between">
                <span>Pelanggan:</span>
                <span className="font-medium text-slate-800">{selectedTrx.customerName}</span>
              </div>
              <div className="flex justify-between">
                <span>Metode Pembayaran:</span>
                <span className="font-medium text-slate-800">{selectedTrx.paymentMethod}</span>
              </div>
            </div>

            {/* Items */}
            <div className="py-3 space-y-2 max-h-48 overflow-y-auto border-b border-slate-100">
              {selectedTrx.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-[11px] text-slate-400">
                      {item.quantity} x {formatRupiah(item.price)}
                    </p>
                  </div>
                  <span className="font-bold text-slate-900">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Summary */}
            <div className="py-3 space-y-1 text-xs">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatRupiah(selectedTrx.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>PPN 10%</span>
                <span>{formatRupiah(selectedTrx.tax)}</span>
              </div>
              <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-1 border-t border-slate-200">
                <span>Total Tagihan</span>
                <span className="text-emerald-700">{formatRupiah(selectedTrx.total)}</span>
              </div>
              {selectedTrx.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between text-slate-500 pt-1">
                    <span>Uang Diterima</span>
                    <span>{formatRupiah(selectedTrx.cashReceived || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Kembalian</span>
                    <span>{formatRupiah(selectedTrx.change || 0)}</span>
                  </div>
                </>
              )}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-200">
              <button
                onClick={() => setSelectedTrx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Tutup
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
