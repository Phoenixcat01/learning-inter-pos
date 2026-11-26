import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { Product, CartItem, Transaction, Category, TabType } from '../types';
import * as productService from '../services/productService';
import * as transactionService from '../services/transactionService';
import { generateBarcodeNumber, showPOSAlert } from '../utils/format';

export interface ScanResult {
  success: boolean;
  product?: Product;
  reason?: 'empty' | 'not_found' | 'out_of_stock' | 'max_stock';
}

interface POSContextType {
  products: Product[];
  isLoadingProducts: boolean;
  productsError: string | null;
  reloadProducts: () => Promise<void>;

  cart: CartItem[];
  cartTotalQty: number;
  cartSubtotal: number;
  cartTax: number;
  cartGrandTotal: number;

  transactions: Transaction[];
  isLoadingTransactions: boolean;
  transactionsError: string | null;
  reloadTransactions: () => Promise<void>;

  activeTab: TabType;
  selectedCategory: Category;
  searchQuery: string;
  setActiveTab: (tab: TabType) => void;
  setSelectedCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;

  addToCart: (product: Product) => void;
  findProductByBarcode: (code: string) => Product | undefined;
  scanBarcodeToCart: (code: string) => ScanResult;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;

  checkout: (details: {
    customerName?: string;
    paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
    cashReceived?: number;
    discount?: number;
  }) => Promise<Transaction>;

  addProduct: (product: Omit<Product, 'id' | 'sku' | 'barcode'> & { barcode?: string; sku?: string }) => Promise<void>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<void>;
  deleteProduct: (id: string) => Promise<void>;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoadingProducts, setIsLoadingProducts] = useState<boolean>(true);
  const [productsError, setProductsError] = useState<string | null>(null);

  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(true);
  const [transactionsError, setTransactionsError] = useState<string | null>(null);

  const [cart, setCart] = useState<CartItem[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('kasir');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // 1. Load Products from API
  const reloadProducts = useCallback(async () => {
    setIsLoadingProducts(true);
    setProductsError(null);
    try {
      const data = await productService.getProducts();
      setProducts(data);
    } catch (err: any) {
      setProductsError(err.message || 'Gagal memuat produk dari server.');
    } finally {
      setIsLoadingProducts(false);
    }
  }, []);

  // 2. Load Transactions from API
  const reloadTransactions = useCallback(async () => {
    setIsLoadingTransactions(true);
    setTransactionsError(null);
    try {
      const data = await transactionService.getTransactions();
      setTransactions(data);
    } catch (err: any) {
      setTransactionsError(err.message || 'Gagal memuat riwayat transaksi dari server.');
    } finally {
      setIsLoadingTransactions(false);
    }
  }, []);

  useEffect(() => {
    reloadProducts();
    reloadTransactions();
  }, [reloadProducts, reloadTransactions]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      showPOSAlert('Stok Habis', `Produk "${product.name}" sedang tidak tersedia.`);
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          showPOSAlert('Batas Stok', `Maksimal stok tercapai untuk "${product.name}" (${product.stock} pcs).`);
          return prevCart;
        }
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.product.price,
              }
            : item
        );
      } else {
        return [
          ...prevCart,
          {
            product,
            quantity: 1,
            subtotal: product.price,
          },
        ];
      }
    });
  };

  const findProductByBarcode = (code: string): Product | undefined => {
    const trimmed = code.trim();
    if (!trimmed) return undefined;
    return products.find((p) => p.barcode?.trim() === trimmed);
  };

  const scanBarcodeToCart = (code: string): ScanResult => {
    const trimmed = code.trim();
    if (!trimmed) {
      return { success: false, reason: 'empty' };
    }

    const product = findProductByBarcode(trimmed);
    if (!product) {
      return { success: false, reason: 'not_found' };
    }

    if (product.stock <= 0) {
      return { success: false, product, reason: 'out_of_stock' };
    }

    const existing = cart.find((item) => item.product.id === product.id);
    if (existing && existing.quantity >= product.stock) {
      return { success: false, product, reason: 'max_stock' };
    }

    setCart((prevCart) => {
      const current = prevCart.find((item) => item.product.id === product.id);
      if (current) {
        if (current.quantity >= product.stock) return prevCart;
        return prevCart.map((item) =>
          item.product.id === product.id
            ? {
                ...item,
                quantity: item.quantity + 1,
                subtotal: (item.quantity + 1) * item.product.price,
              }
            : item
        );
      }
      return [
        ...prevCart,
        {
          product,
          quantity: 1,
          subtotal: product.price,
        },
      ];
    });

    return { success: true, product };
  };

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((i) => i.product.id !== productId);
      }

      if (newQty > item.product.stock) {
        showPOSAlert('Batas Stok', `Jumlah melebihi stok yang tersedia (${item.product.stock} pcs)`);
        return prevCart;
      }

      return prevCart.map((i) =>
        i.product.id === productId
          ? { ...i, quantity: newQty, subtotal: newQty * i.product.price }
          : i
      );
    });
  };

  const removeFromCart = (productId: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => {
    setCart([]);
  };

  // Cart calculation summaries
  const cartTotalQty = cart.reduce((sum, item) => sum + item.quantity, 0);
  const cartSubtotal = cart.reduce((sum, item) => sum + item.subtotal, 0);
  const cartTax = Math.round(cartSubtotal * 0.1); // PPN 10%
  const cartGrandTotal = cartSubtotal + cartTax;

  // Checkout process with backend API
  const checkout = async (details: {
    customerName?: string;
    paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
    cashReceived?: number;
    discount?: number;
  }): Promise<Transaction> => {
    const discount = details.discount || 0;
    const finalTotal = Math.max(0, cartGrandTotal - discount);
    const cashReceived = details.cashReceived || finalTotal;
    const change = Math.max(0, cashReceived - finalTotal);

    const payload = {
      customerName: details.customerName?.trim() || 'Pelanggan Umum',
      paymentMethod: details.paymentMethod,
      cashReceived,
      discount,
      subtotal: cartSubtotal,
      tax: cartTax,
      total: finalTotal,
      items: cart.map((item) => ({
        productId: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
    };

    // Save transaction to Cloudflare D1
    const newTransaction = await transactionService.createTransaction(payload);

    // Update transactions history and clear cart
    setTransactions((prev) => [newTransaction, ...prev]);
    setCart([]);

    // Refresh products live to reflect reduced stock in D1
    await reloadProducts();

    return newTransaction;
  };

  // Product management with backend API
  const addProduct = async (newProd: Omit<Product, 'id' | 'sku' | 'barcode'> & { barcode?: string; sku?: string }) => {
    const barcodeCode = newProd.barcode?.trim() || generateBarcodeNumber();
    const skuCode = newProd.sku || `${newProd.category.substring(0, 3).toUpperCase()}-${Math.floor(100 + Math.random() * 900)}`;

    await productService.createProduct({
      ...newProd,
      sku: skuCode,
      barcode: barcodeCode,
    });
    await reloadProducts();
  };

  const updateProduct = async (id: string, updates: Partial<Product>) => {
    await productService.updateProduct(id, updates);
    await reloadProducts();
  };

  const deleteProduct = async (id: string) => {
    await productService.deleteProduct(id);
    setCart((prev) => prev.filter((item) => item.product.id !== id));
    await reloadProducts();
  };

  return (
    <POSContext.Provider
      value={{
        products,
        isLoadingProducts,
        productsError,
        reloadProducts,
        cart,
        transactions,
        isLoadingTransactions,
        transactionsError,
        reloadTransactions,
        activeTab,
        selectedCategory,
        searchQuery,
        setActiveTab,
        setSelectedCategory,
        setSearchQuery,
        addToCart,
        findProductByBarcode,
        scanBarcodeToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,
        addProduct,
        updateProduct,
        deleteProduct,
        cartTotalQty,
        cartSubtotal,
        cartTax,
        cartGrandTotal,
      }}
    >
      {children}
    </POSContext.Provider>
  );
};

export const usePOS = (): POSContextType => {
  const context = useContext(POSContext);
  if (!context) {
    throw new Error('usePOS must be used within a POSProvider');
  }
  return context;
};
