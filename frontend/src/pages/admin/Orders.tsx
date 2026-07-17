import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { Order, OrderStatus } from '../../types';

const statusLabels: Record<OrderStatus, string> = {
  pending: 'Pendente',
  confirmed: 'Confirmado',
  preparing: 'Preparando',
  out_for_delivery: 'Saiu p/ Entrega',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const statusColors: Record<OrderStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  preparing: 'bg-purple-100 text-purple-800',
  out_for_delivery: 'bg-orange-100 text-orange-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

const allowedTransitions: Record<string, string[]> = {
  pending: ['confirmed', 'cancelled'],
  confirmed: ['preparing', 'cancelled'],
  preparing: ['out_for_delivery', 'cancelled'],
  out_for_delivery: ['delivered'],
  delivered: [],
  cancelled: [],
};

export function AdminOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState('');
  const [filterType, setFilterType] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadOrders();
  }, [filterStatus, filterType]);

  async function loadOrders() {
    if (!user) return;
    setLoading(true);
    try {
      const data = await adminService.getOrders(user.id, {
        status: filterStatus || undefined,
        order_type: filterType || undefined,
      });
      setOrders(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(orderId: string, newStatus: string) {
    if (!user) return;
    try {
      await adminService.updateOrderStatus(user.id, orderId, newStatus);
      loadOrders();
      if (selectedOrder?.id === orderId) {
        setSelectedOrder({ ...selectedOrder!, status: newStatus as OrderStatus });
      }
    } catch (err: any) {
      alert(err?.response?.data?.error || 'Erro ao atualizar status');
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      {/* Filters */}
      <div className="flex gap-3 mb-6">
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os status</option>
          {Object.entries(statusLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}
          className="border rounded-lg px-3 py-2 text-sm">
          <option value="">Todos os tipos</option>
          <option value="b2c">B2C</option>
          <option value="b2b">B2B</option>
        </select>
        <button onClick={loadOrders} className="border rounded-lg px-3 py-2 text-sm hover:bg-gray-50">Atualizar</button>
      </div>

      <div className="flex gap-6">
        {/* Orders Table */}
        <div className="flex-1 bg-white border rounded-lg overflow-hidden">
          {loading ? (
            <div className="p-8 text-center text-gray-400">Carregando...</div>
          ) : orders.length === 0 ? (
            <div className="p-8 text-center text-gray-400">Nenhum pedido encontrado</div>
          ) : (
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">#</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Cliente</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tipo</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Total</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Data</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {orders.map((order) => (
                  <tr key={order.id}
                    onClick={() => setSelectedOrder(order)}
                    className={`cursor-pointer hover:bg-gray-50 ${selectedOrder?.id === order.id ? 'bg-blue-50' : ''}`}>
                    <td className="px-4 py-3 text-sm font-mono">{order.order_number}</td>
                    <td className="px-4 py-3">
                      <div className="text-sm font-medium">
                        {order.profile?.full_name || order.b2b_client?.company_name || '-'}
                      </div>
                      <div className="text-xs text-gray-500">
                        {order.profile?.phone || order.b2b_client?.cnpj || ''}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.order_type === 'b2b' ? 'bg-indigo-100 text-indigo-800' : 'bg-gray-100 text-gray-800'}`}>
                        {order.order_type.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm font-medium">R$ {order.total.toFixed(2)}</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColors[order.status]}`}>
                        {statusLabels[order.status]}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-500">{formatDate(order.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Order Detail Panel */}
        {selectedOrder && (
          <div className="w-96 bg-white border rounded-lg p-6 h-fit sticky top-24 overflow-y-auto max-h-[80vh]">
            <div className="flex justify-between items-start mb-4">
              <h2 className="text-lg font-semibold">Pedido #{selectedOrder.order_number}</h2>
              <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-gray-600">✕</button>
            </div>

            <div className="space-y-4 text-sm">
              {/* Status flow */}
              <div>
                <span className="text-gray-500 text-xs">Status atual</span>
                <div className="flex gap-1 mt-2">
                  {['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].map((step, i) => {
                    const currentIdx = ['pending', 'confirmed', 'preparing', 'out_for_delivery', 'delivered'].indexOf(selectedOrder.status);
                    return (
                      <div key={step} className={`h-2 flex-1 rounded ${i <= currentIdx ? 'bg-green-500' : 'bg-gray-200'}`} />
                    );
                  })}
                </div>
              </div>

              {/* Next status buttons */}
              {allowedTransitions[selectedOrder.status]?.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {allowedTransitions[selectedOrder.status].map(nextStatus => (
                    <button key={nextStatus}
                      onClick={() => handleStatusChange(selectedOrder.id, nextStatus)}
                      className={`px-3 py-1 rounded text-xs font-medium ${
                        nextStatus === 'cancelled'
                          ? 'bg-red-100 text-red-700 hover:bg-red-200'
                          : 'bg-green-100 text-green-700 hover:bg-green-200'
                      }`}>
                      → {statusLabels[nextStatus as OrderStatus]}
                    </button>
                  ))}
                </div>
              )}

              <div className="border-t pt-3">
                <span className="text-gray-500">Cliente:</span>
                <p className="font-medium">{selectedOrder.profile?.full_name || selectedOrder.b2b_client?.company_name}</p>
                {selectedOrder.profile?.phone && <p className="text-gray-500">{selectedOrder.profile.phone}</p>}
              </div>

              {selectedOrder.b2b_client && (
                <div>
                  <span className="text-gray-500">CNPJ:</span>
                  <p className="font-medium">{selectedOrder.b2b_client.cnpj}</p>
                </div>
              )}

              <div>
                <span className="text-gray-500">Pagamento:</span>
                <p className="font-medium capitalize">{selectedOrder.payment_method === 'pix' ? 'PIX' : 'Cartão'}</p>
                {selectedOrder.discount > 0 && <p className="text-green-600 text-xs">Desconto: -R$ {selectedOrder.discount.toFixed(2)}</p>}
              </div>

              {/* Delivery schedule */}
              {(selectedOrder as any).delivery_schedule && (
                <div>
                  <span className="text-gray-500">Horário de entrega:</span>
                  <p className="font-medium">{(selectedOrder as any).delivery_schedule.name} ({(selectedOrder as any).delivery_schedule.start_time?.slice(0,5)} - {(selectedOrder as any).delivery_schedule.end_time?.slice(0,5)})</p>
                </div>
              )}

              {selectedOrder.shipping_address_snapshot && (
                <div>
                  <span className="text-gray-500">Endereço:</span>
                  <p className="font-medium">
                    {String(selectedOrder.shipping_address_snapshot.street)}, {String(selectedOrder.shipping_address_snapshot.number)}
                    {selectedOrder.shipping_address_snapshot.complement ? ` - ${selectedOrder.shipping_address_snapshot.complement}` : ''}
                  </p>
                  <p>{String(selectedOrder.shipping_address_snapshot.neighborhood)}, {String(selectedOrder.shipping_address_snapshot.city)} - {String(selectedOrder.shipping_address_snapshot.state)}</p>
                </div>
              )}

              <div className="border-t pt-3">
                <span className="text-gray-500">Itens:</span>
                {selectedOrder.items?.map((item) => (
                  <div key={item.id} className="flex justify-between mt-2">
                    <span>{item.product?.name} {item.variation?.name && `- ${item.variation.name}`} x{item.quantity}</span>
                    <span className="font-medium">R$ {item.total_price.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              <div className="border-t pt-3 space-y-1">
                <div className="flex justify-between"><span>Subtotal</span><span>R$ {selectedOrder.subtotal.toFixed(2)}</span></div>
                <div className="flex justify-between"><span>Frete</span><span>R$ {selectedOrder.shipping_fee.toFixed(2)}</span></div>
                {selectedOrder.discount > 0 && (
                  <div className="flex justify-between text-green-600"><span>Desconto</span><span>- R$ {selectedOrder.discount.toFixed(2)}</span></div>
                )}
                <div className="flex justify-between font-bold text-lg border-t pt-2"><span>Total</span><span>R$ {selectedOrder.total.toFixed(2)}</span></div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
