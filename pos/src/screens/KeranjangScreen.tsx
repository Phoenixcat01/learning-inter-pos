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
import { PlusIcon, MinusIcon, TrashIcon, CheckIcon, CloseIcon } from '../components/Icons';
import { formatRupiah, formatDateTime, showPOSAlert } from '../utils/format';

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

  const { width } = useWindowDimensions();
  const isDesktop = width >= 768;

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

  return (
    <View style={[styles.container, isDesktop ? styles.containerDesktop : styles.containerMobile]}>
      {/* Items Section */}
      <View style={styles.itemsSection}>
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>Item Belanja</Text>
            <Text style={styles.sectionSubtitle}>Daftar pesanan aktif</Text>
          </View>
          {cart.length > 0 && (
            <TouchableOpacity activeOpacity={0.7} onPress={clearCart}>
              <Text style={styles.clearText}>Kosongkan</Text>
            </TouchableOpacity>
          )}
        </View>

        <ScrollView contentContainerStyle={styles.itemList}>
          {cart.length === 0 ? (
            <View style={styles.emptyCart}>
              <View style={styles.emptyCartIcon}>
                <TrashIcon size={32} color="#94a3b8" />
              </View>
              <Text style={styles.emptyTitle}>Keranjang Masih Kosong</Text>
              <Text style={styles.emptySubtitle}>
                Pilih menu di Kasir untuk memasukkan item ke keranjang.
              </Text>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setActiveTab('kasir')}
                style={styles.backToKasirBtn}
              >
                <Text style={styles.backToKasirText}>Buka Kasir</Text>
              </TouchableOpacity>
            </View>
          ) : (
            cart.map((item) => (
              <View key={item.product.id} style={styles.cartCard}>
                <View style={styles.cartCardInfo}>
                  <Text style={styles.cartItemCategory}>
                    {item.product.category} • {item.product.sku}
                  </Text>
                  <Text style={styles.cartItemName}>{item.product.name}</Text>
                  <Text style={styles.cartItemPrice}>{formatRupiah(item.product.price)}</Text>
                </View>

                {/* Controls */}
                <View style={styles.cartCardControls}>
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

                  <Text style={styles.itemSubtotal}>{formatRupiah(item.subtotal)}</Text>

                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => removeFromCart(item.product.id)}
                    style={styles.deleteBtn}
                  >
                    <TrashIcon size={18} color="#e11d48" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>

      {/* Checkout Sidebar/Bottom */}
      <ScrollView style={[styles.checkoutSection, isDesktop && styles.checkoutSectionDesktop]}>
        <Text style={styles.checkoutTitle}>Ringkasan Pembayaran</Text>

        {/* Customer Name */}
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

        {/* Payment Method */}
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

        {/* Cash Input */}
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

        {/* Calculation */}
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

        {/* Checkout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleProcessCheckout}
          disabled={cart.length === 0}
          style={[styles.payBtn, cart.length === 0 && styles.payBtnDisabled]}
        >
          <CheckIcon size={18} color="#ffffff" />
          <Text style={styles.payBtnText}>Selesaikan Pembayaran</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Success Receipt Modal */}
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

            {/* Item List */}
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

            {/* Financial Summary */}
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

            {/* Modal Actions */}
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
  containerDesktop: {
    flexDirection: 'row',
  },
  containerMobile: {
    flexDirection: 'column',
  },
  itemsSection: {
    flex: 1,
    borderRightWidth: 1,
    borderRightColor: '#e2e8f0',
  },
  sectionHeader: {
    padding: 14,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    backgroundColor: '#ffffff',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
  },
  sectionSubtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 1,
  },
  clearText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#e11d48',
  },
  itemList: {
    padding: 12,
    gap: 8,
  },
  emptyCart: {
    padding: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCartIcon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#f1f5f9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
    maxWidth: 240,
  },
  backToKasirBtn: {
    marginTop: 16,
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  backToKasirText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  cartCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  cartCardInfo: {
    flex: 1,
    paddingRight: 8,
  },
  cartItemCategory: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94a3b8',
    textTransform: 'uppercase',
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 2,
  },
  cartItemPrice: {
    fontSize: 11,
    fontWeight: '600',
    color: '#059669',
    marginTop: 2,
  },
  cartCardControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  qtyBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    padding: 2,
  },
  qtyBtn: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#ffffff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  qtyNumber: {
    width: 28,
    textAlign: 'center',
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  itemSubtotal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#0f172a',
    minWidth: 70,
    textAlign: 'right',
  },
  deleteBtn: {
    padding: 4,
  },
  checkoutSection: {
    padding: 16,
    backgroundColor: '#ffffff',
  },
  checkoutSectionDesktop: {
    width: 340,
  },
  checkoutTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#0f172a',
    marginBottom: 12,
  },
  inputGroup: {
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  textInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  methodRow: {
    flexDirection: 'row',
    gap: 6,
  },
  methodBtn: {
    flex: 1,
    paddingVertical: 8,
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
    fontSize: 11,
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
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    marginBottom: 12,
  },
  cashLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 4,
  },
  cashInput: {
    backgroundColor: '#ffffff',
    borderWidth: 1,
    borderColor: '#cbd5e1',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 14,
    fontWeight: '700',
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
    paddingVertical: 4,
    borderRadius: 6,
    alignItems: 'center',
  },
  quickCashText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  changeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  changeLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  changeAmount: {
    fontSize: 12,
    fontWeight: '800',
    color: '#059669',
  },
  calcContainer: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 10,
    gap: 6,
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
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  totalLabel: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  totalValue: {
    fontSize: 15,
    fontWeight: '800',
    color: '#059669',
  },
  payBtn: {
    backgroundColor: '#059669',
    borderRadius: 12,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 20,
  },
  payBtnDisabled: {
    backgroundColor: '#cbd5e1',
  },
  payBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
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
