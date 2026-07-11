import axios from 'axios';
import { Product, Category } from '../types';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3333',
});

export const productsService = {
  async getAll(categorySlug?: string): Promise<Product[]> {
    const { data } = await api.get('/api/products', {
      params: categorySlug ? { category: categorySlug } : {},
    });
    return data;
  },

  async getBySlug(slug: string): Promise<Product> {
    const { data } = await api.get(`/api/products/${slug}`);
    return data;
  },

  async search(query: string): Promise<Product[]> {
    const { data } = await api.get('/api/products/search', {
      params: { q: query },
    });
    return data;
  },
};

export const categoriesService = {
  async getAll(): Promise<Category[]> {
    const { data } = await api.get('/api/categories');
    return data;
  },
};

export default api;
