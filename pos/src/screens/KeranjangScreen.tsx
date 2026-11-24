import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { usePOS } from '../context/POSContext';
import { Transaction } from '../types';
import { PlusIcon, MinusIcon, TrashIcon, CheckIcon } from '../components/Icons';
import { formatRupiah, formatDateTime, showPOSAlert } from '../utils/format';

export const KeranjangScreen: React.FC = () => {
  const {
    cart,
    updateCartQty,
    removeFromCart,
    clearCart,
    checkout,
    cartTotalQty,
    cartSubtotal,
    cartTax,
    cartGrandTotal,
    setActiveTab,
  } = usePOS();

  const { width } = useWindowDimensions();
  // Gunakan 2 kolom hanya jika layar cukup lebar (>= 1024px)
  // Di bawah 1024px (Mobile & Tablet), gunakan 1 kolom vertikal agar tidak saling tumpang tindih
  const isWideScreen = width >= 1024;

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
      showPOSAlert('Keranjang Kosong', 'Tambahkan produk terlebih dahulu dari Kasir.');
      return;
    }

    if (paymentMethod === 'Cash' && cashGiven < finalTotal) {
      showPOSAlert('Uang Kurang', 'Nominal uang tunai yang diterima kurang dari total tagihan.');
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

  // Komponen Kartu Item Belanja
  const renderCartItems = () => {
    if (cart.length === 0) {
      return (
        <View style={styles.emptyCart}>
          <View style={styles.emptyCartIcon}>
            <TrashIcon size={32} color="#94a3b8" />
          </View>
          <Text style={styles.emptyTitle}>Keranjang Masih Kosong</Text>
          <Text style={styles.emptySubtitle}>
            Pilih produk dari menu Kasir untuk memasukkan pesanan.
          </Text>
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => setActiveTab('kasir')}
            style={styles.backToKasirBtn}
          >
            <Text style={styles.backToKasirText}>Buka Kasir</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.itemListWrapper}>
        {cart.map((item) => (
          <View key={item.product.id} style={styles.cartCard}>
            {/* Baris Atas: Kategori & SKU + Tombol Hapus */}
            <View style={styles.cartCardTop}>
              <View style={styles.skuBadge}>
                <Text style={styles.skuBadgeText}>
                  {item.product.category} • {item.product.sku}
                </Text>
              </View>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => removeFromCart(item.product.id)}
                style={styles.deleteBtn}
              >
                <TrashIcon size={16} color="#e11d48" />
              </TouchableOpacity>
            </View>

            {/* Nama Produk & Harga Satuan */}
            <Text style={styles.cartItemName}>{item.product.name}</Text>
            <Text style={styles.cartItemPrice}>{formatRupiah(item.product.price)} / pcs</Text>

            {/* Baris Bawah: Kontrol Kuantitas & Subtotal */}
            <View style={styles.cartCardBottom}>
              <View style={styles.qtyBox}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => updateCartQty(item.product.id, -1)}
                  style={styles.qtyBtn}
                >
                  <MinusIcon size={14} color="#334155" />
                </TouchableOpacity>
                <Text style={styles.qtyNumber}>{item.quantity}</Text>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => updateCartQty(item.product.id, 1)}
                  style={styles.qtyBtn}
                >
                  <PlusIcon size={14} color="#334155" />
                </TouchableOpacity>
              </View>

              <View style={styles.subtotalCol}>
                <Text style={styles.subtotalLabel}>Subtotal</Text>
                <Text style={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    );
  };

  // Komponen Ringkasan Pembayaran
  const renderCheckoutForm = () => {
    return (
      <View style={styles.checkoutCard}>
        <Text style={styles.checkoutTitle}>Ringkasan Pembayaran</Text>

        {/* Nama Pelanggan */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Nama Pelanggan (Opsional)</Text>
          <TextInput
            value={customerName}
            onChangeText={setCustomerName}
            placeholder="Contoh: Budi"
            placeholderTextColor="#94a3b8"
            style={styles.textInput}
          />
        </View>

        {/* Metode Pembayaran */}
        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>Metode Pembayaran</Text>
          <View style={styles.methodRow}>
            {(['Cash', 'QRIS', 'Debit/Kredit'] as const).map((method) => {
              const isActive = paymentMethod === method;
              return (
                <TouchableOpacity
                  key={method}
                  activeOpacity={0.7}
                  onPress={() => setPaymentMethod(method)}
                  style={[styles.methodBtn, isActive && styles.methodBtnActive]}
                >
                  <Text style={[styles.methodBtnText, isActive && styles.methodBtnTextActive]}>
                    {method}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Input Uang Tunai jika Cash */}
        {paymentMethod === 'Cash' && cart.length > 0 && (
          <View style={styles.cashBox}>
            <Text style={styles.cashLabel}>Nominal Uang Diterima</Text>
            <TextInput
              value={cashGiven ? String(cashGiven) : ''}
              onChangeText={(val) => setCashGiven(Number(val.replace(/[^0-9]/g, '')))}
              keyboardType="numeric"
              placeholder="0"
              placeholderTextColor="#94a3b8"
              style={styles.cashInput}
            />

            <View style={styles.quickCashRow}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleQuickCash(finalTotal)}
                style={styles.quickCashBtn}
              >
                <Text style={styles.quickCashText}>Uang Pas</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleQuickCash(50000)}
                style={styles.quickCashBtn}
              >
                <Text style={styles.quickCashText}>50.000</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => handleQuickCash(100000)}
                style={styles.quickCashBtn}
              >
                <Text style={styles.quickCashText}>100.000</Text>
              </TouchableOpacity>
            </View>

            {cashGiven >= finalTotal && (
              <View style={styles.changeRow}>
                <Text style={styles.changeLabel}>Kembalian:</Text>
                <Text style={styles.changeAmount}>{formatRupiah(change)}</Text>
              </View>
            )}
          </View>
        )}

        {/* Rincian Kalkulasi */}
        <View style={styles.calcContainer}>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>Subtotal</Text>
            <Text style={styles.calcValue}>{formatRupiah(cartSubtotal)}</Text>
          </View>
          <View style={styles.calcRow}>
            <Text style={styles.calcLabel}>PPN (10%)</Text>
            <Text style={styles.calcValue}>{formatRupiah(cartTax)}</Text>
          </View>
          <View style={styles.totalRow}>
            <Text style={styles.totalLabel}>Total Akhir</Text>
            <Text style={styles.totalValue}>{formatRupiah(finalTotal)}</Text>
          </View>
        </View>

        {/* Tombol Bayar */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleProcessCheckout}
          disabled={cart.length === 0}
          style={[styles.payBtn, cart.length === 0 && styles.payBtnDisabled]}
        >
          <CheckIcon size={18} color="#ffffff" />
          <Text style={styles.payBtnText}>Selesaikan Pembayaran</Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      {isWideScreen ? (
        /* ================= TAMPILAN DESKTOP LEBAR (2 KOLOM SAMPING) ================= */
        <View style={styles.desktopContainer}>
          {/* Kolom Kiri: Item Belanja */}
          <View style={styles.desktopLeftCol}>
            <View style={styles.sectionHeader}>
              <View>
                <Text style={styles.sectionTitle}>Item Belanja</Text>
                <Text style={styles.sectionSubtitle}>
                  {cartTotalQty > 0 ? `${cartTotalQty} item dalam pesanan` : 'Daftar pesanan aktif'}
                </Text>
              </View>
              {cart.length > 0 && (
                <TouchableOpacity activeOpacity={0.7} onPress={clearCart}>
                  <Text style={styles.clearText}>Kosongkan</Text>
                </TouchableOpacity>
              )}
            </View>

            <ScrollView contentContainerStyle={styles.desktopItemScroll}>
              {renderCartItems()}
            </ScrollView>
          </View>

          {/* Kolom Kanan: Ringkasan Pembayaran */}
          <ScrollView style={styles.desktopRightCol}>
            {renderCheckoutForm()}
          </ScrollView>
        </View>
      ) : (
        /* ================= TAMPILAN MOBILE & TABLET (1 ALIRAN VERTIKAL BEBAS KORUPSI) ================= */
        <ScrollView
          style={styles.mobileScroll}
          contentContainerStyle={styles.mobileScrollContent}
        >
          {/* Header Section */}
          <View style={styles.sectionHeader}>
            <View>
              <Text style={styles.sectionTitle}>Item Belanja</Text>
              <Text style={styles.sectionSubtitle}>
                {cartTotalQty > 0 ? `${cartTotalQty} item dalam pesanan` : 'Daftar pesanan aktif'}
              </Text>
            </View>
            {cart.length > 0 && (
              <TouchableOpacity activeOpacity={0.7} onPress={clearCart}>
                <Text style={styles.clearText}>Kosongkan</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Daftar Item */}
          <View style={styles.mobileItemsBlock}>
            {renderCartItems()}
          </View>

          {/* Ringkasan Pembayaran berada tepat di bawah daftar item belanja */}
          {cart.length > 0 && (
            <View style={styles.mobileCheckoutBlock}>
              {renderCheckoutForm()}
            </View>
          )}
        </ScrollView>
      )}

      {/* Modal Struk Transaksi Sukses */}
      <Modal
        visible={!!completedTransaction}
        transparent
        animationType="fade"
        onRequestClose={() => setCompletedTransaction(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.receiptHeader}>
              <View style={styles.successIconCircle}>
                <CheckIcon size={24} color="#059669" />
              </View>
              <Text style={styles.receiptTitle}>Transaksi Berhasil!</Text>
              <Text style={styles.receiptInvoice}>{completedTransaction?.invoiceNumber}</Text>
              <Text style={styles.receiptDate}>
                {completedTransaction ? formatDateTime(completedTransaction.date) : ''}
              </Text>
            </View>

            {/* List Item */}
            <ScrollView style={styles.receiptItemsScroll}>
              {completedTransaction?.items.map((item) => (
                <View key={item.id} style={styles.receiptItemRow}>
                  <Text style={styles.receiptItemName}>
                    {item.name} x{item.quantity}
                  </Text>
                  <Text style={styles.receiptItemSubtotal}>{formatRupiah(item.subtotal)}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Total Finansial */}
            <View style={styles.receiptSummary}>
              <View style={styles.receiptRow}>
                <Text style={styles.receiptSubtext}>Total Tagihan</Text>
                <Text style={styles.receiptGrandTotal}>
                  {formatRupiah(completedTransaction?.total || 0)}
                </Text>
              </View>
              {completedTransaction?.paymentMethod === 'Cash' && (
                <View style={styles.receiptRow}>
                  <Text style={styles.receiptSubtext}>Kembalian</Text>
                  <Text style={styles.receiptChange}>
                    {formatRupiah(completedTransaction?.change || 0)}
                  </Text>
                </View>
              )}
            </View>

            {/* Aksi Modal */}
            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setCompletedTransaction(null);
                  setActiveTab('kasir');
                }}
                style={styles.modalBtnSecondary}
              >
                <Text style={styles.modalBtnSecondaryText}>Transaksi Baru</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => {
                  setCompletedTransaction(null);
                  setActiveTab('riwayat');
                }}
                style={styles.modalBtnPrimary}
              >
                <Text style={styles.modalBtnPrimaryText}>Cek Riwayat</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },

  /* Desktop layout (2 Kolom) */
  desktopContainer: {
    flex: 1,
    flexDirection: 'row',
  },
  desktopLeftCol: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  desktopItemScroll: {
    padding: 16,
  },
  desktopRightCol: {
    width: 380,
    backgroundColor: '#ffffff',
    padding: 16,
  },

  /* Mobile & Tablet layout (1 ScrollView Vertikal) */
  mobileScroll: {
    flex: 1,
  },
  mobileScrollContent: {
    paddingBottom: 40,
  },
  mobileItemsBlock: {
    padding: 12,
  },
  mobileCheckoutBlock: {
    paddingHorizontal: 12,
    marginTop: 8,
  },

  /* Header Bagian */
  sectionHeader: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#e11d48',
  },

  /* Daftar Item & Kartu Item */
  itemListWrapper: {
    gap: 10,
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  cartCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  skuBadge: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  skuBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  deleteBtn: {
    padding: 4,
  },
  cartItemName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0f172a',
    lineHeight: 20,
  },
  cartItemPrice: {
    fontSize: 12,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
    marginBottom: 12,
  },
  cartCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
    paddingTop: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 3,
  },
  qtyBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  qtyNumber: {
    width: 32,
    textAlign: 'center',
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  subtotalCol: {
    alignItems: 'flex-end',
  },
  subtotalLabel: {
    fontSize: 10,
    color: '#94a3b8',
    fontWeight: '500',
  },
  itemSubtotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },

  /* Empty Cart State */
  emptyCart: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ffffff',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderStyle: 'dashed',
    margin: 4,
  },
  emptyCartIcon: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 260,
  },
  backToKasirBtn: {
    marginTop: 16,
    backgroundColor: '#059669',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backToKasirText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },

  /* Form Checkout / Ringkasan */
  checkoutCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  checkoutTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
    marginBottom: 14,
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 6,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 8,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
  },
  methodBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  methodBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  methodBtnTextActive: {
    color: '#ffffff',
    fontWeight: '700',
  },
  cashBox: {
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 14,
  },
  cashLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 6,
  },
  cashInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  quickCashRow: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 8,
  },
  quickCashBtn: {
    flex: 1,
    backgroundColor: '#e2e8f0',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickCashText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  changeLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#059669',
  },
  changeAmount: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  calcContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 12,
    gap: 8,
    marginBottom: 16,
  },
  calcRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  calcLabel: {
    fontSize: 12,
    color: '#64748b',
  },
  calcValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#0f172a',
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#059669',
  },
  payBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  payBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '700',
  },

  /* Modal Struk */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  modalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 20,
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  receiptHeader: {
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 12,
  },
  successIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  receiptTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0f172a',
  },
  receiptInvoice: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#64748b',
    marginTop: 2,
  },
  receiptDate: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  receiptItemsScroll: {
    maxHeight: 140,
    marginVertical: 10,
  },
  receiptItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  receiptItemName: {
    fontSize: 11,
    color: '#334155',
  },
  receiptItemSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  receiptSummary: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    gap: 4,
  },
  receiptRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  receiptSubtext: {
    fontSize: 11,
    color: '#64748b',
  },
  receiptGrandTotal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  receiptChange: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalBtnSecondary: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnSecondaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalBtnPrimary: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnPrimaryText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
});
