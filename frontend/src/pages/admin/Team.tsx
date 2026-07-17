import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { Profile } from '../../types';

export function AdminTeam() {
  const { user } = useAuthStore();
  const [staff, setStaff] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);
  const [showInvite, setShowInvite] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('attendant');

  useEffect(() => {
    loadStaff();
  }, []);

  async function loadStaff() {
    if (!user) return;
    try {
      const data = await adminService.getStaff(user.id);
      setStaff(data);
    } finally {
      setLoading(false);
    }
  }

  async function handleInvite(e: React.FormEvent) {
    e.preventDefault();
    if (!user || !email) return;

    try {
      await adminService.inviteStaff(user.id, email, role);
      setShowInvite(false);
      setEmail('');
      setRole('attendant');
      alert('Convite enviado!');
      loadStaff();
    } catch {
      alert('Erro ao enviar convite');
    }
  }

  async function handleRemove(staffUserId: string) {
    if (!user || !confirm('Remover este membro da equipe?')) return;
    await adminService.removeStaff(user.id, staffUserId);
    loadStaff();
  }

  async function handleRoleChange(staffUserId: string, newRole: string) {
    if (!user) return;
    await adminService.updateStaffRole(user.id, staffUserId, newRole);
    loadStaff();
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Equipe</h1>
        <button
          onClick={() => setShowInvite(true)}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800"
        >
          + Convidar Membro
        </button>
      </div>

      {showInvite && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">Convidar Membro</h2>
          <form onSubmit={handleInvite} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm font-medium mb-1">Email *</label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="w-full border rounded-lg px-3 py-2" required placeholder="email@exemplo.com" />
            </div>
            <div className="w-48">
              <label className="block text-sm font-medium mb-1">Função *</label>
              <select value={role} onChange={e => setRole(e.target.value)}
                className="w-full border rounded-lg px-3 py-2">
                <option value="attendant">Atendente</option>
                <option value="manager">Gerente</option>
                <option value="admin">Administrador</option>
              </select>
            </div>
            <div className="flex gap-2">
              <button type="submit" className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
                Enviar Convite
              </button>
              <button type="button" onClick={() => setShowInvite(false)}
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
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Nome</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Função</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {staff.map((member) => (
              <tr key={member.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium">{member.full_name}</td>
                <td className="px-4 py-3 text-sm text-gray-500">-</td>
                <td className="px-4 py-3">
                  <select
                    value={member.role}
                    onChange={(e) => handleRoleChange(member.user_id, e.target.value)}
                    className="border rounded px-2 py-1 text-sm"
                  >
                    <option value="attendant">Atendente</option>
                    <option value="manager">Gerente</option>
                    <option value="admin">Administrador</option>
                  </select>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => handleRemove(member.user_id)} className="text-red-600 hover:underline text-sm">
                    Remover
                  </button>
                </td>
              </tr>
            ))}
            {staff.length === 0 && (
              <tr><td colSpan={4} className="px-4 py-8 text-center text-gray-400">Nenhum membro na equipe</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
