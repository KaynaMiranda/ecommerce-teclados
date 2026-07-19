import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { DeliveryZone } from '../../types';

const PHARMACY_LAT = -16.6686;
const PHARMACY_LNG = -49.2940;

export function AdminFreight() {
  const { user } = useAuthStore();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({
    name: '',
    radius_km: '',
    shipping_fee: '',
    estimated_delivery_minutes: '',
    active: true,
  });

  useEffect(() => {
    loadZones();
  }, []);

  async function loadZones() {
    if (!user) return;
    try {
      const data = await adminService.getDeliveryZones(user.id);
      setZones(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const payload = {
      name: form.name,
      radius_km: Number(form.radius_km),
      center_lat: PHARMACY_LAT,
      center_lng: PHARMACY_LNG,
      shipping_fee: Number(form.shipping_fee),
      estimated_delivery_minutes: Number(form.estimated_delivery_minutes),
      active: form.active,
    };

    try {
      if (editing) {
        await adminService.updateDeliveryZone(user.id, editing.id, payload);
      } else {
        await adminService.createDeliveryZone(user.id, payload);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadZones();
    } catch {
      alert('Erro ao salvar zona');
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('Excluir esta zona de entrega?')) return;
    await adminService.deleteDeliveryZone(user.id, id);
    loadZones();
  }

  function resetForm() {
    setForm({ name: '', radius_km: '', shipping_fee: '', estimated_delivery_minutes: '', active: true });
  }

  function startEdit(zone: DeliveryZone) {
    setForm({
      name: zone.name,
      radius_km: String(zone.radius_km),
      shipping_fee: String(zone.shipping_fee),
      estimated_delivery_minutes: String(zone.estimated_delivery_minutes),
      active: zone.active,
    });
    setEditing(zone);
    setShowForm(true);
  }

  function getDefaultName() {
    if (zones.length === 0) return 'Zona Centro';
    const maxRadius = Math.max(...zones.map(z => Number(z.radius_km)));
    if (maxRadius <= 3) return 'Zona Próxima';
    if (maxRadius <= 8) return 'Zona Intermediária';
    if (maxRadius <= 15) return 'Zona Distante';
    return `Zona ${zones.length + 1}`;
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
          <p className="text-sm text-gray-500 mt-1">Configure as faixas de distância e valor do frete próprio</p>
        </div>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + Nova Zona
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Zona' : 'Nova Zona'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome da Zona *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required
                placeholder={editing ? '' : getDefaultName()} />
              <p className="text-xs text-gray-400 mt-1">Ex: Zona Centro, Zona Norte</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Raio Máximo (km) *</label>
              <input type="number" step="0.5" min="0.5" value={form.radius_km} onChange={e => setForm({...form, radius_km: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: 3" />
              <p className="text-xs text-gray-400 mt-1">Distância máxima da farmácia</p>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor do Frete (R$) *</label>
              <input type="number" step="0.01" min="0" value={form.shipping_fee} onChange={e => setForm({...form, shipping_fee: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: 5.99" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tempo Estimado (min) *</label>
              <input type="number" min="10" value={form.estimated_delivery_minutes} onChange={e => setForm({...form, estimated_delivery_minutes: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: 30" />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})}
                className="rounded" />
              <label htmlFor="active" className="text-sm font-medium">Zona ativa</label>
            </div>

            <div className="col-span-2 flex gap-3 pt-4">
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                {editing ? 'Salvar' : 'Criar'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {zones.length === 0 ? (
        <div className="text-center py-12 bg-white border rounded-lg">
          <p className="text-gray-400 mb-4">Nenhuma zona de entrega cadastrada</p>
          <p className="text-sm text-gray-500">Crie zonas definindo distância máxima e valor do frete</p>
        </div>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Zona</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Raio</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Frete</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tempo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {zones.sort((a, b) => a.radius_km - b.radius_km).map(zone => (
                <tr key={zone.id} className={!zone.active ? 'bg-gray-50 text-gray-400' : ''}>
                  <td className="px-4 py-3 font-medium">{zone.name}</td>
                  <td className="px-4 py-3">até {zone.radius_km} km</td>
                  <td className="px-4 py-3 font-medium">R$ {zone.shipping_fee.toFixed(2)}</td>
                  <td className="px-4 py-3">~{zone.estimated_delivery_minutes} min</td>
                  <td className="px-4 py-3">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${zone.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'}`}>
                      {zone.active ? 'Ativa' : 'Inativa'}
                    </span>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => startEdit(zone)} className="text-blue-600 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDelete(zone.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
