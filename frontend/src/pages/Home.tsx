import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import { useCartStore } from '../store/cartStore';
import type { Product, Category } from '../types';

export function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadCategories();
  }, []);

  useEffect(() => {
    loadProducts();
  }, [selectedCategory, search]);

  async function loadCategories() {
    const { data } = await api.get('/api/categories');
    setCategories(data);
  }

  async function loadProducts() {
    setLoading(true);
    try {
      const params: Record<string, string> = {};
      if (selectedCategory) params.category = selectedCategory;
      if (search) params.search = search;
      const { data } = await api.get('/api/products', { params });
      setProducts(data);
    } finally {
      setLoading(false);
    }
  }

  function handleAddToCart(product: Product) {
    const defaultVariation = product.variations?.[0];
    addItem(product, defaultVariation);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8">
      {/* Hero */}
      <div className="bg-gradient-to-r from-green-600 to-green-800 rounded-2xl p-8 mb-8 text-white">
        <h1 className="text-3xl font-bold mb-2">Farma+</h1>
        <p className="text-green-100 mb-4">Sua farmácia online com entrega rápida e segura</p>
        <div className="relative max-w-md">
          <input
            type="text"
            placeholder="Buscar medicamentos, vitaminas, dermocosméticos..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full px-4 py-3 pl-10 rounded-lg text-gray-900 placeholder-gray-500"
          />
          <svg className="absolute left-3 top-3.5 h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
      </div>

      {/* Categories */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        <button
          onClick={() => setSelectedCategory('')}
          className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
            !selectedCategory ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors ${
              selectedCategory === cat.id ? 'bg-green-600 text-white' : 'bg-white border text-gray-600 hover:bg-gray-50'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>

      {/* Products */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg border p-4 animate-pulse">
              <div className="bg-gray-200 h-40 rounded mb-3" />
              <div className="bg-gray-200 h-4 rounded w-3/4 mb-2" />
              <div className="bg-gray-200 h-4 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <p className="text-lg">Nenhum produto encontrado</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {products.map(product => (
            <div key={product.id} className="bg-white rounded-lg border overflow-hidden hover:shadow-md transition-shadow">
              <Link to={`/produto/${product.slug}`}>
                <div className="aspect-square bg-gray-100 flex items-center justify-center">
                  {product.image_url ? (
                    <img src={product.image_url} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-gray-300 text-4xl">💊</span>
                  )}
                </div>
              </Link>
              <div className="p-4">
                {product.laboratory && (
                  <p className="text-xs text-gray-500 mb-1">{product.laboratory}</p>
                )}
                <Link to={`/produto/${product.slug}`}>
                  <h3 className="font-medium text-sm mb-1 line-clamp-2 hover:text-green-600">{product.name}</h3>
                </Link>
                {product.variations && product.variations.length > 0 && (
                  <p className="text-xs text-gray-400 mb-2">
                    {product.variations.length} apresentação{product.variations.length > 1 ? 'ções' : ''}
                  </p>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-green-700">R$ {product.price.toFixed(2)}</span>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 transition-colors"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </button>
                </div>
                {product.requires_prescription && (
                  <p className="text-xs text-orange-600 mt-2">⚕️ Receita obrigatória</p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
