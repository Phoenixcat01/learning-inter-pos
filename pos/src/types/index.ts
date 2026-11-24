export type Category = 'Semua' | 'Makanan' | 'Minuman' | 'Cemilan' | 'Paket';

export interface Product {
  id: string;
  name: string;
  category: Category;
  price: number;
  stock: number;
  sku: string;
  image?: string;
  description?: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
  subtotal: number;
}

export interface TransactionItem {
  id: string;
  name: string;
  price: number;
  quantity: number;
  subtotal: number;
}

export interface Transaction {
  id: string;
  invoiceNumber: string;
  date: string; // ISO string
  items: TransactionItem[];
  subtotal: number;
  tax: number;
  discount: number;
  total: number;
  paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
  cashReceived?: number;
  change?: number;
  customerName?: string;
}

export type TabType = 'kasir' | 'keranjang' | 'riwayat' | 'produk' | 'lainnya';
