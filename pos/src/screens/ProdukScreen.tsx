import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Modal,
  StyleSheet,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { usePOS } from '../context/POSContext';
import { Category, Product } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CloseIcon, BarcodeIcon } from '../components/Icons';
import { BarcodeView } from '../components/BarcodeView';
import { formatRupiah, generateBarcodeNumber, showPOSAlert } from '../utils/format';

const CATEGORIES: Category[] = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Paket'];

export const ProdukScreen: React.FC = () => {
  const {
    products,
    isLoadingProducts,
    productsError,
    reloadProducts,
    addProduct,
    updateProduct,
    deleteProduct,
  } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<Category>('Semua');
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [barcodeProduct, setBarcodeProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<Category>('Makanan');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formBarcode, setFormBarcode] = useState<string>('');
  const [formDescription, setFormDescription] = useState<string>('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Makanan');
    setFormPrice(15000);
    setFormStock(20);
    setFormBarcode(generateBarcodeNumber());
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormBarcode(p.barcode || generateBarcodeNumber());
    setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      showPOSAlert('Validasi', 'Nama produk tidak boleh kosong!');
      return;
    }
    if (formPrice <= 0) {
      showPOSAlert('Validasi', 'Harga produk harus lebih dari 0!');
      return;
    }

    const finalBarcode = formBarcode.trim() || generateBarcodeNumber();
    setIsSaving(true);

    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, {
          name: formName.trim(),
          category: formCategory,
          price: formPrice,
          stock: formStock,
          barcode: finalBarcode,
          description: formDescription.trim(),
        });
      } else {
        await addProduct({
          name: formName.trim(),
          category: formCategory,
          price: formPrice,
          stock: formStock,
          barcode: finalBarcode,
          description: formDescription.trim(),
        });
      }
      setIsModalOpen(false);
    } catch (err: any) {
      showPOSAlert('Gagal Menyimpan', err.message || 'Terjadi kesalahan saat menyimpan produk.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = (p: Product) => {
    const executeDelete = async () => {
      try {
        await deleteProduct(p.id);
      } catch (err: any) {
        showPOSAlert('Gagal Menghapus', err.message || 'Terjadi kesalahan saat menghapus produk.');
      }
    };

    if (Platform.OS === 'web') {
      if (typeof window !== 'undefined' && window.confirm) {
        if (window.confirm(`Hapus produk "${p.name}"?`)) {
          executeDelete();
        }
      } else {
        executeDelete();
      }
    } else {
      Alert.alert('Konfirmasi Hapus', `Apakah Anda yakin ingin menghapus "${p.name}"?`, [
        { text: 'Batal', style: 'cancel' },
        { text: 'Hapus', style: 'destructive', onPress: executeDelete },
      ]);
    }
  };

  const handleRefresh = () => {
    reloadProducts();
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase()) ||
      (p.barcode && p.barcode.toLowerCase().includes(search.toLowerCase()));
    return matchCat && matchSearch;
  });

  return (
    <View style={styles.container}>
      {/* Header Controls */}
      <View style={styles.controlsSection}>
        <View style={styles.topActions}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={openAddModal}
            style={styles.addBtn}
          >
            <PlusIcon size={16} color="#ffffff" />
            <Text style={styles.addBtnText}>Tambah Produk</Text>
          </TouchableOpacity>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={handleRefresh}
            style={styles.resetBtn}
          >
            <Text style={styles.resetBtnText}>Segarkan</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchBox}>
          <SearchIcon size={16} color="#94a3b8" />
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Cari nama atau SKU..."
            placeholderTextColor="#94a3b8"
            style={styles.searchInput}
          />
        </View>

        {/* Categories */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
          {CATEGORIES.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <TouchableOpacity
                key={cat}
                activeOpacity={0.7}
                onPress={() => setSelectedCategory(cat)}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
              >
                <Text style={[styles.categoryChipText, isActive && styles.categoryChipTextActive]}>
                  {cat}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Product List */}
      <ScrollView contentContainerStyle={styles.listContent}>
        {isLoadingProducts && products.length === 0 ? (
          <View style={styles.centerStateContainer}>
            <ActivityIndicator size="large" color="#059669" />
            <Text style={styles.stateTitle}>Memuat Data Produk...</Text>
            <Text style={styles.stateSubtitle}>Mengambil data dari Cloudflare D1</Text>
          </View>
        ) : productsError && products.length === 0 ? (
          <View style={styles.centerStateContainer}>
            <Text style={[styles.stateTitle, { color: '#ef4444' }]}>Gagal Memuat Produk</Text>
            <Text style={styles.stateSubtitle}>{productsError}</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={reloadProducts}
              style={styles.retryBtn}
            >
              <Text style={styles.retryBtnText}>Coba Lagi</Text>
            </TouchableOpacity>
          </View>
        ) : filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyTitle}>Tidak ada produk ditemukan</Text>
            <Text style={styles.emptySubtitle}>
              Belum ada produk terdaftar atau tidak cocok dengan pencarian.
            </Text>
          </View>
        ) : (
          filteredProducts.map((p) => (
          <View key={p.id} style={styles.productCard}>
            <View style={styles.productCardLeft}>
              <View style={styles.skuRow}>
                <Text style={styles.skuText}>{p.sku}</Text>
                <View style={styles.categoryPill}>
                  <Text style={styles.categoryPillText}>{p.category}</Text>
                </View>
              </View>
              <Text style={styles.productName}>{p.name}</Text>
              <View style={styles.barcodeChipRow}>
                <BarcodeIcon size={13} color="#475569" />
                <Text style={styles.barcodeChipText}>{p.barcode}</Text>
              </View>
              {p.description ? (
                <Text style={styles.productDesc} numberOfLines={1}>
                  {p.description}
                </Text>
              ) : null}
            </View>

            <View style={styles.productCardRight}>
              <Text style={styles.productPrice}>{formatRupiah(p.price)}</Text>
              <View
                style={[
                  styles.stockBadge,
                  p.stock <= 0
                    ? styles.stockBadgeOut
                    : p.stock <= 5
                    ? styles.stockBadgeLow
                    : styles.stockBadgeNormal,
                ]}
              >
                <Text
                  style={[
                    styles.stockBadgeText,
                    p.stock <= 0
                      ? styles.stockTextOut
                      : p.stock <= 5
                      ? styles.stockTextLow
                      : styles.stockTextNormal,
                  ]}
                >
                  {p.stock} pcs
                </Text>
              </View>

              <View style={styles.actionRow}>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => setBarcodeProduct(p)}
                  style={styles.actionBtn}
                >
                  <BarcodeIcon size={16} color="#0f172a" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => openEditModal(p)}
                  style={styles.actionBtn}
                >
                  <EditIcon size={16} color="#059669" />
                </TouchableOpacity>
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleDelete(p)}
                  style={styles.actionBtn}
                >
                  <TrashIcon size={16} color="#e11d48" />
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )))}
      </ScrollView>

      {/* Add / Edit Modal */}
      <Modal
        visible={isModalOpen}
        transparent
        animationType="fade"
        onRequestClose={() => setIsModalOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </Text>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setIsModalOpen(false)}>
                <CloseIcon size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalFormScroll}>
              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Nama Produk *</Text>
                <TextInput
                  value={formName}
                  onChangeText={setFormName}
                  placeholder="Contoh: Es Kopi Susu Aren"
                  placeholderTextColor="#94a3b8"
                  style={styles.formInput}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kategori</Text>
                <View style={styles.categorySelectRow}>
                  {(['Makanan', 'Minuman', 'Cemilan', 'Paket'] as Category[]).map((cat) => {
                    const isSelected = formCategory === cat;
                    return (
                      <TouchableOpacity
                        key={cat}
                        activeOpacity={0.7}
                        onPress={() => setFormCategory(cat)}
                        style={[styles.catSelectBtn, isSelected && styles.catSelectBtnActive]}
                      >
                        <Text style={[styles.catSelectText, isSelected && styles.catSelectTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>

              <View style={styles.formRow}>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Harga (Rp) *</Text>
                  <TextInput
                    value={formPrice ? String(formPrice) : ''}
                    onChangeText={(val) => setFormPrice(Number(val.replace(/[^0-9]/g, '')))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    style={styles.formInput}
                  />
                </View>
                <View style={[styles.formGroup, { flex: 1 }]}>
                  <Text style={styles.formLabel}>Stok Awal *</Text>
                  <TextInput
                    value={formStock ? String(formStock) : ''}
                    onChangeText={(val) => setFormStock(Number(val.replace(/[^0-9]/g, '')))}
                    keyboardType="numeric"
                    placeholder="0"
                    placeholderTextColor="#94a3b8"
                    style={styles.formInput}
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Kode Barcode (Code128)</Text>
                <View style={styles.barcodeInputRow}>
                  <TextInput
                    value={formBarcode}
                    onChangeText={setFormBarcode}
                    placeholder="Contoh: 8991002100018"
                    placeholderTextColor="#94a3b8"
                    style={[styles.formInput, { flex: 1, fontFamily: 'monospace' }]}
                  />
                  <TouchableOpacity
                    activeOpacity={0.7}
                    onPress={() => setFormBarcode(generateBarcodeNumber())}
                    style={styles.autoBarcodeBtn}
                  >
                    <Text style={styles.autoBarcodeBtnText}>Auto</Text>
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.formLabel}>Deskripsi Singkat</Text>
                <TextInput
                  value={formDescription}
                  onChangeText={setFormDescription}
                  placeholder="Keterangan bahan atau catatan produk..."
                  placeholderTextColor="#94a3b8"
                  multiline
                  numberOfLines={2}
                  style={[styles.formInput, { height: 60, textAlignVertical: 'top' }]}
                />
              </View>
            </ScrollView>

            <View style={styles.modalActions}>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setIsModalOpen(false)}
                style={styles.modalBtnCancel}
              >
                <Text style={styles.modalBtnCancelText}>Batal</Text>
              </TouchableOpacity>
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={handleSave}
                disabled={isSaving}
                style={[styles.modalBtnSave, isSaving && { opacity: 0.7 }]}
              >
                {isSaving ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.modalBtnSaveText}>Simpan Produk</Text>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Barcode Preview / Zoom / Print Modal */}
      <Modal
        visible={!!barcodeProduct}
        transparent
        animationType="fade"
        onRequestClose={() => setBarcodeProduct(null)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.barcodeModalCard}>
            <View style={styles.modalHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.modalTitle} numberOfLines={1}>
                  {barcodeProduct?.name}
                </Text>
                <Text style={styles.barcodeModalSub}>
                  {barcodeProduct?.sku} • {barcodeProduct ? formatRupiah(barcodeProduct.price) : ''}
                </Text>
              </View>
              <TouchableOpacity activeOpacity={0.7} onPress={() => setBarcodeProduct(null)}>
                <CloseIcon size={20} color="#64748b" />
              </TouchableOpacity>
            </View>

            <View style={styles.barcodePreviewArea}>
              {barcodeProduct && (
                <BarcodeView value={barcodeProduct.barcode} width={2.4} height={90} />
              )}
              <Text style={styles.barcodeHint}>
                Arahkan Bluetooth Barcode Scanner langsung ke gambar garis di atas.
              </Text>
            </View>

            <View style={styles.modalActions}>
              {Platform.OS === 'web' && (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => {
                    if (typeof window !== 'undefined' && window.print) {
                      window.print();
                    }
                  }}
                  style={styles.modalBtnSave}
                >
                  <Text style={styles.modalBtnSaveText}>Cetak Barcode</Text>
                </TouchableOpacity>
              )}
              <TouchableOpacity
                activeOpacity={0.7}
                onPress={() => setBarcodeProduct(null)}
                style={styles.modalBtnCancel}
              >
                <Text style={styles.modalBtnCancelText}>Tutup</Text>
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
  controlsSection: {
    padding: 12,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    gap: 10,
  },
  topActions: {
    flexDirection: 'row',
    gap: 8,
  },
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#059669',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    gap: 6,
  },
  addBtnText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: '700',
  },
  resetBtn: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  resetBtnText: {
    color: '#475569',
    fontSize: 12,
    fontWeight: '600',
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
  categoryScroll: {
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#f1f5f9',
  },
  categoryChipActive: {
    backgroundColor: '#0f172a',
  },
  categoryChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  categoryChipTextActive: {
    color: '#ffffff',
  },
  listContent: {
    padding: 12,
    gap: 8,
  },
  productCard: {
    backgroundColor: '#ffffff',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  productCardLeft: {
    flex: 1,
    paddingRight: 10,
  },
  skuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  skuText: {
    fontSize: 10,
    fontFamily: 'monospace',
    color: '#64748b',
  },
  categoryPill: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  categoryPillText: {
    fontSize: 8,
    fontWeight: '700',
    color: '#475569',
    textTransform: 'uppercase',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 4,
  },
  productDesc: {
    fontSize: 10,
    color: '#94a3b8',
    marginTop: 2,
  },
  productCardRight: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0f172a',
  },
  stockBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    marginTop: 4,
  },
  stockBadgeNormal: {
    backgroundColor: '#ecfdf5',
  },
  stockBadgeLow: {
    backgroundColor: '#fef3c7',
  },
  stockBadgeOut: {
    backgroundColor: '#ffe4e6',
  },
  stockBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  stockTextNormal: {
    color: '#059669',
  },
  stockTextLow: {
    color: '#d97706',
  },
  stockTextOut: {
    color: '#e11d48',
  },
  actionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 8,
  },
  actionBtn: {
    padding: 4,
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
    maxHeight: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#0f172a',
  },
  modalFormScroll: {
    paddingVertical: 12,
  },
  formGroup: {
    marginBottom: 10,
  },
  formRow: {
    flexDirection: 'row',
    gap: 10,
  },
  formLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  formInput: {
    borderWidth: 1,
    borderColor: '#e2e8f0',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: '#0f172a',
    backgroundColor: '#f8fafc',
  },
  categorySelectRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  catSelectBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    backgroundColor: '#f8fafc',
  },
  catSelectBtnActive: {
    backgroundColor: '#059669',
    borderColor: '#059669',
  },
  catSelectText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#475569',
  },
  catSelectTextActive: {
    color: '#ffffff',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  modalBtnCancel: {
    flex: 1,
    backgroundColor: '#f1f5f9',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnCancelText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  modalBtnSave: {
    flex: 1,
    backgroundColor: '#059669',
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  modalBtnSaveText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#ffffff',
  },
  barcodeChipRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 4,
  },
  barcodeChipText: {
    fontSize: 11,
    fontFamily: 'monospace',
    color: '#475569',
    fontWeight: '600',
  },
  barcodeInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  autoBarcodeBtn: {
    backgroundColor: '#e2e8f0',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  autoBarcodeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  barcodeModalCard: {
    backgroundColor: '#ffffff',
    borderRadius: 18,
    width: '100%',
    maxWidth: 420,
    padding: 20,
  },
  barcodeModalSub: {
    fontSize: 11,
    color: '#64748b',
    marginTop: 2,
  },
  barcodePreviewArea: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 20,
    paddingHorizontal: 8,
    backgroundColor: '#f8fafc',
    borderRadius: 12,
    marginTop: 12,
  },
  barcodeHint: {
    fontSize: 11,
    color: '#64748b',
    textAlign: 'center',
    marginTop: 12,
    maxWidth: 280,
  },
  centerStateContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
  },
  stateTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#0f172a',
    marginTop: 8,
  },
  stateSubtitle: {
    fontSize: 13,
    color: '#64748b',
    textAlign: 'center',
    maxWidth: 320,
  },
  retryBtn: {
    marginTop: 8,
    backgroundColor: '#059669',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 10,
  },
  retryBtnText: {
    color: '#ffffff',
    fontSize: 13,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#334155',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94a3b8',
    marginTop: 4,
    textAlign: 'center',
  },
});
