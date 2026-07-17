import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';

export function Header() {
  const { user, profile, signOut, isStaff } = useAuthStore();
  const getItemCount = useCartStore(state => state.getItemCount);
  const itemCount = getItemCount();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2">
            <span className="text-2xl">💊</span>
            <span className="text-xl font-bold text-green-700">Farma+</span>
          </Link>
          <nav className="hidden md:flex items-center gap-4">
            <Link to="/" className="text-sm text-gray-600 hover:text-green-600">Produtos</Link>
            {isStaff() && (
              <Link to="/admin" className="text-sm text-gray-600 hover:text-green-600">Painel</Link>
            )}
          </nav>
        </div>

        <div className="flex items-center gap-4">
          <Link to="/carrinho" className="relative p-2 text-gray-600 hover:text-green-600">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs w-5 h-5 rounded-full flex items-center justify-center font-medium">
                {itemCount > 99 ? '99+' : itemCount}
              </span>
            )}
          </Link>

          {user ? (
            <div className="relative">
              <button
                onClick={() => setMenuOpen(!menuOpen)}
                className="flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
              >
                <span className="hidden md:block">{profile?.full_name || user.email}</span>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {menuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
                  <div className="absolute right-0 mt-2 w-48 bg-white border rounded-lg shadow-lg z-50 py-1">
                    <Link to="/meu-perfil" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Meu Perfil
                    </Link>
                    <Link to="/meus-pedidos" onClick={() => setMenuOpen(false)}
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                      Meus Pedidos
                    </Link>
                    {isStaff() && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}
                        className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-50">
                        Painel Admin
                      </Link>
                    )}
                    <hr className="my-1" />
                    <button onClick={() => { signOut(); setMenuOpen(false); }}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50">
                      Sair
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            <Link
              to="/login"
              className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700"
            >
              Entrar
            </Link>
          )}
        </div>
      </div>
    </header>
  );
}
