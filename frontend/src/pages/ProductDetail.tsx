import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import api from '../services/api';
import type { Product, ProductVariation } from '../types';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>();
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);
  const addItem = useCartStore(state => state.addItem);

  useEffect(() => {
    loadProduct();
  }, [slug]);

  async function loadProduct() {
    if (!slug) return;
    setLoading(true);
    try {
      const { data } = await api.get(`/api/products/${slug}`);
      setProduct(data);
      if (data.variations?.length > 0) {
        setSelectedVariation(data.variations[0]);
      }
    } finally {
      setLoading(false);
    }
  }

  function handleAdd() {
    if (!product) return;
    addItem(product, selectedVariation, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  }

  if (loading) return (
    <div className="max-w-4xl mx-auto px-4 py-8 animate-pulse">
      <div className="bg-gray-200 h-96 rounded-lg mb-4" />
      <div className="bg-gray-200 h-8 rounded w-1/2 mb-2" />
      <div className="bg-gray-200 h-4 rounded w-1/3" />
    </div>
  );

  if (!product) return <div className="text-center py-16 text-gray-400">Produto não encontrado</div>;

  const currentPrice = selectedVariation?.price_override ?? product.price;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Image */}
        <div className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
          {product.image_url ? (
            <img src={product.image_url} alt={product.name} className="w-full h-full object-cover rounded-lg" />
          ) : (
            <span className="text-gray-300 text-8xl">💊</span>
          )}
        </div>

        {/* Details */}
        <div>
          {product.laboratory && (
            <p className="text-sm text-gray-500 mb-1">{product.laboratory}</p>
          )}
          <h1 className="text-2xl font-bold mb-2">{product.name}</h1>

          {product.category && (
            <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full mb-4">
              {product.category.name}
            </span>
          )}

          <div className="text-3xl font-bold text-green-700 mb-4">
            R$ {currentPrice.toFixed(2)}
          </div>

          {product.description && (
            <p className="text-gray-600 mb-6">{product.description}</p>
          )}

          {/* Flags */}
          <div className="flex gap-2 mb-4">
            {product.controlled && (
              <span className="px-3 py-1 rounded-full text-sm bg-red-100 text-red-700 font-medium">Controlado</span>
            )}
            {product.requires_prescription && (
              <span className="px-3 py-1 rounded-full text-sm bg-orange-100 text-orange-700 font-medium">Receita Obrigatória</span>
            )}
          </div>

          {product.anvisa_code && (
            <p className="text-xs text-gray-400 mb-4">Registro ANVISA: {product.anvisa_code}</p>
          )}

          {/* Variations */}
          {product.variations && product.variations.length > 0 && (
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Apresentação</label>
              <div className="flex flex-wrap gap-2">
                {product.variations.map(v => (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariation(v)}
                    disabled={v.stock_quantity <= 0}
                    className={`px-4 py-2 rounded-lg text-sm border transition-colors ${
                      selectedVariation?.id === v.id
                        ? 'border-green-600 bg-green-50 text-green-700'
                        : v.stock_quantity <= 0
                        ? 'border-gray-200 text-gray-300 cursor-not-allowed'
                        : 'border-gray-200 hover:border-gray-400'
                    }`}
                  >
                    {v.name}
                    {v.price_override && (
                      <span className="block text-xs text-gray-500">R$ {v.price_override.toFixed(2)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Stock */}
          {selectedVariation && (
            <p className="text-sm text-gray-500 mb-4">
              {selectedVariation.stock_quantity > 0
                ? `${selectedVariation.stock_quantity} unidades em estoque`
                : 'Fora de estoque'}
            </p>
          )}

          {/* Quantity + Add to Cart */}
          <div className="flex items-center gap-4 mb-6">
            <div className="flex items-center border rounded-lg">
              <button
                onClick={() => setQuantity(Math.max(1, quantity - 1))}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50"
              >
                -
              </button>
              <span className="px-4 py-2 font-medium">{quantity}</span>
              <button
                onClick={() => setQuantity(quantity + 1)}
                className="px-3 py-2 text-gray-600 hover:bg-gray-50"
              >
                +
              </button>
            </div>
            <button
              onClick={handleAdd}
              disabled={!selectedVariation || selectedVariation.stock_quantity <= 0}
              className={`flex-1 py-3 rounded-lg font-semibold transition-colors ${
                added
                  ? 'bg-green-500 text-white'
                  : 'bg-green-600 text-white hover:bg-green-700 disabled:opacity-50'
              }`}
            >
              {added ? '✓ Adicionado!' : 'Adicionar ao Carrinho'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
