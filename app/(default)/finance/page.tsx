'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';

export default function FinancePage() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [sheetData, setSheetData] = useState<any[]>([]);
  const [sheetTitle, setSheetTitle] = useState('');

  useEffect(() => {
    // Verificar si ya está autenticado
    const authStatus = sessionStorage.getItem('finance_auth');
    const savedSheetData = sessionStorage.getItem('finance_sheet_data');
    const savedSheetTitle = sessionStorage.getItem('finance_sheet_title');
    
    if (authStatus === 'true') {
      setIsAuthenticated(true);
      if (savedSheetData) {
        setSheetData(JSON.parse(savedSheetData));
      }
      if (savedSheetTitle) {
        setSheetTitle(savedSheetTitle);
      }
    }
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    try {
      // Primero verificar la contraseña
      const authResponse = await fetch('/api/finance/auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const authData = await authResponse.json();

      if (!authResponse.ok || !authData.success) {
        setError(authData.error || 'Contraseña incorrecta');
        setIsLoading(false);
        return;
      }

      // Si la contraseña es correcta, obtener los datos de la hoja
      const response = await fetch('/api/google-sheets/service-auth', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      });

      const data = await response.json();

      if (response.ok && data.success) {
        sessionStorage.setItem('finance_auth', 'true');
        sessionStorage.setItem('finance_sheet_data', JSON.stringify(data.sheetData));
        sessionStorage.setItem('finance_sheet_title', data.sheetTitle);
        
        setSheetData(data.sheetData);
        setSheetTitle(data.sheetTitle);
        setIsAuthenticated(true);
      } else {
        setError(data.error || 'Error al autenticar');
      }
    } catch (err) {
      setError('Error de conexión');
    }
    
    setIsLoading(false);
  };

  const handleLogout = () => {
    sessionStorage.removeItem('finance_auth');
    sessionStorage.removeItem('finance_sheet_data');
    sessionStorage.removeItem('finance_sheet_title');
    setIsAuthenticated(false);
    setPassword('');
    setSheetData([]);
    setSheetTitle('');
  };

  if (!isAuthenticated) {
    return (
      <div className="w-full pb-16 pt-6">
        {/* Header similar al de ClickUp */}
        <div className="px-4 lg:px-0 max-w-xl mx-auto mb-8">
          <div className="mb-8">
            <div className="flex items-center gap-4">
              <a 
                href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                target="_blank" 
                rel="noopener noreferrer"
                className="cursor-pointer"
              >
                <Image
                  src="/google-sheets-logo.png"
                  alt="Google Sheets Logo"
                  width={64}
                  height={64}
                  className="rounded-lg hover:opacity-80 transition-opacity"
                />
              </a>
              <div>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="cursor-pointer"
                >
                  <h1 className="text-3xl font-bold mb-2 hover:text-green-600 dark:hover:text-green-400 transition-colors">Finanzas Personales</h1>
                </a>
                <a 
                  href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400 transition-colors"
                >
                  docs.google.com/spreadsheets
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Formulario de login con el mismo estilo que ClickUp */}
        <div className="px-4 lg:px-0 max-w-xl mx-auto pt-20 pb-32">
          <div className="w-full max-w-md">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Ingresa tu contraseña"
                    required
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !password.trim()}
                    className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer w-full sm:w-auto"
                  >
                    {isLoading ? (
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
                <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <header className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            {/* Logo y título */}
            <div className="flex items-center space-x-3">
              <div className="flex-shrink-0">
                <Image
                  src="/google-sheets-logo.png"
                  alt="Google Sheets"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Finanzas Personales
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Gestión de presupuesto y gastos
                </p>
              </div>
            </div>

            {/* Navegación */}
            <nav className="hidden md:flex space-x-8">
              <a
                href="/"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                Inicio
              </a>
              <a
                href="/clickup"
                className="text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white px-3 py-2 rounded-md text-sm font-medium transition-colors"
              >
                ClickUp
              </a>
            </nav>

            {/* Botones de acción */}
            <div className="flex items-center space-x-4">
              <a
                href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
                <span>Abrir en Google Sheets</span>
              </a>
              <button
                onClick={handleLogout}
                className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Contenido principal */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700">
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <Image
                  src="/google-sheets-logo.png"
                  alt="Google Sheets"
                  width={32}
                  height={32}
                  className="rounded"
                />
                <div>
                  <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                    {sheetTitle || 'Hoja de Finanzas Personales'}
                  </h2>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Datos sincronizados desde Google Sheets
                  </p>
                </div>
              </div>
              <button
                onClick={() => window.location.reload()}
                className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-md text-sm font-medium transition-colors flex items-center space-x-2"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                <span>Actualizar</span>
              </button>
            </div>
          </div>
          
          <div className="p-6">
            {sheetData.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                  <thead className="bg-gray-50 dark:bg-gray-700">
                    <tr>
                      {sheetData[0]?.map((header: string, index: number) => (
                        <th
                          key={index}
                          className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider"
                        >
                          {header || `Columna ${index + 1}`}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                    {sheetData.slice(1).map((row: string[], rowIndex: number) => (
                      <tr key={rowIndex} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                        {row.map((cell: string, cellIndex: number) => (
                          <td
                            key={cellIndex}
                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-gray-100"
                          >
                            {cell || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Image
                  src="/google-sheets-logo.png"
                  alt="Google Sheets"
                  width={64}
                  height={64}
                  className="mx-auto mb-4 rounded-lg opacity-50"
                />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No hay datos disponibles
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  La hoja de cálculo está vacía o no se pudo acceder a los datos.
                </p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-2 mb-4">
                <Image
                  src="/google-sheets-logo.png"
                  alt="Google Sheets"
                  width={24}
                  height={24}
                  className="rounded"
                />
                <span className="text-lg font-semibold text-gray-900 dark:text-white">
                  Finanzas Personales
                </span>
              </div>
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                Gestiona tu presupuesto y controla tus gastos de manera eficiente.
              </p>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Enlaces Rápidos
              </h3>
              <ul className="space-y-2">
                <li>
                  <a
                    href="/"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    Inicio
                  </a>
                </li>
                <li>
                  <a
                    href="/clickup"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    ClickUp
                  </a>
                </li>
                <li>
                  <a
                    href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                  >
                    Hoja de Cálculo
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4">
                Herramientas
              </h3>
              <ul className="space-y-2">
                <li>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Google Sheets
                  </span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Presupuesto Personal
                  </span>
                </li>
                <li>
                  <span className="text-gray-600 dark:text-gray-400 text-sm">
                    Control de Gastos
                  </span>
                </li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-200 dark:border-gray-700 mt-8 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm">
                © 2025 Finanzas Personales. Gestionado con Google Sheets.
              </p>
              <div className="flex space-x-4 mt-4 md:mt-0">
                <a
                  href="https://docs.google.com/spreadsheets/d/1nQITrI1W-MMkE5EBGpUADwtEirYQncPR4YcoJqTr2jA/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white text-sm transition-colors"
                >
                  Acceder a la Hoja
                </a>
              </div>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
