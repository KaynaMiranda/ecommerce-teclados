import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { DeliveryZone } from '../../types';

export function AdminFreight() {
  const { user } = useAuthStore();
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<DeliveryZone | null>(null);
  const [form, setForm] = useState({
    name: '',
    radius_km: '',
    center_lat: '',
    center_lng: '',
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
      center_lat: Number(form.center_lat),
      center_lng: Number(form.center_lng),
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
    setForm({ name: '', radius_km: '', center_lat: '-23.5505', center_lng: '-46.6333', shipping_fee: '', estimated_delivery_minutes: '', active: true });
  }

  function startEdit(zone: DeliveryZone) {
    setForm({
      name: zone.name,
      radius_km: String(zone.radius_km),
      center_lat: String(zone.center_lat),
      center_lng: String(zone.center_lng),
      shipping_fee: String(zone.shipping_fee),
      estimated_delivery_minutes: String(zone.estimated_delivery_minutes),
      active: zone.active,
    });
    setEditing(zone);
    setShowForm(true);
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Zonas de Entrega</h1>
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
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required placeholder="Ex: Zona Centro" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Raio (km) *</label>
              <input type="number" step="0.1" value={form.radius_km} onChange={e => setForm({...form, radius_km: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Latitude *</label>
              <input type="number" step="0.0001" value={form.center_lat} onChange={e => setForm({...form, center_lat: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Longitude *</label>
              <input type="number" step="0.0001" value={form.center_lng} onChange={e => setForm({...form, center_lng: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Valor do Frete (R$) *</label>
              <input type="number" step="0.01" value={form.shipping_fee} onChange={e => setForm({...form, shipping_fee: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tempo Estimado (min) *</label>
              <input type="number" value={form.estimated_delivery_minutes} onChange={e => setForm({...form, estimated_delivery_minutes: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div className="flex items-center gap-2">
              <input type="checkbox" id="active" checked={form.active} onChange={e => setForm({...form, active: e.target.checked})}
                className="rounded" />
              <label htmlFor="active" className="text-sm font-medium">Ativa</label>
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-white border rounded-lg p-4">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold">{zone.name}</h3>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${zone.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}`}>
                {zone.active ? 'Ativa' : 'Inativa'}
              </span>
            </div>
            <div className="text-sm text-gray-600 space-y-1 mb-4">
              <p>Raio: {zone.radius_km} km</p>
              <p>Frete: R$ {zone.shipping_fee.toFixed(2)}</p>
              <p>Entrega: ~{zone.estimated_delivery_minutes} min</p>
              <p className="text-xs text-gray-400">Centro: {zone.center_lat}, {zone.center_lng}</p>
            </div>
            <div className="flex gap-3">
              <button onClick={() => startEdit(zone)} className="text-blue-600 hover:underline text-sm">Editar</button>
              <button onClick={() => handleDelete(zone.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
            </div>
          </div>
        ))}
        {zones.length === 0 && (
          <div className="col-span-3 text-center text-gray-400 py-8">Nenhuma zona cadastrada</div>
        )}
      </div>
    </div>
  );
}
