import { apiFetch } from './api';
import { Product, Category } from '../types';

export interface ProductsResponse {
  success: boolean;
  data: Product[];
  products?: Product[];
}

export interface SingleProductResponse {
  success: boolean;
  data: Product;
  product?: Product;
}

export interface DeleteProductResponse {
  success: boolean;
  message?: string;
}

/**
 * Fetch all products from Hono backend, with optional search and category filters.
 */
export async function getProducts(search?: string, category?: Category): Promise<Product[]> {
  const params = new URLSearchParams();
  if (search && search.trim()) {
    params.set('search', search.trim());
  }
  if (category && category !== 'Semua') {
    params.set('category', category);
  }

  const query = params.toString() ? `?${params.toString()}` : '';
  const res = await apiFetch<ProductsResponse>(`/api/products${query}`);
  return res.data || res.products || [];
}

/**
 * Get product detail by ID.
 */
export async function getProductById(id: string): Promise<Product> {
  const res = await apiFetch<SingleProductResponse>(`/api/products/${id}`);
  return res.data || res.product;
}

/**
 * Create a new product in Cloudflare D1 via Hono backend.
 */
export async function createProduct(payload: Omit<Product, 'id' | 'sku'> & { sku?: string; id?: string }): Promise<Product> {
  const res = await apiFetch<SingleProductResponse>('/api/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return res.data || res.product;
}

/**
 * Update product data / stock in Cloudflare D1.
 */
export async function updateProduct(id: string, payload: Partial<Product>): Promise<Product> {
  const res = await apiFetch<SingleProductResponse>(`/api/products/${id}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return res.data || res.product;
}

/**
 * Delete a product from Cloudflare D1.
 */
export async function deleteProduct(id: string): Promise<void> {
  await apiFetch<DeleteProductResponse>(`/api/products/${id}`, {
    method: 'DELETE',
  });
}
