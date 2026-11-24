import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
} from 'react-native';
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
    <View style={styles.container}>
      {/* Top Stats Banner */}
      <View style={styles.statsRow}>
        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Total Pendapatan</Text>
          <Text style={[styles.statValue, styles.statValueGreen]}>{formatRupiah(totalRevenue)}</Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Jumlah Transaksi</Text>
          <Text style={styles.statValue}>
            {transactions.length}{' '}
            <Text style={styles.statSub}>({totalItemsSold} pcs)</Text>
          </Text>
        </View>

        <View style={styles.statCard}>
          <Text style={styles.statLabel}>Rata-Rata Transaksi</Text>
          <Text style={styles.statValue}>{formatRupiah(avgTransaction)}</Text>
        </View>
      </View>

      {/* Search Bar */}
      <View style={styles.searchSection}>
        <View style={styles.searchBox}>
          <SearchIcon size={16} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nomor nota atau pelanggan..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Transactions List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {filteredTransactions.length === 0 ? (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconCircle}>
              <HistoryIcon size={32} color="#94a3b8" />
            </View>
            <Text style={styles.emptyTitle}>Belum Ada Riwayat Transaksi</Text>
            <Text style={styles.emptySubtitle}>
              Transaksi yang selesai di Kasir akan tercatat di sini secara otomatis.
            </Text>
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setActiveTab('kasir')}
              style={styles.startBtn}
            >
              <Text style={styles.startBtnText}>Mulai Transaksi</Text>
            </TouchableOpacity>
          </View>
        ) : (
          filteredTransactions.map((trx) => (
            <TouchableOpacity
              key={trx.id}
              activeOpacity={0.7}
              onPress={() => setSelectedTrx(trx)}
              style={styles.trxCard}
            >
              <View style={styles.trxCardTop}>
                <View>
                  <Text style={styles.invoiceNumber}>{trx.invoiceNumber}</Text>
                  <Text style={styles.customerName}>{trx.customerName || 'Pelanggan Umum'}</Text>
                </View>
                <View style={styles.paymentBadge}>
                  <Text style={styles.paymentBadgeText}>{trx.paymentMethod}</Text>
                </View>
              </View>

              <View style={styles.trxCardDivider} />

              <View style={styles.trxCardBottom}>
                <View>
                  <Text style={styles.trxDate}>{formatDateTime(trx.date)}</Text>
                  <Text style={styles.trxItemCount}>
                    {trx.items.length} jenis item ({trx.items.reduce((s, i) => s + i.quantity, 0)} pcs)
                  </Text>
                </View>
                <View style={styles.trxTotalCol}>
                  <Text style={styles.trxTotalLabel}>Total</Text>
                  <Text style={styles.trxTotalValue}>{formatRupiah(trx.total)}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Transaction Detail Modal */}
      <Modal
        visible={!!selectedTrx}
        transparent
        animationType="fade"
        onRequestClose={() => setSelectedTrx(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Detail Transaksi</Text>
                <Text style={styles.modalSubtitle}>{selectedTrx?.invoiceNumber}</Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setSelectedTrx(null)}>
                <CloseIcon size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalMeta}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Waktu:</Text>
                <Text style={styles.metaValue}>
                  {selectedTrx ? formatDateTime(selectedTrx.date) : ''}
                </Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Pelanggan:</Text>
                <Text style={styles.metaValue}>{selectedTrx?.customerName}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Metode Bayar:</Text>
                <Text style={styles.metaValue}>{selectedTrx?.paymentMethod}</Text>
              </View>
            </View>

            {/* Items */}
            <ScrollView style={styles.modalItemsScroll}>
              {selectedTrx?.items.map((item) => (
                <View key={item.id} style={styles.modalItemRow}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalItemName}>{item.name}</Text>
                    <Text style={styles.modalItemSub}>
                      {item.quantity} x {formatRupiah(item.price)}
                    </Text>
                  </View>
                  <Text style={styles.modalItemTotal}>{formatRupiah(item.subtotal)}</Text>
                </View>
              ))}
            </ScrollView>

            {/* Financial Breakdown */}
            <View style={styles.modalBreakdown}>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>Subtotal</Text>
                <Text style={styles.metaValue}>{formatRupiah(selectedTrx?.subtotal || 0)}</Text>
              </View>
              <View style={styles.metaRow}>
                <Text style={styles.metaLabel}>PPN (10%)</Text>
                <Text style={styles.metaValue}>{formatRupiah(selectedTrx?.tax || 0)}</Text>
              </View>
              <View style={[styles.metaRow, styles.metaRowTotal]}>
                <Text style={styles.modalTotalLabel}>Total Bayar</Text>
                <Text style={styles.modalTotalValue}>{formatRupiah(selectedTrx?.total || 0)}</Text>
              </View>
            </View>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => setSelectedTrx(null)}
              style={styles.closeBtn}
            >
              <Text style={styles.closeBtnText}>Tutup</Text>
            </TouchableOpacity>
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
  statsRow: {
    flexDirection: 'row',
    padding: 12,
    gap: 8,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  statCard: {
    flex: 1,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  statLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    textTransform: 'uppercase',
  },
  statValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    marginTop: 2,
  },
  statValueGreen: {
    color: '#059669',
  },
  statSub: {
    fontSize: 9,
    fontWeight: '500',
    color: '#64748b',
  },
  searchSection: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    height: 38,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyIconCircle: {
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
    maxWidth: 260,
  },
  startBtn: {
    marginTop: 16,
    backgroundColor: '#059669',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 12,
  },
  startBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  trxCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  trxCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  invoiceNumber: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
    fontFamily: 'monospace',
  },
  customerName: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  paymentBadge: {
    backgroundColor: '#ecfdf5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  paymentBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#059669',
  },
  trxCardDivider: {
    height: 1,
    backgroundColor: '#f1f5f9',
    marginVertical: 10,
  },
  trxCardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  trxDate: {
    fontSize: 11,
    color: '#64748b',
  },
  trxItemCount: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 1,
  },
  trxTotalCol: {
    alignItems: 'flex-end',
  },
  trxTotalLabel: {
    fontSize: 9,
    color: '#94a3b8',
  },
  trxTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
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
    borderRadius: 18,
    width: '100%',
    maxWidth: 380,
    padding: 20,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748b',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  modalMeta: {
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#f1f5f9',
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaLabel: {
    fontSize: 11,
    color: '#64748b',
  },
  metaValue: {
    fontSize: 11,
    fontWeight: '600',
    color: '#0f172a',
  },
  modalItemsScroll: {
    maxHeight: 140,
    marginVertical: 10,
  },
  modalItemRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  modalItemName: {
    fontSize: 11,
    fontWeight: '600',
    color: '#1e293b',
  },
  modalItemSub: {
    fontSize: 10,
    color: '#94a3b8',
  },
  modalItemTotal: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalBreakdown: {
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    paddingTop: 8,
    gap: 4,
  },
  metaRowTotal: {
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  modalTotalLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
  modalTotalValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#059669',
  },
  closeBtn: {
    marginTop: 14,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  closeBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
});
