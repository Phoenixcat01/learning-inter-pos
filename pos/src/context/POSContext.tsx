import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Product, CartItem, Transaction, Category, TabType } from '../types';
import { INITIAL_PRODUCTS } from '../data/initialProducts';
import { generateInvoiceNumber } from '../utils/format';

interface POSContextType {
  products: Product[];
  cart: CartItem[];
  transactions: Transaction[];
  activeTab: TabType;
  selectedCategory: Category;
  searchQuery: string;
  setActiveTab: (tab: TabType) => void;
  setSelectedCategory: (cat: Category) => void;
  setSearchQuery: (query: string) => void;
  addToCart: (product: Product) => void;
  updateCartQty: (productId: string, delta: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  checkout: (details: {
    customerName?: string;
    paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
    cashReceived?: number;
    discount?: number;
  }) => Transaction;
  addProduct: (product: Omit<Product, 'id' | 'sku'>) => void;
  updateProduct: (id: string, updates: Partial<Product>) => void;
  deleteProduct: (id: string) => void;
  resetProducts: () => void;
  cartTotalQty: number;
  cartSubtotal: number;
  cartTax: number;
  cartGrandTotal: number;
}

const POSContext = createContext<POSContextType | undefined>(undefined);

const STORAGE_KEYS = {
  PRODUCTS: 'pos_products_v1',
  TRANSACTIONS: 'pos_transactions_v1',
};

export const POSProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEYS.PRODUCTS);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed reading products from localStorage', e);
    }
    return INITIAL_PRODUCTS;
  });

  const [cart, setCart] = useState<CartItem[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        const saved = window.localStorage.getItem(STORAGE_KEYS.TRANSACTIONS);
        if (saved) return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Failed reading transactions from localStorage', e);
    }
    return [];
  });

  const [activeTab, setActiveTab] = useState<TabType>('kasir');
  const [selectedCategory, setSelectedCategory] = useState<Category>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Persist products
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEYS.PRODUCTS, JSON.stringify(products));
      }
    } catch (e) {
      console.warn('Failed saving products to localStorage', e);
    }
  }, [products]);

  // Persist transactions
  useEffect(() => {
    try {
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(STORAGE_KEYS.TRANSACTIONS, JSON.stringify(transactions));
      }
    } catch (e) {
      console.warn('Failed saving transactions to localStorage', e);
    }
  }, [transactions]);

  // Cart operations
  const addToCart = (product: Product) => {
    if (product.stock <= 0) {
      alert('Stok produk habis!');
      return;
    }

    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.product.id === product.id);
      if (existing) {
        if (existing.quantity >= product.stock) {
          alert(`Maksimal stok tercapai (${product.stock})`);
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

  const updateCartQty = (productId: string, delta: number) => {
    setCart((prevCart) => {
      const item = prevCart.find((i) => i.product.id === productId);
      if (!item) return prevCart;

      const newQty = item.quantity + delta;
      if (newQty <= 0) {
        return prevCart.filter((i) => i.product.id !== productId);
      }

      if (newQty > item.product.stock) {
        alert(`Jumlah melebihi stok yang tersedia (${item.product.stock})`);
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

  // Checkout process
  const checkout = (details: {
    customerName?: string;
    paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
    cashReceived?: number;
    discount?: number;
  }): Transaction => {
    const discount = details.discount || 0;
    const finalTotal = Math.max(0, cartGrandTotal - discount);
    const cashReceived = details.cashReceived || finalTotal;
    const change = Math.max(0, cashReceived - finalTotal);

    const newTransaction: Transaction = {
      id: `trx-${Date.now()}`,
      invoiceNumber: generateInvoiceNumber(transactions.length),
      date: new Date().toISOString(),
      items: cart.map((item) => ({
        id: item.product.id,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        subtotal: item.subtotal,
      })),
      subtotal: cartSubtotal,
      tax: cartTax,
      discount,
      total: finalTotal,
      paymentMethod: details.paymentMethod,
      cashReceived,
      change,
      customerName: details.customerName?.trim() || 'Pelanggan Umum',
    };

    // Reduce stock for purchased items
    setProducts((prevProducts) =>
      prevProducts.map((p) => {
        const purchased = cart.find((c) => c.product.id === p.id);
        if (purchased) {
          return {
            ...p,
            stock: Math.max(0, p.stock - purchased.quantity),
          };
        }
        return p;
      })
    );

    // Save transaction and clear cart
    setTransactions((prev) => [newTransaction, ...prev]);
    setCart([]);

    return newTransaction;
  };

  // Product management
  const addProduct = (newProd: Omit<Product, 'id' | 'sku'>) => {
    const id = `prod-${Date.now()}`;
    const skuCode =
      newProd.category.substring(0, 3).toUpperCase() +
      '-' +
      Math.floor(100 + Math.random() * 900);

    const product: Product = {
      ...newProd,
      id,
      sku: skuCode,
    };
    setProducts((prev) => [product, ...prev]);
  };

  const updateProduct = (id: string, updates: Partial<Product>) => {
    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...updates } : p))
    );
  };

  const deleteProduct = (id: string) => {
    setProducts((prev) => prev.filter((p) => p.id !== id));
    setCart((prev) => prev.filter((item) => item.product.id !== id));
  };

  const resetProducts = () => {
    setProducts(INITIAL_PRODUCTS);
  };

  return (
    <POSContext.Provider
      value={{
        products,
        cart,
        transactions,
        activeTab,
        selectedCategory,
        searchQuery,
        setActiveTab,
        setSelectedCategory,
        setSearchQuery,
        addToCart,
        updateCartQty,
        removeFromCart,
        clearCart,
        checkout,
        addProduct,
        updateProduct,
        deleteProduct,
        resetProducts,
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
