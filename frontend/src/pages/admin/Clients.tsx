import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { B2BClient } from '../../types';

export function AdminClients() {
  const { user } = useAuthStore();
  const [clients, setClients] = useState<B2BClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<B2BClient | null>(null);
  const [form, setForm] = useState({
    cnpj: '',
    company_name: '',
    trade_name: '',
    client_type: 'drogaria' as 'drogaria' | 'clinica' | 'distribuidora',
    phone: '',
    email: '',
    address_street: '',
    address_number: '',
    address_complement: '',
    address_neighborhood: '',
    address_city: '',
    address_state: '',
    address_zip_code: '',
  });

  useEffect(() => {
    loadClients();
  }, []);

  async function loadClients() {
    if (!user) return;
    try {
      const data = await adminService.getB2BClients(user.id);
      setClients(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    try {
      if (editing) {
        await adminService.updateB2BClient(user.id, editing.id, form);
      } else {
        await adminService.createB2BClient(user.id, form);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadClients();
    } catch {
      alert('Erro ao salvar cliente');
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('Excluir este cliente?')) return;
    await adminService.deleteB2BClient(user.id, id);
    loadClients();
  }

  function resetForm() {
    setForm({
      cnpj: '', company_name: '', trade_name: '', client_type: 'drogaria',
      phone: '', email: '', address_street: '', address_number: '',
      address_complement: '', address_neighborhood: '', address_city: '',
      address_state: '', address_zip_code: '',
    });
  }

  function startEdit(client: B2BClient) {
    setForm({
      cnpj: client.cnpj,
      company_name: client.company_name,
      trade_name: client.trade_name || '',
      client_type: client.client_type,
      phone: client.phone || '',
      email: client.email || '',
      address_street: client.address_street || '',
      address_number: client.address_number || '',
      address_complement: client.address_complement || '',
      address_neighborhood: client.address_neighborhood || '',
      address_city: client.address_city || '',
      address_state: client.address_state || '',
      address_zip_code: client.address_zip_code || '',
    });
    setEditing(client);
    setShowForm(true);
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Clientes B2B</h1>
        <button
          onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + Novo Cliente
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Cliente' : 'Novo Cliente'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">CNPJ *</label>
              <input type="text" value={form.cnpj} onChange={e => setForm({...form, cnpj: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required placeholder="00.000.000/0000-00" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Razão Social *</label>
              <input type="text" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Nome Fantasia</label>
              <input type="text" value={form.trade_name} onChange={e => setForm({...form, trade_name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Tipo *</label>
              <select value={form.client_type} onChange={e => setForm({...form, client_type: e.target.value as any})}
                className="w-full border rounded-lg px-3 py-2" required>
                <option value="drogaria">Drogaria</option>
                <option value="clinica">Clínica/Hospital</option>
                <option value="distribuidora">Distribuidora</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Telefone</label>
              <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>

            <div className="col-span-2 border-t pt-4">
              <h3 className="font-medium mb-2">Endereço</h3>
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">CEP</label>
              <input type="text" value={form.address_zip_code} onChange={e => setForm({...form, address_zip_code: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="col-span-2 md:col-span-1">
              <label className="block text-sm font-medium mb-1">Rua</label>
              <input type="text" value={form.address_street} onChange={e => setForm({...form, address_street: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Número</label>
              <input type="text" value={form.address_number} onChange={e => setForm({...form, address_number: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Complemento</label>
              <input type="text" value={form.address_complement} onChange={e => setForm({...form, address_complement: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Bairro</label>
              <input type="text" value={form.address_neighborhood} onChange={e => setForm({...form, address_neighborhood: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Cidade</label>
              <input type="text" value={form.address_city} onChange={e => setForm({...form, address_city: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">UF</label>
              <input type="text" value={form.address_state} onChange={e => setForm({...form, address_state: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" maxLength={2} />
            </div>

            <div className="col-span-2 flex gap-3 pt-4">
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                {editing ? 'Salvar' : 'Cadastrar'}
              </button>
              <button type="button" onClick={() => { setShowForm(false); setEditing(null); }}
                className="border px-4 py-2 rounded-lg hover:bg-gray-50">
                Cancelar
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Empresa</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">CNPJ</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Tipo</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Cidade</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {clients.map((client) => (
              <tr key={client.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="font-medium">{client.company_name}</div>
                  {client.trade_name && <div className="text-sm text-gray-500">{client.trade_name}</div>}
                </td>
                <td className="px-4 py-3 text-sm">{client.cnpj}</td>
                <td className="px-4 py-3">
                  <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {client.client_type}
                  </span>
                </td>
                <td className="px-4 py-3 text-sm">{client.address_city || '-'}</td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(client)} className="text-blue-600 hover:underline text-sm mr-3">Editar</button>
                  <button onClick={() => handleDelete(client.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr><td colSpan={5} className="px-4 py-8 text-center text-gray-400">Nenhum cliente cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
