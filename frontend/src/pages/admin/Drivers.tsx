import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { Driver, DriverType } from '../../types';

const DRIVER_TYPES: { value: DriverType; label: string }[] = [
  { value: 'own', label: 'Próprio' },
  { value: 'ifood', label: 'iFood' },
  { value: 'rappi', label: 'Rappi' },
  { value: 'other', label: 'Outro' },
];

export function AdminDrivers() {
  const { user } = useAuthStore();
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editDriver, setEditDriver] = useState<Driver | null>(null);
  const [form, setForm] = useState({
    name: '',
    phone: '',
    driver_type: 'own' as DriverType,
    vehicle_type: '',
    plate: '',
  });

  useEffect(() => {
    loadDrivers();
  }, []);

  async function loadDrivers() {
    if (!user) return;
    try {
      const data = await adminService.getDrivers(user.id);
      setDrivers(data);
    } finally {
      setLoading(false);
    }
  }

  function openNew() {
    setEditDriver(null);
    setForm({ name: '', phone: '', driver_type: 'own', vehicle_type: '', plate: '' });
    setShowForm(true);
  }

  function openEdit(d: Driver) {
    setEditDriver(d);
    setForm({
      name: d.name,
      phone: d.phone,
      driver_type: d.driver_type,
      vehicle_type: d.vehicle_type || '',
      plate: d.plate || '',
    });
    setShowForm(true);
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const payload = {
      name: form.name,
      phone: form.phone.replace(/\D/g, ''),
      driver_type: form.driver_type,
      vehicle_type: form.vehicle_type || undefined,
      plate: form.plate?.toUpperCase() || undefined,
      active: true,
    };

    if (editDriver) {
      await adminService.updateDriver(user.id, editDriver.id, payload);
    } else {
      await adminService.createDriver(user.id, payload);
    }

    setShowForm(false);
    loadDrivers();
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('Remover este entregador?')) return;
    await adminService.deleteDriver(user.id, id);
    loadDrivers();
  }

  async function handleToggleActive(d: Driver) {
    if (!user) return;
    await adminService.updateDriver(user.id, d.id, { active: !d.active });
    loadDrivers();
  }

  function formatPhone(value: string) {
    const numbers = value.replace(/\D/g, '');
    if (numbers.length > 6) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    if (numbers.length > 2) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    return numbers;
  }

  function driverTypeLabel(t: DriverType) {
    return DRIVER_TYPES.find(dt => dt.value === t)?.label || t;
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Entregadores</h1>
        <button onClick={openNew}
          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700">
          + Novo Entregador
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editDriver ? 'Editar' : 'Novo'} Entregador</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Telefone *</label>
              <input type="tel" value={form.phone} onChange={e => setForm({...form, phone: formatPhone(e.target.value)})}
                className="w-full border rounded-lg px-3 py-2" placeholder="(11) 99999-9999" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tipo *</label>
              <select value={form.driver_type} onChange={e => setForm({...form, driver_type: e.target.value as DriverType})}
                className="w-full border rounded-lg px-3 py-2">
                {DRIVER_TYPES.map(dt => (
                  <option key={dt.value} value={dt.value}>{dt.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Veículo</label>
              <input type="text" value={form.vehicle_type} onChange={e => setForm({...form, vehicle_type: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" placeholder="Ex: Moto, Bicicleta" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Placa</label>
              <input type="text" value={form.plate} onChange={e => setForm({...form, plate: e.target.value.toUpperCase()})}
                className="w-full border rounded-lg px-3 py-2" placeholder="ABC-1234" maxLength={8} />
            </div>
            <div className="flex items-end gap-2">
              <button type="submit"
                className="bg-green-600 text-white px-6 py-2 rounded-lg hover:bg-green-700">
                {editDriver ? 'Salvar' : 'Criar'}
              </button>
              <button type="button" onClick={() => setShowForm(false)}
                className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      {drivers.length === 0 ? (
        <p className="text-gray-500">Nenhum entregador cadastrado.</p>
      ) : (
        <div className="bg-white border rounded-lg overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Nome</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Telefone</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Tipo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Veículo</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Placa</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Status</th>
                <th className="text-left px-4 py-3 text-sm font-medium text-gray-600">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {drivers.map(d => (
                <tr key={d.id} className={!d.active ? 'bg-gray-50 text-gray-400' : ''}>
                  <td className="px-4 py-3 font-medium">{d.name}</td>
                  <td className="px-4 py-3">{formatPhone(d.phone)}</td>
                  <td className="px-4 py-3">{driverTypeLabel(d.driver_type)}</td>
                  <td className="px-4 py-3">{d.vehicle_type || '—'}</td>
                  <td className="px-4 py-3 font-mono text-sm">{d.plate || '—'}</td>
                  <td className="px-4 py-3">
                    <button onClick={() => handleToggleActive(d)}
                      className={`px-2 py-1 rounded text-xs font-medium ${
                        d.active ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-500'
                      }`}>
                      {d.active ? 'Ativo' : 'Inativo'}
                    </button>
                  </td>
                  <td className="px-4 py-3 space-x-2">
                    <button onClick={() => openEdit(d)} className="text-blue-600 hover:underline text-sm">Editar</button>
                    <button onClick={() => handleDelete(d.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
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
