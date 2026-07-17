import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService, type StockMovement } from '../../services/admin';

export function AdminStock() {
  const { user } = useAuthStore();
  const [movements, setMovements] = useState<StockMovement[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadMovements();
  }, []);

  async function loadMovements() {
    if (!user) return;
    try {
      const data = await adminService.getStockMovements(user.id);
      setMovements(data);
    } finally {
      setLoading(false);
    }
  }

  function formatDate(dateStr: string) {
    return new Date(dateStr).toLocaleDateString('pt-BR', {
      day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit',
    });
  }

  function getTypeLabel(type: string) {
    switch (type) {
      case 'in': return { label: 'Entrada', color: 'bg-green-100 text-green-800' };
      case 'out': return { label: 'Saída', color: 'bg-red-100 text-red-800' };
      case 'adjustment': return { label: 'Ajuste', color: 'bg-blue-100 text-blue-800' };
      default: return { label: type, color: 'bg-gray-100 text-gray-800' };
    }
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Movimentação de Estoque</h1>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Data</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Produto</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">SKU</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Quantidade</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Motivo</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {movements.map((m) => {
              const typeInfo = getTypeLabel(m.type);
              return (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3 text-sm text-gray-500">{formatDate(m.created_at)}</td>
                  <td className="px-4 py-3 text-sm font-medium">{m.product?.name || '-'}</td>
                  <td className="px-4 py-3 text-sm text-gray-500 font-mono">{m.variation?.sku || '-'}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${typeInfo.color}`}>
                      {typeInfo.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm font-medium">{m.quantity}</td>
                  <td className="px-4 py-3 text-sm text-gray-500">{m.reason || '-'}</td>
                </tr>
              );
            })}
            {movements.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhuma movimentação registrada</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
