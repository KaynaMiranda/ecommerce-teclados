import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { productsService } from '../services/api';
import type { Product, ProductVariation } from '../types';
import { useCartStore } from '../store/cartStore';

export function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const [product, setProduct] = useState<Product | null>(null);
  const [selectedVariation, setSelectedVariation] = useState<ProductVariation | undefined>();
  const [loading, setLoading] = useState(true);
  const addItem = useCartStore((state) => state.addItem);

  useEffect(() => {
    if (!slug) return;
    productsService
      .getBySlug(slug)
      .then(setProduct)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [slug]);

  const handleAddToCart = () => {
    if (!product) return;
    addItem(product, selectedVariation);
    alert('Produto adicionado ao carrinho!');
  };

  const currentPrice = selectedVariation?.price_override ?? product?.price ?? 0;

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto"></div>
        <p className="mt-4 text-gray-600">Carregando produto...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold">Produto não encontrado</h1>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <img
            src={product.image_url}
            alt={product.name}
            className="w-full h-96 object-contain border rounded-lg"
          />
        </div>

        <div>
          <h1 className="text-3xl font-bold">{product.name}</h1>
          <p className="text-gray-600 mt-4">{product.description}</p>

          <p className="text-3xl font-bold text-green-600 mt-6">
            R$ {currentPrice.toFixed(2)}
          </p>

          {product.variations && product.variations.length > 0 && (
            <div className="mt-6">
              <h3 className="font-semibold mb-3">Variações:</h3>
              <div className="flex flex-wrap gap-2">
                {product.variations.map((variation) => (
                  <button
                    key={variation.id}
                    onClick={() => setSelectedVariation(variation)}
                    className={`px-4 py-2 border rounded-lg transition-colors ${
                      selectedVariation?.id === variation.id
                        ? 'bg-gray-900 text-white'
                        : 'bg-white text-gray-900 hover:bg-gray-100'
                    }`}
                  >
                    {variation.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={handleAddToCart}
            className="mt-8 w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
          >
            Adicionar ao Carrinho
          </button>
        </div>
      </div>
    </div>
  );
}
