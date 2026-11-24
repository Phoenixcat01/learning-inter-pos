import React from 'react';
import { usePOS } from '../context/POSContext';
import { Category, Product } from '../types';
import { SearchIcon, PlusIcon, CartIcon } from '../components/Icons';
import { formatRupiah } from '../utils/format';

const CATEGORIES: Category[] = ['Semua', 'Makanan', 'Minuman', 'Cemilan', 'Paket'];

export const KasirScreen: React.FC = () => {
  const {
    products,
    cart,
    addToCart,
    selectedCategory,
    setSelectedCategory,
    searchQuery,
    setSearchQuery,
    setActiveTab,
    cartTotalQty,
    cartGrandTotal,
  } = usePOS();

  const filteredProducts = products.filter((prod) => {
    const matchCategory =
      selectedCategory === 'Semua' || prod.category === selectedCategory;
    const matchSearch =
      prod.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      prod.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (prod.description && prod.description.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchCategory && matchSearch;
  });

  const getItemCartQty = (productId: string): number => {
    const item = cart.find((c) => c.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden bg-slate-50">
      {/* Top Filter & Search Bar */}
      <div className="p-6 pb-2 space-y-4 shrink-0">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          {/* Category Chips */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-none">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                  selectedCategory === cat
                    ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30'
                    : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Search Input */}
          <div className="relative min-w-[280px]">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <SearchIcon size={16} />
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari nama atau SKU produk..."
              className="w-full pl-9 pr-4 py-2 text-xs bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-slate-800 placeholder-slate-400"
            />
          </div>
        </div>
      </div>

      {/* Product Grid Area */}
      <div className="flex-1 overflow-y-auto p-6 pt-2">
        {filteredProducts.length === 0 ? (
          <div className="h-64 flex flex-col items-center justify-center text-center p-6 bg-white rounded-2xl border border-slate-200 border-dashed">
            <p className="text-slate-400 font-medium text-sm">Tidak ada produk yang cocok ditemukan.</p>
            <p className="text-slate-400 text-xs mt-1">Coba gunakan kata kunci pencarian atau kategori lain.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {filteredProducts.map((product) => {
              const inCartQty = getItemCartQty(product.id);
              const isOutOfStock = product.stock <= 0;

              return (
                <div
                  key={product.id}
                  className="bg-white rounded-2xl p-4 border border-slate-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between group"
                >
                  <div>
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-600 uppercase tracking-wide">
                        {product.category}
                      </span>
                      <span
                        className={`text-[11px] font-medium ${
                          isOutOfStock
                            ? 'text-rose-600 font-semibold'
                            : product.stock <= 5
                            ? 'text-amber-600'
                            : 'text-slate-400'
                        }`}
                      >
                        {isOutOfStock ? 'Habis' : `Stok: ${product.stock}`}
                      </span>
                    </div>

                    {/* Product Name & SKU */}
                    <h3 className="font-bold text-slate-800 text-sm line-clamp-1 group-hover:text-emerald-700 transition-colors">
                      {product.name}
                    </h3>
                    <p className="text-[11px] text-slate-400 font-mono mt-0.5">{product.sku}</p>

                    {product.description && (
                      <p className="text-xs text-slate-500 mt-2 line-clamp-2 leading-relaxed">
                        {product.description}
                      </p>
                    )}
                  </div>

                  {/* Price & Add to Cart Action */}
                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Harga</span>
                      <span className="font-extrabold text-slate-900 text-sm">
                        {formatRupiah(product.price)}
                      </span>
                    </div>

                    <button
                      onClick={() => addToCart(product)}
                      disabled={isOutOfStock}
                      className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                        isOutOfStock
                          ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                          : inCartQty > 0
                          ? 'bg-emerald-600 text-white shadow-sm shadow-emerald-600/30 hover:bg-emerald-700'
                          : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-600 hover:text-white border border-emerald-200'
                      }`}
                    >
                      <PlusIcon size={14} />
                      <span>{inCartQty > 0 ? `+ (${inCartQty})` : 'Tambah'}</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Floating Bottom Bar on Mobile/Tablet or Quick Checkout CTA */}
      {cartTotalQty > 0 && (
        <div className="p-4 bg-white border-t border-slate-200 flex items-center justify-between shrink-0 shadow-lg">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold">
              {cartTotalQty}
            </div>
            <div>
              <p className="text-xs text-slate-500">{cartTotalQty} item di keranjang</p>
              <p className="text-base font-extrabold text-slate-900">{formatRupiah(cartGrandTotal)}</p>
            </div>
          </div>

          <button
            onClick={() => setActiveTab('keranjang')}
            className="flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 transition-all cursor-pointer"
          >
            <CartIcon size={16} />
            <span>Buka Keranjang & Bayar</span>
          </button>
        </div>
      )}
    </div>
  );
};
