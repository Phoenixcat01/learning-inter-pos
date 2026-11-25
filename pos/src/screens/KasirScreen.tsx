import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  StyleSheet,
  useWindowDimensions,
} from 'react-native';
import { usePOS } from '../context/POSContext';
import { Category } from '../types';
import { SearchIcon, PlusIcon, CartIcon, BarcodeIcon } from '../components/Icons';
import { formatRupiah } from '../utils/format';

const CATEGORIES: Category[] = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Paket'];

interface ToastState {
  type: 'success' | 'warning' | 'error';
  message: string;
}

export const KasirScreen: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    scanBarcodeToCart,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    cartTotalQty,
    cartGrandTotal,
  } = usePOS();

  const { width } = useWindowDimensions();
  const numColumns = width >= 1024 ? 4 : width >= 768 ? 3 : width >= 480 ? 2 : 1;

  const [scanValue, setScanValue] = useState<string>('');
  const [isScannerFocused, setIsScannerFocused] = useState<boolean>(true);
  const [toast, setToast] = useState<ToastState | null>(null);
  const scannerInputRef = useRef<React.ComponentRef<typeof TextInput>>(null);
  const toastTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (toastTimerRef.current) {
        clearTimeout(toastTimerRef.current);
      }
    };
  }, []);

  const showToast = (type: ToastState['type'], message: string) => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
    }
    setToast({ type, message });
    toastTimerRef.current = setTimeout(() => {
      setToast(null);
    }, 2500);
  };

  const focusScanner = () => {
    scannerInputRef.current?.focus();
  };

  const handleBarcodeSubmit = () => {
    const code = scanValue.trim();
    setScanValue('');

    if (!code) {
      setTimeout(() => scannerInputRef.current?.focus(), 50);
      return;
    }

    const result = scanBarcodeToCart(code);
    if (result.success && result.product) {
      showToast('success', `✓ ${result.product.name} berhasil dimasukkan ke keranjang`);
    } else if (result.reason === 'out_of_stock' || result.reason === 'max_stock') {
      showToast(
        'warning',
        `Stok ${result.product?.name ?? 'produk'} habis atau sudah mencapai batas maksimal`
      );
    } else if (result.reason === 'not_found') {
      showToast('error', `Barcode ${code} tidak ditemukan`);
    }

    setTimeout(() => {
      scannerInputRef.current?.focus();
    }, 50);
  };

  const filteredProducts = products.filter((prod) => {
    const matchCategory =
      selectedCategory === 'Semua' || prod.category === selectedCategory;
    const q = searchQuery.toLowerCase();
    const matchSearch =
      prod.name.toLowerCase().includes(q) ||
      prod.sku.toLowerCase().includes(q) ||
      (prod.barcode && prod.barcode.toLowerCase().includes(q)) ||
      (prod.description && prod.description.toLowerCase().includes(q));
    return matchCategory && matchSearch;
  });

  const getItemCartQty = (productId: string): number => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <View style={styles.container}>
      {/* Top Filter & Search */}
      <View style={styles.filterSection}>
        {/* Category Scroll */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryScroll}
        >
          {CATEGORIES.map((cat) => {
            const isSelected = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryChip, isSelected && styles.categoryChipActive]}
              >
                <Text
                  style={[styles.categoryText, isSelected && styles.categoryTextActive]}
                >
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {/* Scanner Input (Bluetooth HID Keyboard) */}
        <View
          style={[
            styles.scannerWrapper,
            isScannerFocused ? styles.scannerWrapperActive : styles.scannerWrapperIdle,
          ]}
        >
          <BarcodeIcon size={18} color={isScannerFocused ? '#059669' : '#64748b'} />
          <TextInput
            ref={scannerInputRef}
            value={scanValue}
            onChangeText={setScanValue}
            onSubmitEditing={handleBarcodeSubmit}
            onFocus={() => setIsScannerFocused(true)}
            onBlur={() => setIsScannerFocused(false)}
            autoFocus
            showSoftInputOnFocus={false}
            blurOnSubmit={false}
            returnKeyType="done"
            placeholder="Scan barcode produk (HID Scanner) atau ketik + Enter..."
            placeholderTextColor="#94a3b8"
            style={styles.scannerInput}
          />
          <TouchableOpacity
            activeOpacity={0.7}
            onPress={focusScanner}
            style={[
              styles.scannerStatusPill,
              isScannerFocused ? styles.scannerPillActive : styles.scannerPillIdle,
            ]}
          >
            <View
              style={[
                styles.scannerDot,
                { backgroundColor: isScannerFocused ? '#10b981' : '#94a3b8' },
              ]}
            />
            <Text
              style={[
                styles.scannerStatusText,
                isScannerFocused ? styles.scannerStatusTextActive : styles.scannerStatusTextIdle,
              ]}
            >
              {isScannerFocused ? 'Scanner Siap' : 'Aktifkan Scan'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Search Input (Manual) */}
        <View style={styles.searchWrapper}>
          <SearchIcon size={16} color="#94a3b8" />
          <TextInput
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholder="Cari manual nama, SKU, atau barcode..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>
      </View>

      {/* Toast Notification Banner */}
      {toast && (
        <View
          style={[
            styles.toastBanner,
            toast.type === 'success'
              ? styles.toastSuccess
              : toast.type === 'warning'
              ? styles.toastWarning
              : styles.toastError,
          ]}
        >
          <Text
            style={[
              styles.toastText,
              toast.type === 'success'
                ? styles.toastTextSuccess
                : toast.type === 'warning'
                ? styles.toastTextWarning
                : styles.toastTextError,
            ]}
          >
            {toast.message}
          </Text>
        </View>
      )}

      {/* Product Grid Area */}
      <ScrollView contentContainerStyle={styles.gridContent}>
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Tidak ada produk ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              Coba gunakan kata kunci pencarian atau kategori lain.
            </Text>
          </View>
        ) : (
          <View style={styles.gridContainer}>
            {filteredProducts.map((product) => {
              const inCartQty = getItemCartQty(product.id);
              const isOutOfStock = product.stock <= 0;

              return (
                <View
                  key={product.id}
                  style={[
                    styles.card,
                    {
                      width:
                        numColumns === 1
                          ? '100%'
                          : numColumns === 2
                          ? '48.5%'
                          : numColumns === 3
                          ? '31.8%'
                          : '23.8%',
                    },
                  ]}
                >
                  {/* Card Header */}
                  <View style={styles.cardHeader}>
                    <View style={styles.categoryBadge}>
                      <Text style={styles.categoryBadgeText}>{product.category}</Text>
                    </View>
                    <Text
                      style={[
                        styles.stockText,
                        isOutOfStock ? styles.stockOut : product.stock <= 5 ? styles.stockLow : null,
                      ]}
                    >
                      {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
                    </Text>
                  </View>

                  {/* Product Details */}
                  <Text style={styles.productName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.productSku}>{product.sku}</Text>

                  {product.description ? (
                    <Text style={styles.productDesc} numberOfLines={2}>
                      {product.description}
                    </Text>
                  ) : null}

                  {/* Card Footer */}
                  <View style={styles.cardFooter}>
                    <View>
                      <Text style={styles.priceLabel}>Harga</Text>
                      <Text style={styles.priceValue}>{formatRupiah(product.price)}</Text>
                    </View>

                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() => addToCart(product)}
                      disabled={isOutOfStock}
                      style={[
                        styles.addBtn,
                        isOutOfStock
                          ? styles.addBtnDisabled
                          : inCartQty > 0
                          ? styles.addBtnInCart
                          : styles.addBtnNormal,
                      ]}
                    >
                      <PlusIcon size={14} color={inCartQty > 0 ? '#ffffff' : '#047857'} />
                      <Text
                        style={[
                          styles.addBtnText,
                          inCartQty > 0 ? styles.addBtnTextInCart : styles.addBtnTextNormal,
                        ]}
                      >
                        {inCartQty > 0 ? `+ (${inCartQty})` : 'Tambah'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              );
            })}
          </View>
        )}
      </ScrollView>

      {/* Floating Bottom Bar when Cart has items */}
      {cartTotalQty > 0 && (
        <View style={styles.bottomBar}>
          <View style={styles.bottomBarLeft}>
            <View style={styles.cartCountCircle}>
              <Text style={styles.cartCountText}>{cartTotalQty}</Text>
            </View>
            <View>
              <Text style={styles.bottomBarCount}>{cartTotalQty} item di keranjang</Text>
              <Text style={styles.bottomBarTotal}>{formatRupiah(cartGrandTotal)}</Text>
            </View>
          </View>

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => setActiveTab('keranjang')}
            style={styles.checkoutBtn}
          >
            <CartIcon size={16} color="#ffffff" />
            <Text style={styles.checkoutBtnText}>Buka Keranjang</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  filterSection: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  categoryScroll: {
    gap: 8,
    paddingVertical: 2,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 20,
    backgroundColor: '#f1f5f9',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  categoryChipActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  categoryText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#475569',
  },
  categoryTextActive: {
    color: '#ffffff',
  },
  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f8fafc',
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 40,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#0f172a',
    height: '100%',
  },
  gridContent: {
    padding: 12,
    paddingBottom: 80,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    justifyContent: 'space-between',
    minHeight: 150,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  categoryBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    backgroundColor: '#f1f5f9',
  },
  categoryBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  stockText: {
    fontSize: 10,
    color: '#64748b',
    fontWeight: '500',
  },
  stockOut: {
    color: '#e11d48',
    fontWeight: '700',
  },
  stockLow: {
    color: '#d97706',
    fontWeight: '600',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
  },
  productSku: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
    fontFamily: 'monospace',
  },
  productDesc: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 4,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#f1f5f9',
  },
  priceLabel: {
    fontSize: 9,
    color: '#94a3b8',
  },
  priceValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
    gap: 4,
  },
  addBtnNormal: {
    backgroundColor: '#ecfdf5',
    borderWidth: 1,
    borderColor: '#a7f3d0',
  },
  addBtnInCart: {
    backgroundColor: '#059669',
  },
  addBtnDisabled: {
    backgroundColor: '#f1f5f9',
  },
  addBtnText: {
    fontSize: 11,
    fontWeight: '700',
  },
  addBtnTextNormal: {
    color: '#047857',
  },
  addBtnTextInCart: {
    color: '#ffffff',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#475569',
  },
  emptySubtitle: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
  bottomBar: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#ffffff',
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  bottomBarLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  cartCountCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#ecfdf5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartCountText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#059669',
  },
  bottomBarCount: {
    fontSize: 11,
    color: '#64748b',
  },
  bottomBarTotal: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0f172a',
  },
  checkoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    gap: 6,
  },
  checkoutBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  scannerWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 42,
    gap: 8,
  },
  scannerWrapperActive: {
    backgroundColor: '#ecfdf5',
    borderColor: '#10b981',
  },
  scannerWrapperIdle: {
    backgroundColor: '#f8fafc',
    borderColor: '#cbd5e1',
  },
  scannerInput: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'monospace',
    color: '#0f172a',
    height: '100%',
  },
  scannerStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 5,
  },
  scannerPillActive: {
    backgroundColor: '#d1fae5',
  },
  scannerPillIdle: {
    backgroundColor: '#e2e8f0',
  },
  scannerDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  scannerStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  scannerStatusTextActive: {
    color: '#047857',
  },
  scannerStatusTextIdle: {
    color: '#475569',
  },
  toastBanner: {
    marginHorizontal: 12,
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1,
  },
  toastSuccess: {
    backgroundColor: '#ecfdf5',
    borderColor: '#6ee7b7',
  },
  toastWarning: {
    backgroundColor: '#fffbeb',
    borderColor: '#fcd34d',
  },
  toastError: {
    backgroundColor: '#fef2f2',
    borderColor: '#fca5a5',
  },
  toastText: {
    fontSize: 12,
    fontWeight: '700',
  },
  toastTextSuccess: {
    color: '#065f46',
  },
  toastTextWarning: {
    color: '#92400e',
  },
  toastTextError: {
    color: '#991b1b',
  },
});
