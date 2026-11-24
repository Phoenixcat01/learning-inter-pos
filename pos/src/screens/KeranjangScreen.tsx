import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Transaction } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, CheckIcon, CloseIcon } from '../components/Icons';
import { formatRupiah, formatDateTime } from '../utils/format';

export const KeranjangScreen: React.FC = () => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    setActiveTab,
  } = usePOS();

  const [customerName, setCustomerName] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'QRIS' | 'Debit/Kredit'>('Cash');
  const [cashGiven, setCashGiven] = useState<number>(0);
  const [completedTransaction, setCompletedTransaction] = useState<Transaction | null>(null);

  const discount = 0;
  const finalTotal = Math.max(0, cartGrandTotal - discount);
  const change = Math.max(0, cashGiven - finalTotal);

  const handleQuickCash = (amount: number) => {
    setCashGiven(amount);
  };

  const handleProcessCheckout = () => {
    if (cart.length === 0) {
      alert('Keranjang belanja masih kosong!');
      return;
    }

    if (paymentMethod === 'Cash' && cashGiven < finalTotal) {
      alert('Nominal uang tunai kurang dari total tagihan!');
      return;
    }

    const trx = checkout({
      customerName,
      paymentMethod,
      cashReceived: paymentMethod === 'Cash' ? cashGiven : finalTotal,
      discount,
    });

    setCompletedTransaction(trx);
    setCashGiven(0);
    setCustomerName('');
  };

  return (
    <div className="flex-1 flex flex-col md:flex-row h-full overflow-hidden bg-slate-50">
      {/* Left Column: Cart Items List */}
      <div className="flex-1 flex flex-col h-full border-r border-slate-200 overflow-hidden">
        <div className="p-6 pb-3 flex items-center justify-between shrink-0">
          <div>
            <h3 className="font-bold text-slate-800 text-lg">Daftar Item Belanja</h3>
            <p className="text-xs text-slate-500">Kelola kuantitas dan daftar pesanan pelanggan</p>
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-semibold text-rose-600 hover:text-rose-700 hover:underline cursor-pointer"
            >
              Kosongkan Keranjang
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-6 pt-2">
          {cart.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white rounded-2xl border border-slate-200 border-dashed">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
                <TrashIcon size={24} />
              </div>
              <h4 className="font-bold text-slate-700 text-base">Keranjang Anda Masih Kosong</h4>
              <p className="text-xs text-slate-400 max-w-xs mt-1">
                Pilih menu dan masukkan produk yang diinginkan dari menu Kasir untuk memulai transaksi.
              </p>
              <button
                onClick={() => setActiveTab('kasir')}
                className="mt-5 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Kembali ke Kasir
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {cart.map((item) => (
                <div
                  key={item.product.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200 flex items-center justify-between shadow-xs hover:border-slate-300 transition-all"
                >
                  <div className="flex-1 pr-4">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide">
                      {item.product.category} • {item.product.sku}
                    </span>
                    <h4 className="font-bold text-slate-800 text-sm mt-0.5">{item.product.name}</h4>
                    <span className="text-xs font-semibold text-emerald-700 block mt-1">
                      {formatRupiah(item.product.price)}
                    </span>
                  </div>

                  {/* Quantity Controls */}
                  <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-1.5 bg-slate-100 rounded-xl p-1 border border-slate-200">
                      <button
                        onClick={() => updateCartQty(item.product.id, -1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <MinusIcon size={14} />
                      </button>
                      <span className="w-8 text-center text-xs font-bold text-slate-900">
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQty(item.product.id, 1)}
                        className="w-7 h-7 rounded-lg bg-white hover:bg-slate-200 flex items-center justify-center text-slate-700 transition-colors shadow-xs cursor-pointer"
                      >
                        <PlusIcon size={14} />
                      </button>
                    </div>

                    <div className="w-24 text-right">
                      <span className="text-xs font-extrabold text-slate-900 block">
                        {formatRupiah(item.subtotal)}
                      </span>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.product.id)}
                      className="p-2 text-slate-400 hover:text-rose-600 transition-colors cursor-pointer"
                      title="Hapus Item"
                    >
                      <TrashIcon size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Right Column: Checkout & Payment Summary */}
      <div className="w-full md:w-96 bg-white flex flex-col justify-between shrink-0 shadow-md p-6 overflow-y-auto">
        <div className="space-y-5">
          <div>
            <h3 className="font-bold text-slate-800 text-base">Ringkasan Pembayaran</h3>
            <p className="text-xs text-slate-400">Pastikan nominal dan rincian transaksi telah sesuai</p>
          </div>

          {/* Customer Name Input */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Nama Pelanggan (Opsional)</label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="Contoh: Budi Santoso"
              className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>

          {/* Payment Method Selector */}
          <div>
            <label className="block text-xs font-semibold text-slate-600 mb-1.5">Metode Pembayaran</label>
            <div className="grid grid-cols-3 gap-2">
              {(['Cash', 'QRIS', 'Debit/Kredit'] as const).map((method) => (
                <button
                  key={method}
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 text-xs font-bold rounded-xl border transition-all cursor-pointer ${
                    paymentMethod === method
                      ? 'bg-emerald-600 text-white border-emerald-600 shadow-sm shadow-emerald-600/30'
                      : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>
          </div>

          {/* Cash Input if Cash Selected */}
          {paymentMethod === 'Cash' && cart.length > 0 && (
            <div className="space-y-2 p-3 bg-slate-50 rounded-xl border border-slate-200">
              <label className="block text-[11px] font-bold text-slate-600">Nominal Uang Diterima</label>
              <input
                type="number"
                value={cashGiven || ''}
                onChange={(e) => setCashGiven(Number(e.target.value))}
                placeholder="Masukkan jumlah uang..."
                className="w-full px-3 py-2 text-sm font-bold border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 bg-white"
              />

              <div className="flex items-center space-x-1.5 pt-1">
                <button
                  onClick={() => handleQuickCash(finalTotal)}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  Uang Pas
                </button>
                <button
                  onClick={() => handleQuickCash(50000)}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  50.000
                </button>
                <button
                  onClick={() => handleQuickCash(100000)}
                  className="px-2 py-1 text-[10px] font-bold rounded bg-slate-200 hover:bg-slate-300 text-slate-700 cursor-pointer"
                >
                  100.000
                </button>
              </div>

              {cashGiven >= finalTotal && (
                <div className="flex justify-between items-center pt-2 text-xs font-bold text-emerald-800">
                  <span>Kembalian:</span>
                  <span>{formatRupiah(change)}</span>
                </div>
              )}
            </div>
          )}

          {/* Breakdown calculation */}
          <div className="space-y-2 pt-3 border-t border-slate-200 text-xs">
            <div className="flex justify-between text-slate-600">
              <span>Subtotal</span>
              <span>{formatRupiah(cartSubtotal)}</span>
            </div>
            <div className="flex justify-between text-slate-600">
              <span>PPN (10%)</span>
              <span>{formatRupiah(cartTax)}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-slate-900 pt-2 border-t border-slate-200">
              <span>Total Akhir</span>
              <span className="text-emerald-700">{formatRupiah(finalTotal)}</span>
            </div>
          </div>
        </div>

        {/* Action Button */}
        <div className="pt-6">
          <button
            onClick={handleProcessCheckout}
            disabled={cart.length === 0}
            className={`w-full py-3.5 rounded-xl font-bold text-sm shadow-lg transition-all cursor-pointer flex items-center justify-center space-x-2 ${
              cart.length === 0
                ? 'bg-slate-200 text-slate-400 cursor-not-allowed shadow-none'
                : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/30'
            }`}
          >
            <CheckIcon size={18} />
            <span>Selesaikan Pembayaran</span>
          </button>
        </div>
      </div>

      {/* Transaction Success Modal / Receipt */}
      {completedTransaction && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
            <div className="text-center pb-4 border-b border-dashed border-slate-300">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto mb-2">
                <CheckIcon size={24} />
              </div>
              <h4 className="font-extrabold text-lg text-slate-800">Transaksi Berhasil!</h4>
              <p className="text-xs text-slate-500 font-mono mt-0.5">{completedTransaction.invoiceNumber}</p>
              <p className="text-[11px] text-slate-400 mt-1">{formatDateTime(completedTransaction.date)}</p>
            </div>

            {/* Receipt Items */}
            <div className="py-4 space-y-2 border-b border-dashed border-slate-300 max-h-48 overflow-y-auto">
              {completedTransaction.items.map((item) => (
                <div key={item.id} className="flex justify-between text-xs">
                  <span className="text-slate-700">
                    {item.name} <span className="text-slate-400">x{item.quantity}</span>
                  </span>
                  <span className="font-semibold text-slate-900">{formatRupiah(item.subtotal)}</span>
                </div>
              ))}
            </div>

            {/* Financial Details */}
            <div className="py-3 space-y-1.5 text-xs border-b border-slate-200">
              <div className="flex justify-between text-slate-500">
                <span>Subtotal</span>
                <span>{formatRupiah(completedTransaction.subtotal)}</span>
              </div>
              <div className="flex justify-between text-slate-500">
                <span>PPN 10%</span>
                <span>{formatRupiah(completedTransaction.tax)}</span>
              </div>
              <div className="flex justify-between font-bold text-slate-900 pt-1">
                <span>Total Bayar ({completedTransaction.paymentMethod})</span>
                <span className="text-emerald-700">{formatRupiah(completedTransaction.total)}</span>
              </div>
              {completedTransaction.paymentMethod === 'Cash' && (
                <>
                  <div className="flex justify-between text-slate-500">
                    <span>Uang Diterima</span>
                    <span>{formatRupiah(completedTransaction.cashReceived || 0)}</span>
                  </div>
                  <div className="flex justify-between font-bold text-slate-700">
                    <span>Kembalian</span>
                    <span>{formatRupiah(completedTransaction.change || 0)}</span>
                  </div>
                </>
              )}
            </div>

            {/* Modal Actions */}
            <div className="mt-5 flex space-x-2">
              <button
                onClick={() => {
                  setCompletedTransaction(null);
                  setActiveTab('kasir');
                }}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Transaksi Baru
              </button>
              <button
                onClick={() => {
                  setCompletedTransaction(null);
                  setActiveTab('riwayat');
                }}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Lihat di Riwayat
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
