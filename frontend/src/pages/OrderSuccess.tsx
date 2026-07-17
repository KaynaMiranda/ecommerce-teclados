import { Link, useLocation } from 'react-router-dom';

export function OrderSuccess() {
  const location = useLocation();
  const { orderId, orderNumber } = location.state || {};

  return (
    <div className="max-w-lg mx-auto px-4 py-16 text-center">
      <div className="bg-green-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
        <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
        </svg>
      </div>

      <h1 className="text-2xl font-bold mb-2">Pedido Confirmado!</h1>
      <p className="text-gray-600 mb-4">
        Seu pedido <strong>#{orderNumber || orderId?.slice(0, 8)}</strong> foi realizado com sucesso.
      </p>

      <p className="text-gray-600 mb-8">
        Você receberá uma confirmação via WhatsApp com os detalhes do seu pedido.
      </p>

      <div className="space-y-3">
        <Link
          to="/"
          className="block w-full bg-green-600 text-white py-3 rounded-lg font-semibold hover:bg-green-700"
        >
          Continuar Comprando
        </Link>
      </div>
    </div>
  );
}
