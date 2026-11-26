import { apiFetch } from './api';
import { Transaction, TransactionItem } from '../types';

export interface CreateTransactionPayload {
  customerName?: string;
  paymentMethod: 'Cash' | 'QRIS' | 'Debit/Kredit';
  cashReceived?: number;
  discount?: number;
  subtotal?: number;
  tax?: number;
  total?: number;
  items: {
    productId: string;
    name: string;
    price: number;
    quantity: number;
    subtotal: number;
  }[];
}

export interface TransactionsResponse {
  success: boolean;
  data: Transaction[];
  transactions?: Transaction[];
}

export interface SingleTransactionResponse {
  success: boolean;
  data: Transaction;
  transaction?: Transaction;
}

export interface TransactionItemsResponse {
  success: boolean;
  data: TransactionItem[];
  items?: TransactionItem[];
}

/**
 * Save new transaction header & items to D1 and decrement product stock.
 */
export async function createTransaction(payload: CreateTransactionPayload): Promise<Transaction> {
  const res = await apiFetch<SingleTransactionResponse>('/api/transactions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data || res.transaction;
}

/**
 * Fetch all transaction history from D1.
 */
export async function getTransactions(): Promise<Transaction[]> {
  const res = await apiFetch<TransactionsResponse>('/api/transactions');
  return res.data || res.transactions || [];
}

/**
 * Get detailed transaction by ID including its items.
 */
export async function getTransactionDetail(id: string): Promise<Transaction> {
  const res = await apiFetch<SingleTransactionResponse>(`/api/transactions/${id}`);
  return res.data || res.transaction;
}

/**
 * Get transaction items for a specific transaction ID.
 */
export async function getTransactionItems(id: string): Promise<TransactionItem[]> {
  const res = await apiFetch<TransactionItemsResponse>(`/api/transactions/${id}/items`);
  return res.data || res.items || [];
}
