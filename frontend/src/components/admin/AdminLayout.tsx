import { Link, useLocation, Navigate } from 'react-router-dom';
import { useAuthStore } from '../../store/authStore';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, profile, loading, isAdmin } = useAuthStore();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  if (!user || !isAdmin()) {
    return <Navigate to="/" replace />;
  }

  const navItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/pedidos', label: 'Pedidos' },
    { path: '/admin/produtos', label: 'Produtos' },
    { path: '/admin/clientes', label: 'Clientes B2B' },
    { path: '/admin/frete', label: 'Frete' },
    { path: '/admin/equipe', label: 'Equipe' },
    { path: '/admin/estoque', label: 'Estoque' },
    { path: '/admin/config', label: 'Configurações' },
  ];

  return (
    <div className="flex min-h-[calc(100vh-65px)]">
      <aside className="w-64 bg-white border-r p-4">
        <h2 className="text-lg font-bold mb-2">Farma+</h2>
        <p className="text-xs text-gray-500 mb-6">
          {profile?.full_name} • {profile?.role === 'admin' ? 'Administrador' : profile?.role === 'manager' ? 'Gerente' : 'Atendente'}
        </p>
        <nav className="space-y-1">
          {navItems.map((item) => {
            const isActive = item.exact
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path);

            return (
              <Link
                key={item.path}
                to={item.path}
                className={`block px-3 py-2 rounded-lg text-sm transition-colors ${
                  isActive
                    ? 'bg-gray-900 text-white'
                    : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>
      <main className="flex-1 p-6 bg-gray-50">{children}</main>
    </div>
  );
}
