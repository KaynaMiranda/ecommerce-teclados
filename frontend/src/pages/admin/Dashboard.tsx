import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';

interface DashboardData {
  ordersToday: number;
  revenueToday: number;
  ordersPending: number;
  totalProducts: number;
  lowStock: Array<{ id: string; stock_quantity: number; product: { name: string } }>;
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    adminService.getDashboard(user.id).then(setData).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;
  if (!data) return <div className="text-red-500">Erro ao carregar dashboard</div>;

  const stats = [
    { label: 'Pedidos Hoje', value: data.ordersToday, color: 'bg-blue-500' },
    { label: 'Receita Hoje', value: `R$ ${data.revenueToday.toFixed(2)}`, color: 'bg-green-500' },
    { label: 'Pedidos Pendentes', value: data.ordersPending, color: 'bg-yellow-500' },
    { label: 'Produtos Ativos', value: data.totalProducts, color: 'bg-purple-500' },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white border rounded-lg p-4">
            <div className={`w-10 h-10 ${stat.color} rounded-lg flex items-center justify-center mb-3`}>
              <span className="text-white text-lg font-bold">{String(stat.value).charAt(0)}</span>
            </div>
            <div className="text-2xl font-bold">{stat.value}</div>
            <div className="text-sm text-gray-500">{stat.label}</div>
          </div>
        ))}
      </div>

      {data.lowStock.length > 0 && (
        <div className="bg-white border rounded-lg p-4">
          <h2 className="font-semibold mb-3">Estoque Baixo</h2>
          <div className="space-y-2">
            {data.lowStock.map((item) => (
              <div key={item.id} className="flex justify-between items-center text-sm">
                <span>{item.product.name}</span>
                <span className="text-red-600 font-medium">{item.stock_quantity} unidades</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
