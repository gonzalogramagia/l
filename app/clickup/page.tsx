'use client';

import { useEffect, useState } from 'react';

interface Task {
  id: string;
  name: string;
  status: {
    status: string;
    color: string;
  };
  priority: {
    priority: string;
    color: string;
  } | null;
  due_date: string | null;
  description: string;
  url: string;
  assignees: Array<{
    username: string;
    color: string;
  }>;
}

interface UserData {
  username: string;
  email: string;
  profilePicture?: string;
}

interface WorkspaceData {
  name: string;
}

export default function ClickUpPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [password, setPassword] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  const fetchTasks = async (pwd: string) => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/clickup/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password: pwd }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al obtener tareas');
      }

      const data = await response.json();
      setTasks(data.tasks || []);
      setUser(data.user);
      setWorkspace(data.workspace);
      setIsAuthenticated(true);
      
      // Guardar contraseña en sessionStorage (solo para esta sesión)
      sessionStorage.setItem('clickup_auth', 'true');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
      setIsAuthenticated(false);
      sessionStorage.removeItem('clickup_auth');
    } finally {
      setLoading(false);
      setIsAuthenticating(false);
    }
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Por favor ingresa una contraseña');
      return;
    }
    setIsAuthenticating(true);
    fetchTasks(password);
  };

  const handleRefresh = () => {
    if (password) {
      fetchTasks(password);
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTasks([]);
    setUser(null);
    setWorkspace(null);
    setPassword('');
    sessionStorage.removeItem('clickup_auth');
  };

  const getPriorityLabel = (priority: Task['priority']) => {
    if (!priority) return 'Sin prioridad';
    const labels: Record<string, string> = {
      '1': 'Urgente',
      '2': 'Alta',
      '3': 'Normal',
      '4': 'Baja',
    };
    return labels[priority.priority] || priority.priority;
  };

  const formatDate = (timestamp: string | null) => {
    if (!timestamp) return null;
    const date = new Date(parseInt(timestamp));
    return date.toLocaleDateString('es-ES', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const filteredTasks = tasks.filter((task) => {
    if (filter === 'all') return true;
    if (filter === 'completed') {
      return task.status.status.toLowerCase().includes('complete') || 
             task.status.status.toLowerCase().includes('closed');
    }
    if (filter === 'pending') {
      return !task.status.status.toLowerCase().includes('complete') && 
             !task.status.status.toLowerCase().includes('closed');
    }
    return true;
  });

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center mb-6">
              <img 
                src="/images/clickup-logo.png" 
                alt="ClickUp Logo" 
                className="w-20 h-20 object-contain rounded-lg"
              />
            </div>
            <h1 className="text-3xl font-bold mb-2">ClickUp Tasks</h1>
            <p className="text-gray-600 dark:text-gray-400">
              Ingresa la contraseña para ver tus tareas
            </p>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label htmlFor="password" className="block text-sm font-medium mb-2">
                Contraseña
              </label>
              <div className="flex gap-2">
                <input
                  type="password"
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="flex-1 px-4 py-3 rounded-lg border border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-900 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                  placeholder="Ingresa tu contraseña"
                  disabled={isAuthenticating}
                  autoFocus
                />
                <button
                  type="submit"
                  disabled={isAuthenticating || !password.trim()}
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl whitespace-nowrap"
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
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-400">Cargando tareas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Tareas</h1>
            {workspace && (
              <p className="text-gray-600 dark:text-gray-400">
                {workspace.name}
              </p>
            )}
          </div>
          <div className="flex gap-2">
            <button
              onClick={handleRefresh}
              className="px-4 py-2 text-sm bg-gray-200 dark:bg-gray-800 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-700 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Actualizar
            </button>
            <button
              onClick={handleLogout}
              className="px-4 py-2 text-sm bg-red-100 dark:bg-red-900/30 text-red-600 dark:text-red-400 rounded-lg hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Salir
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setFilter('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'all'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Todas ({tasks.length})
          </button>
          <button
            onClick={() => setFilter('pending')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'pending'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Pendientes
          </button>
          <button
            onClick={() => setFilter('completed')}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              filter === 'completed'
                ? 'bg-purple-600 text-white'
                : 'bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700'
            }`}
          >
            Completadas
          </button>
        </div>
      </div>

      {/* Tasks Grid */}
      {filteredTasks.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-600 dark:text-gray-400 text-lg">
            No hay tareas para mostrar
          </p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filteredTasks.map((task) => (
            <a
              key={task.id}
              href={task.url}
              target="_blank"
              rel="noopener noreferrer"
              className="block p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg group"
            >
              {/* Task Header */}
              <div className="flex items-start justify-between mb-3">
                <h3 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1 pr-2">
                  {task.name}
                </h3>
                <svg
                  className="w-5 h-5 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-shrink-0"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
              </div>

              {/* Task Meta */}
              <div className="flex flex-wrap gap-2 mb-3">
                <span
                  className="px-2 py-1 text-xs font-medium rounded-full"
                  style={{
                    backgroundColor: `${task.status.color}20`,
                    color: task.status.color,
                  }}
                >
                  {task.status.status}
                </span>
                {task.priority && (
                  <span
                    className="px-2 py-1 text-xs font-medium rounded-full"
                    style={{
                      backgroundColor: `${task.priority.color}20`,
                      color: task.priority.color,
                    }}
                  >
                    {getPriorityLabel(task.priority)}
                  </span>
                )}
              </div>

              {/* Task Description */}
              {task.description && (
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
                  {task.description.replace(/<[^>]*>/g, '')}
                </p>
              )}

              {/* Task Footer */}
              <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
                {task.due_date && (
                  <div className="flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span>{formatDate(task.due_date)}</span>
                  </div>
                )}
                {task.assignees && task.assignees.length > 0 && (
                  <div className="flex -space-x-2">
                    {task.assignees.slice(0, 3).map((assignee, idx) => (
                      <div
                        key={idx}
                        className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-medium border-2 border-white dark:border-gray-900"
                        style={{ backgroundColor: assignee.color }}
                        title={assignee.username}
                      >
                        {assignee.username.charAt(0).toUpperCase()}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
