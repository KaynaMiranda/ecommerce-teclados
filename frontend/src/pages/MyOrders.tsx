import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import api from '../services/api';
import type { Order } from '../types';

const statusLabels: Record<string, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu para entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const statusSteps = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'];

export function MyOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  useEffect(() => {
    if (user) loadOrders();
  }, [user]);

  async function loadOrders() {
    try {
      const { data } = await api.get('/api/orders', { params: { user_id: user?.id } });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(orderId: string) {
    if (!user || !confirm('Tem certeza que deseja cancelar este pedido?')) return;
    try {
      await api.post(`/api/orders/${orderId}/cancel`, { user_id: user.id });
      loadOrders();
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Erro ao cancelar');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', year: '2-digit',
      hour: '2-digit', minute: '2-digit',
    });
  }

  function getCurrentStep(status: string) {
    return statusSteps.indexOf(status);
  }

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white border rounded-lg p-4 animate-pulse">
              <div className="flex justify-between mb-2">
                <div className="bg-gray-200 h-5 w-24 rounded" />
                <div className="bg-gray-200 h-5 w-20 rounded" />
              </div>
              <div className="bg-gray-200 h-4 w-32 rounded" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Meus Pedidos</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-400 mb-4">Você ainda não fez nenhum pedido</p>
          <Link to="/" className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">Ver Produtos</Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map(order => {
            const isExpanded = expandedId === order.id;
            const canCancel = ['pending', 'confirmed'].includes(order.status);
            const currentStep = getCurrentStep(order.status);

            return (
              <div key={order.id} className="bg-white border rounded-lg">
                {/* Header - clickable */}
                <button
                  onClick={() => setExpandedId(isExpanded ? null : order.id)}
                  className="w-full p-4 text-left hover:bg-gray-50 transition-colors"
                >
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="font-mono text-sm text-gray-500">Pedido #{order.order_number}</span>
                      <p className="text-sm text-gray-500">{formatDate(order.created_at)}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                      <svg className={`w-4 h-4 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                        fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Progress bar */}
                  {order.status !== 'cancelled' && (
                    <div className="flex gap-1 mt-3">
                      {statusSteps.map((step, i) => (
                        <div key={step} className={`h-1.5 flex-1 rounded ${i <= currentStep ? 'bg-green-500' : 'bg-gray-200'}`} />
                      ))}
                    </div>
                  )}
                </button>

                {/* Expanded details */}
                {isExpanded && (
                  <div className="border-t p-4 space-y-4">
                    {/* Delivery info */}
                    {(order as any).delivery_schedule && (
                      <div className="text-sm">
                        <span className="text-gray-500">Horário de entrega: </span>
                        <span className="font-medium">{(order as any).delivery_schedule.name}</span>
                        <span className="text-gray-400"> ({(order as any).delivery_schedule.start_time?.slice(0,5)} - {(order as any).delivery_schedule.end_time?.slice(0,5)})</span>
                      </div>
                    )}

                    {/* Items */}
                    <div className="space-y-2">
                      {order.items?.map(item => (
                        <div key={item.id} className="flex justify-between text-sm">
                          <span className="text-gray-600">
                            {item.product?.name} {item.variation?.name && `- ${item.variation.name}`} x{item.quantity}
                          </span>
                          <span className="font-medium">R$ {item.total_price.toFixed(2)}</span>
                        </div>
                      ))}
                    </div>

                    {/* Totals */}
                    <div className="border-t pt-3 space-y-1 text-sm">
                      <div className="flex justify-between"><span>Subtotal</span><span>R$ {order.subtotal.toFixed(2)}</span></div>
                      <div className="flex justify-between"><span>Frete</span><span>R$ {order.shipping_fee.toFixed(2)}</span></div>
                      {order.discount > 0 && (
                        <div className="flex justify-between text-green-600"><span>Desconto</span><span>- R$ {order.discount.toFixed(2)}</span></div>
                      )}
                      <div className="flex justify-between font-bold text-base border-t pt-1"><span>Total</span><span>R$ {order.total.toFixed(2)}</span></div>
                    </div>

                    {/* Cancel button */}
                    {canCancel && (
                      <button onClick={() => handleCancel(order.id)}
                        className="text-red-600 hover:text-red-700 text-sm font-medium">
                        Cancelar Pedido
                      </button>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
