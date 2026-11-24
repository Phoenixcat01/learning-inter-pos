import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
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
          weekday: 'short',
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
    <View style={styles.header}>
      <View>
        <Text style={styles.title}>{getTabTitle()}</Text>
        <Text style={styles.subtitle}>{currentDateTime || 'Memuat waktu...'}</Text>
      </View>

      <TouchableOpacity
        activeOpacity={0.7}
        onPress={() => setActiveTab('keranjang')}
        style={[styles.cartPill, activeTab === 'keranjang' && styles.cartPillActive]}
      >
        <View style={styles.cartIconWrapper}>
          <CartIcon size={20} color={activeTab === 'keranjang' ? '#047857' : '#334155'} />
          {cartTotalQty > 0 && (
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{cartTotalQty}</Text>
            </View>
          )}
        </View>
        <View>
          <Text style={styles.cartLabel}>TOTAL</Text>
          <Text style={styles.cartAmount}>{formatRupiah(cartGrandTotal)}</Text>
        </View>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  header: {
    height: 64,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingHorizontal: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
  },
  subtitle: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  cartPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 6,
    gap: 8,
  },
  cartPillActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  cartIconWrapper: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -5,
    right: -8,
    backgroundColor: '#059669',
    width: 16,
    height: 16,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#ffffff',
  },
  cartLabel: {
    fontSize: 9,
    fontWeight: '700',
    color: '#64748b',
    letterSpacing: 0.5,
  },
  cartAmount: {
    fontSize: 12,
    fontWeight: '700',
    color: '#0f172a',
  },
});
