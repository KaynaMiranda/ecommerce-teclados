import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';

interface Order {
  id: string;
  status: string;
  total: number;
  payment_method: string;
  created_at: string;
  profile?: {
    full_name: string;
    user?: { email: string };
  };
}

const STATUS_LABELS: Record<string, string> = {
  pending: 'Pendente',
  paid: 'Pago',
  shipped: 'Enviado',
  delivered: 'Entregue',
  cancelled: 'Cancelado',
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  paid: 'bg-blue-100 text-blue-800',
  shipped: 'bg-purple-100 text-purple-800',
  delivered: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export function AdminOrders() {
  const { user } = useAuthStore();
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    adminService
      .getOrders(user.id)
      .then(setOrders)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    if (!user) return;
    await adminService.updateOrderStatus(user.id, orderId, newStatus);
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o))
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Pedidos</h1>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 font-medium">Pedido</th>
              <th className="text-left px-4 py-3 font-medium">Cliente</th>
              <th className="text-left px-4 py-3 font-medium">Total</th>
              <th className="text-left px-4 py-3 font-medium">Pagamento</th>
              <th className="text-left px-4 py-3 font-medium">Status</th>
              <th className="text-left px-4 py-3 font-medium">Data</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <tr key={order.id} className="border-b last:border-b-0">
                <td className="px-4 py-3 font-mono text-xs">
                  {order.id.slice(0, 8)}...
                </td>
                <td className="px-4 py-3">
                  {order.profile?.full_name || '-'}
                  <br />
                  <span className="text-xs text-gray-500">
                    {order.profile?.user?.email}
                  </span>
                </td>
                <td className="px-4 py-3 font-semibold">
                  R$ {Number(order.total).toFixed(2)}
                </td>
                <td className="px-4 py-3 capitalize">
                  {order.payment_method === 'pix' ? 'PIX' : 'Cartão'}
                </td>
                <td className="px-4 py-3">
                  <select
                    value={order.status}
                    onChange={(e) => handleStatusChange(order.id, e.target.value)}
                    className={`text-xs px-2 py-1 rounded-full font-medium border-0 ${STATUS_COLORS[order.status] || 'bg-gray-100'}`}
                  >
                    {Object.entries(STATUS_LABELS).map(([value, label]) => (
                      <option key={value} value={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </td>
                <td className="px-4 py-3 text-gray-500 text-xs">
                  {new Date(order.created_at).toLocaleDateString('pt-BR')}
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {orders.length === 0 && (
          <p className="text-center py-8 text-gray-500">Nenhum pedido encontrado</p>
        )}
      </div>
    </div>
  );
}
