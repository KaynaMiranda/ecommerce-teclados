import api from './api';
import type { Product, Category, Order, B2BClient, DeliveryZone, Profile } from '../types';

export interface StockMovement {
  id: string;
  product_id: string;
  variation_id: string;
  type: 'in' | 'out' | 'adjustment';
  quantity: number;
  reason: string;
  order_id?: string;
  created_at: string;
  product?: { name: string };
  variation?: { name: string; sku: string };
}

export const adminService = {
  // Dashboard
  async getDashboard(userId: string) {
    const { data } = await api.get('/api/admin/dashboard', {
      params: { user_id: userId },
    });
    return data;
  },

  // Products
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

  // Orders
  async getOrders(userId: string, filters?: { status?: string; order_type?: string }): Promise<Order[]> {
    const params: Record<string, string> = { user_id: userId };
    if (filters?.status) params.status = filters.status;
    if (filters?.order_type) params.order_type = filters.order_type;
    const { data } = await api.get('/api/admin/orders', { params });
    return data;
  },

  async updateOrderStatus(userId: string, orderId: string, status: string) {
    await api.patch(`/api/admin/orders/${orderId}/status`, {
      user_id: userId,
      status,
    });
  },

  // Categories
  async getCategories(): Promise<Category[]> {
    const { data } = await api.get('/api/admin/categories');
    return data;
  },

  // B2B Clients
  async getB2BClients(userId: string): Promise<B2BClient[]> {
    const { data } = await api.get('/api/admin/b2b-clients', {
      params: { user_id: userId },
    });
    return data;
  },

  async createB2BClient(userId: string, client: Partial<B2BClient>) {
    const { data } = await api.post('/api/admin/b2b-clients', {
      user_id: userId,
      ...client,
    });
    return data;
  },

  async updateB2BClient(userId: string, id: string, client: Partial<B2BClient>) {
    const { data } = await api.put(`/api/admin/b2b-clients/${id}`, {
      user_id: userId,
      ...client,
    });
    return data;
  },

  async deleteB2BClient(userId: string, id: string) {
    await api.delete(`/api/admin/b2b-clients/${id}`, {
      params: { user_id: userId },
    });
  },

  // Delivery Zones
  async getDeliveryZones(userId: string): Promise<DeliveryZone[]> {
    const { data } = await api.get('/api/admin/delivery-zones', {
      params: { user_id: userId },
    });
    return data;
  },

  async createDeliveryZone(userId: string, zone: Partial<DeliveryZone>) {
    const { data } = await api.post('/api/admin/delivery-zones', {
      user_id: userId,
      ...zone,
    });
    return data;
  },

  async updateDeliveryZone(userId: string, id: string, zone: Partial<DeliveryZone>) {
    const { data } = await api.put(`/api/admin/delivery-zones/${id}`, {
      user_id: userId,
      ...zone,
    });
    return data;
  },

  async deleteDeliveryZone(userId: string, id: string) {
    await api.delete(`/api/admin/delivery-zones/${id}`, {
      params: { user_id: userId },
    });
  },

  // Staff
  async getStaff(userId: string): Promise<Profile[]> {
    const { data } = await api.get('/api/admin/staff', {
      params: { user_id: userId },
    });
    return data;
  },

  async inviteStaff(userId: string, email: string, role: string) {
    const { data } = await api.post('/api/admin/staff', {
      user_id: userId,
      email,
      role,
    });
    return data;
  },

  async updateStaffRole(userId: string, staffUserId: string, role: string) {
    await api.patch(`/api/admin/staff/${staffUserId}`, {
      user_id: userId,
      role,
    });
  },

  async removeStaff(userId: string, staffUserId: string) {
    await api.delete(`/api/admin/staff/${staffUserId}`, {
      params: { user_id: userId },
    });
  },

  // Stock
  async getStockMovements(userId: string): Promise<StockMovement[]> {
    const { data } = await api.get('/api/admin/stock', {
      params: { user_id: userId },
    });
    return data;
  },

  async adjustStock(userId: string, productId: string, variationId: string, quantity: number, reason: string) {
    const { data } = await api.post('/api/admin/stock/adjust', {
      user_id: userId,
      product_id: productId,
      variation_id: variationId,
      quantity,
      reason,
    });
    return data;
  },
};
