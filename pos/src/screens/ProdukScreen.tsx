import React, { useState } from 'react';
import { usePOS } from '../context/POSContext';
import { Category, Product } from '../types';
import { PlusIcon, EditIcon, TrashIcon, SearchIcon, CloseIcon } from '../components/Icons';
import { formatRupiah } from '../utils/format';

const CATEGORIES: Category[] = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Paket'];

export const ProdukScreen: React.FC = () => {
  const { products, addProduct, updateProduct, deleteProduct, resetProducts } = usePOS();

  const [selectedCategory, setSelectedCategory] = useState<Category>('Semua');
  const [search, setSearch] = useState<string>('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // Form Fields
  const [formName, setFormName] = useState<string>('');
  const [formCategory, setFormCategory] = useState<Category>('Makanan');
  const [formPrice, setFormPrice] = useState<number>(0);
  const [formStock, setFormStock] = useState<number>(10);
  const [formDescription, setFormDescription] = useState<string>('');

  const openAddModal = () => {
    setEditingProduct(null);
    setFormName('');
    setFormCategory('Makanan');
    setFormPrice(15000);
    setFormStock(20);
    setFormDescription('');
    setIsModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setFormName(p.name);
    setFormCategory(p.category);
    setFormPrice(p.price);
    setFormStock(p.stock);
    setFormDescription(p.description || '');
    setIsModalOpen(true);
  };

  const handleSave = () => {
    if (!formName.trim()) {
      alert('Nama produk tidak boleh kosong!');
      return;
    }
    if (formPrice <= 0) {
      alert('Harga produk harus lebih dari 0!');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, {
        name: formName.trim(),
        category: formCategory,
        price: formPrice,
        stock: formStock,
        description: formDescription.trim(),
      });
    } else {
      addProduct({
        name: formName.trim(),
        category: formCategory,
        price: formPrice,
        stock: formStock,
        description: formDescription.trim(),
      });
    }

    setIsModalOpen(false);
  };

  const filteredProducts = products.filter((p) => {
    const matchCat = selectedCategory === 'Semua' || p.category === selectedCategory;
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.sku.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Header Controls */}
      <div className="p-6 pb-2 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <button
              onClick={openAddModal}
              className="flex items-center space-x-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
            >
              <PlusIcon size={16} />
              <span>Tambah Produk Baru</span>
            </button>
            <button
              onClick={() => {
                if (confirm('Kembalikan seluruh daftar produk ke data default bawaan?')) {
                  resetProducts();
                }
              }}
              className="px-3 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold text-xs transition-colors cursor-pointer"
            >
              Reset Default
            </button>
          </div>

          {/* Search Box */}
          <div className="relative min-w-[260px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari nama atau SKU..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
            />
          </div>
        </div>

        {/* Category Filter */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? 'bg-slate-800 text-white shadow-xs'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Product Table */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase font-bold tracking-wider">
              <tr>
                <th className="py-3.5 px-4">SKU</th>
                <th className="py-3.5 px-4">Nama Produk</th>
                <th className="py-3.5 px-4">Kategori</th>
                <th className="py-3.5 px-4 text-right">Harga</th>
                <th className="py-3.5 px-4 text-center">Stok</th>
                <th className="py-3.5 px-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredProducts.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3 px-4 font-mono font-bold text-slate-500">{p.sku}</td>
                  <td className="py-3 px-4 font-bold text-slate-800">
                    {p.name}
                    {p.description && (
                      <span className="block text-[11px] font-normal text-slate-400 truncate max-w-xs">
                        {p.description}
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-4">
                    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600">
                      {p.category}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-right font-extrabold text-slate-900">
                    {formatRupiah(p.price)}
                  </td>
                  <td className="py-3 px-4 text-center">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        p.stock <= 0
                          ? 'bg-rose-100 text-rose-700'
                          : p.stock <= 5
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {p.stock} pcs
                    </span>
                  </td>
                  <td className="py-3 px-4 text-center">
                    <div className="flex items-center justify-center space-x-2">
                      <button
                        onClick={() => openEditModal(p)}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-emerald-600 hover:bg-emerald-50 transition-colors cursor-pointer"
                        title="Edit Produk"
                      >
                        <EditIcon size={16} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Hapus produk "${p.name}"?`)) {
                            deleteProduct(p.id);
                          }
                        }}
                        className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                        title="Hapus Produk"
                      >
                        <TrashIcon size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200">
              <h4 className="font-extrabold text-base text-slate-800">
                {editingProduct ? 'Edit Informasi Produk' : 'Tambah Produk Baru'}
              </h4>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 cursor-pointer"
              >
                <CloseIcon size={20} />
              </button>
            </div>

            <div className="py-4 space-y-3 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Nama Produk *</label>
                <input
                  type="text"
                  value={formName}
                  onChange={(e) => setFormName(e.target.value)}
                  placeholder="Contoh: Es Kopi Susu Aren"
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Kategori *</label>
                <select
                  value={formCategory}
                  onChange={(e) => setFormCategory(e.target.value as Category)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 bg-white"
                >
                  {(['Makanan', 'Minuman', 'Cemilan', 'Paket'] as Category[]).map((cat) => (
                    <option key={cat} value={cat}>
                      {cat}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Harga (Rp) *</label>
                  <input
                    type="number"
                    value={formPrice || ''}
                    onChange={(e) => setFormPrice(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-bold"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Stok Awal *</label>
                  <input
                    type="number"
                    value={formStock || ''}
                    onChange={(e) => setFormStock(Number(e.target.value))}
                    className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800 font-bold"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Deskripsi Singkat</label>
                <textarea
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="Keterangan bahan atau catatan produk..."
                  rows={2}
                  className="w-full px-3 py-2 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-slate-200 flex space-x-2">
              <button
                onClick={() => setIsModalOpen(false)}
                className="flex-1 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition-colors cursor-pointer"
              >
                Batal
              </button>
              <button
                onClick={handleSave}
                className="flex-1 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
              >
                Simpan Produk
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
