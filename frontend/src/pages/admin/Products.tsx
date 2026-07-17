import { useState, useEffect } from 'react';
import { useAuthStore } from '../../store/authStore';
import { adminService } from '../../services/admin';
import type { Product, Category } from '../../types';

export function AdminProducts() {
  const { user } = useAuthStore();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<Product | null>(null);
  const [form, setForm] = useState({
    name: '', slug: '', description: '', price: '', category_id: '',
    image_url: '', laboratory: '', anvisa_code: '', controlled: false, requires_prescription: false,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    if (!user) return;
    try {
      const [prods, cats] = await Promise.all([
        adminService.getProducts(user.id),
        adminService.getCategories(),
      ]);
      setProducts(prods);
      setCategories(cats);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!user) return;

    const payload = {
      ...form,
      price: Number(form.price),
      slug: form.slug || form.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, ''),
    };

    try {
      if (editing) {
        await adminService.updateProduct(user.id, editing.id, payload);
      } else {
        await adminService.createProduct(user.id, payload);
      }
      setShowForm(false);
      setEditing(null);
      resetForm();
      loadData();
    } catch {
      alert('Erro ao salvar produto');
    }
  }

  async function handleDelete(id: string) {
    if (!user || !confirm('Excluir este produto?')) return;
    await adminService.deleteProduct(user.id, id);
    loadData();
  }

  function resetForm() {
    setForm({
      name: '', slug: '', description: '', price: '', category_id: '',
      image_url: '', laboratory: '', anvisa_code: '', controlled: false, requires_prescription: false,
    });
  }

  function startEdit(product: Product) {
    setForm({
      name: product.name,
      slug: product.slug,
      description: product.description || '',
      price: String(product.price),
      category_id: product.category_id,
      image_url: product.image_url || '',
      laboratory: product.laboratory || '',
      anvisa_code: product.anvisa_code || '',
      controlled: product.controlled,
      requires_prescription: product.requires_prescription,
    });
    setEditing(product);
    setShowForm(true);
  }

  if (loading) return <div className="animate-pulse text-gray-400">Carregando...</div>;

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Produtos</h1>
        <button onClick={() => { setShowForm(true); setEditing(null); resetForm(); }}
          className="bg-gray-900 text-white px-4 py-2 rounded-lg hover:bg-gray-800">
          + Novo Produto
        </button>
      </div>

      {showForm && (
        <div className="bg-white border rounded-lg p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editing ? 'Editar Produto' : 'Novo Produto'}</h2>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Nome *</label>
              <input type="text" value={form.name} onChange={e => setForm({...form, name: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Slug</label>
              <input type="text" value={form.slug} onChange={e => setForm({...form, slug: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" placeholder="gerado automaticamente" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">Descrição</label>
              <textarea value={form.description} onChange={e => setForm({...form, description: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" rows={3} />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Preço (R$) *</label>
              <input type="number" step="0.01" value={form.price} onChange={e => setForm({...form, price: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Categoria *</label>
              <select value={form.category_id} onChange={e => setForm({...form, category_id: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" required>
                <option value="">Selecione...</option>
                {categories.map(cat => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Laboratório</label>
              <input type="text" value={form.laboratory} onChange={e => setForm({...form, laboratory: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Código ANVISA</label>
              <input type="text" value={form.anvisa_code} onChange={e => setForm({...form, anvisa_code: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="col-span-2">
              <label className="block text-sm font-medium mb-1">URL da Imagem</label>
              <input type="text" value={form.image_url} onChange={e => setForm({...form, image_url: e.target.value})}
                className="w-full border rounded-lg px-3 py-2" />
            </div>
            <div className="flex gap-6">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.controlled} onChange={e => setForm({...form, controlled: e.target.checked})}
                  className="rounded" />
                <span className="text-sm">Controlado</span>
              </label>
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={form.requires_prescription} onChange={e => setForm({...form, requires_prescription: e.target.checked})}
                  className="rounded" />
                <span className="text-sm">Requer Receita</span>
              </label>
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

      <div className="bg-white border rounded-lg overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Produto</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Preço</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Categoria</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Variações</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Flags</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {products.map((product) => (
              <tr key={product.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {product.image_url && (
                      <img src={product.image_url} alt="" className="w-10 h-10 rounded object-cover" />
                    )}
                    <div>
                      <div className="font-medium text-sm">{product.name}</div>
                      <div className="text-xs text-gray-500">{product.laboratory}</div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm font-medium">R$ {product.price.toFixed(2)}</td>
                <td className="px-4 py-3 text-sm">{product.category?.name || '-'}</td>
                <td className="px-4 py-3 text-sm">{product.variations?.length || 0}</td>
                <td className="px-4 py-3">
                  <div className="flex gap-1">
                    {product.controlled && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-red-100 text-red-700">Controlado</span>
                    )}
                    {product.requires_prescription && (
                      <span className="px-1.5 py-0.5 rounded text-xs bg-orange-100 text-orange-700">Receita</span>
                    )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <button onClick={() => startEdit(product)} className="text-blue-600 hover:underline text-sm mr-3">Editar</button>
                  <button onClick={() => handleDelete(product.id)} className="text-red-600 hover:underline text-sm">Excluir</button>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-400">Nenhum produto cadastrado</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
