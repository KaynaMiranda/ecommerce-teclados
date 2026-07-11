import api from './api';
import type { Product, Category } from '../types';

export const adminService = {
  async getDashboard(userId: string) {
    const { data } = await api.get('/api/admin/dashboard', {
      params: { user_id: userId },
    });
    return data;
  },

  async getProducts(userId: string): Promise<Product[]> {
    const { data } = await api.get('/api/admin/products', {
      params: { user_id: userId },
    });
    return data;
  },

  async createProduct(userId: string, product: Partial<Product>) {
    const { data } = await api.post('/api/admin/products', {
      user_id: userId,
      ...product,
    });
    return data;
  },

  async updateProduct(userId: string, id: string, product: Partial<Product>) {
    const { data } = await api.put(`/api/admin/products/${id}`, {
      user_id: userId,
      ...product,
    });
    return data;
  },

  async deleteProduct(userId: string, id: string) {
    await api.delete(`/api/admin/products/${id}`, {
      params: { user_id: userId },
    });
  },

  async getOrders(userId: string) {
    const { data } = await api.get('/api/admin/orders', {
      params: { user_id: userId },
    });
    return data;
  },

  async updateOrderStatus(userId: string, orderId: string, status: string) {
    await api.patch(`/api/admin/orders/${orderId}/status`, {
      user_id: userId,
      status,
    });
  },

  async getCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/admin/categories');
    return data;
  },
};
