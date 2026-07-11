import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';

export function ForgotPassword() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  const { resetPassword } = useAuthStore();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess(false);
    setLoading(true);

    const result = await resetPassword(email);

    if (result.error) {
      setError(result.error);
      setLoading(false);
      return;
    }

    setSuccess(true);
    setLoading(false);
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-4">Esqueci minha senha</h1>
        <p className="text-center text-gray-600 mb-8">
          Informe seu email para receber um link de redefinição de senha.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-50 text-green-600 p-3 rounded-lg text-sm">
              Email enviado! Verifique sua caixa de entrada.
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-1">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-gray-900"
              placeholder="seu@email.com"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gray-900 text-white py-3 rounded-lg font-semibold hover:bg-gray-800 transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Enviar link de redefinição'}
          </button>
        </form>

        <p className="text-center mt-6 text-gray-600">
          Lembrou a senha?{' '}
          <Link to="/login" className="text-gray-900 font-semibold hover:underline">
            Voltar para o login
          </Link>
        </p>
      </div>
    </div>
  );
}
