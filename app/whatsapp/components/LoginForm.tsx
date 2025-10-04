import { useState } from 'react';

interface LoginFormProps {
  onLogin: (password: string) => void;
  isAuthenticating: boolean;
  error: string | null;
}

export default function LoginForm({ onLogin, isAuthenticating, error }: LoginFormProps) {
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) return;
    onLogin(password);
  };

  return (
    <div className="px-3 lg:px-0 max-w-xl mx-auto pt-20 pb-32">
      <div className="w-full max-w-md">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-2">
              Contraseña
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="flex-1 px-4 py-3 border border-gray-700 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-gray-800 text-white placeholder-gray-400"
                placeholder="Ingresa tu contraseña"
                required
              />
              <button
                type="submit"
                disabled={isAuthenticating || !password.trim()}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer w-full sm:w-auto"
              >
                {isAuthenticating ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                    Verificando...
                  </span>
                ) : (
                  'Acceder'
                )}
              </button>
            </div>
          </div>

          {error && (
            <div className="p-3 bg-red-500/20 border border-red-500/30 rounded-lg">
              <p className="text-sm text-red-400">{error}</p>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
