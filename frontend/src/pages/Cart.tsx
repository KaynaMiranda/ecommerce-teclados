import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';

export function Cart() {
  const { items, removeItem, updateQuantity, getTotal, clearCart } =
    useCartStore();

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-12 text-center">
        <h1 className="text-2xl font-bold mb-4">Carrinho vazio</h1>
        <p className="text-gray-600 mb-6">
          Adicione produtos ao carrinho para continuar
        </p>
        <Link
          to="/"
          className="bg-gray-900 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors"
        >
          Ver Produtos
        </Link>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Carrinho de Compras</h1>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {items.map((item) => (
            <div
              key={`${item.product.id}-${item.variation?.id}`}
              className="border rounded-lg p-4 mb-4 flex gap-4"
            >
              <img
                src={item.product.image_url}
                alt={item.product.name}
                className="w-24 h-24 object-contain"
              />

              <div className="flex-1">
                <h3 className="font-semibold">{item.product.name}</h3>
                {item.variation && (
                  <p className="text-sm text-gray-600">{item.variation.name}</p>
                )}
                <p className="text-lg font-bold mt-2">
                  R${' '}
                  {(item.variation?.price_override ?? item.product.price).toFixed(2)}
                </p>

                <div className="flex items-center gap-4 mt-2">
                  <div className="flex items-center border rounded">
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity - 1,
                          item.variation?.id
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      -
                    </button>
                    <span className="px-3 py-1">{item.quantity}</span>
                    <button
                      onClick={() =>
                        updateQuantity(
                          item.product.id,
                          item.quantity + 1,
                          item.variation?.id
                        )
                      }
                      className="px-3 py-1 hover:bg-gray-100"
                    >
                      +
                    </button>
                  </div>

                  <button
                    onClick={() =>
                      removeItem(item.product.id, item.variation?.id)
                    }
                    className="text-red-600 hover:text-red-800"
                  >
                    Remover
                  </button>
                </div>
              </div>
            </div>
          ))}

          <button
            onClick={clearCart}
            className="text-red-600 hover:text-red-800 text-sm"
          >
            Limpar carrinho
          </button>
        </div>

        <div className="border rounded-lg p-6 h-fit">
          <h2 className="text-xl font-bold mb-4">Resumo</h2>

          <div className="space-y-2 mb-6">
            {items.map((item) => (
              <div
                key={`${item.product.id}-${item.variation?.id}`}
                className="flex justify-between text-sm"
              >
                <span className="text-gray-600">
                  {item.product.name} x{item.quantity}
                </span>
                <span>
                  R${' '}
                  (
                  {(item.variation?.price_override ?? item.product.price) *
                    item.quantity}
                  ).toFixed(2)
                </span>
              </div>
            ))}
          </div>

          <div className="border-t pt-4">
            <div className="flex justify-between font-bold text-lg">
              <span>Total</span>
              <span>R$ {getTotal().toFixed(2)}</span>
            </div>
          </div>

          <Link
            to="/checkout"
            className="block w-full bg-gray-900 text-white py-3 rounded-lg font-semibold text-center mt-6 hover:bg-gray-800 transition-colors"
          >
            Finalizar Compra
          </Link>
        </div>
      </div>
    </div>
  );
}
