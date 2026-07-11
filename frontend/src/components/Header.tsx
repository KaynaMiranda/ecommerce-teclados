import { Link } from 'react-router-dom';
import { useCartStore } from '../store/cartStore';
import { useAuthStore } from '../store/authStore';

export function Header() {
  const itemCount = useCartStore((state) => state.getItemCount());
  const { user, signOut } = useAuthStore();

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link to="/" className="text-xl font-bold">
          TechKeys
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="hover:text-gray-600">
            Produtos
          </Link>
        </nav>

        <div className="flex items-center gap-4">
          {user ? (
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600 hidden sm:block">
                {user.user_metadata?.full_name || user.email}
              </span>
              <button
                onClick={() => signOut()}
                className="text-sm text-gray-600 hover:text-gray-900"
              >
                Sair
              </button>
            </div>
          ) : (
            <Link
              to="/login"
              className="text-sm text-gray-600 hover:text-gray-900"
            >
              Entrar
            </Link>
          )}

          <Link to="/carrinho" className="relative">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              />
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-600 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {itemCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}
