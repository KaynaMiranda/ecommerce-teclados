import { useEffect, useState } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';

interface DashboardData {
  productsCount: number;
  ordersCount: number;
  totalRevenue: number;
}

export function AdminDashboard() {
  const { user } = useAuthStore();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    adminService
      .getDashboard(user.id)
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [user]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Produtos',
      value: data?.productsCount ?? 0,
      color: 'bg-blue-500',
    },
    {
      label: 'Pedidos',
      value: data?.ordersCount ?? 0,
      color: 'bg-green-500',
    },
    {
      label: 'Faturamento',
      value: `R$ ${(data?.totalRevenue ?? 0).toFixed(2)}`,
      color: 'bg-purple-500',
    },
  ];

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-lg p-6 border">
            <p className="text-sm text-gray-600">{stat.label}</p>
            <p className="text-3xl font-bold mt-2">{stat.value}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
