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
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'with-date' | 'no-date'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string>('');

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
      weekday: 'long',
      day: 'numeric',
      month: 'long',
    }).replace(/^./, str => str.toUpperCase());
  };

  const filteredTasks = (tasks || []).filter((task) => {
    // Filtro básico (all/pending/completed)
    if (filter === 'completed') {
      const isCompleted = task.status.status.toLowerCase().includes('complete') || 
                         task.status.status.toLowerCase().includes('closed');
      if (!isCompleted) return false;
    }
    if (filter === 'pending') {
      const isCompleted = task.status.status.toLowerCase().includes('complete') || 
                         task.status.status.toLowerCase().includes('closed');
      if (isCompleted) return false;
    }

    // Filtro de prioridad
    if (selectedPriorities.length > 0) {
      const taskPriority = task.priority?.priority || 'none';
      if (!selectedPriorities.includes(taskPriority)) return false;
    }

    // Filtro de estado
    if (selectedStatuses.length > 0) {
      if (!selectedStatuses.includes(task.status.status)) return false;
    }

    // Filtro de fecha específica (tiene prioridad)
    if (selectedDate) {
      if (!task.due_date) return false; // Excluir tareas sin fecha
      const taskDate = new Date(parseInt(task.due_date));
      const filterDate = new Date(selectedDate);
      if (taskDate.toDateString() !== filterDate.toDateString()) return false;
    } else {
      // Filtros de fecha generales (solo si no hay fecha específica)
      if (dateFilter === 'with-date' && !task.due_date) return false;
      if (dateFilter === 'no-date' && task.due_date) return false;
    }

    return true;
  });

  const pendingCount = (tasks || []).filter((task) => 
    !task.status.status.toLowerCase().includes('complete') && 
    !task.status.status.toLowerCase().includes('closed')
  ).length;

  const completedCount = (tasks || []).filter((task) => 
    task.status.status.toLowerCase().includes('complete') || 
    task.status.status.toLowerCase().includes('closed')
  ).length;

  const visibleTasks = filteredTasks.slice(0, visibleCount);
  const hasMore = visibleCount < filteredTasks.length;

  const loadMore = () => {
    setVisibleCount(prev => prev + 12);
  };

  // Get unique statuses and priorities
  const uniqueStatuses = Array.from(new Set((tasks || []).map(t => t.status.status)));
  const uniquePriorities = Array.from(new Set((tasks || []).map(t => t.priority?.priority || 'none')));

  const togglePriority = (priority: string) => {
    setSelectedPriorities(prev =>
      prev.includes(priority) ? prev.filter(p => p !== priority) : [...prev, priority]
    );
  };

  const toggleStatus = (status: string) => {
    setSelectedStatuses(prev =>
      prev.includes(status) ? prev.filter(s => s !== status) : [...prev, status]
    );
  };

  const clearAllFilters = () => {
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setDateFilter('all');
    setFilter('all');
    setSelectedDate('');
  };

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [filter, selectedPriorities, selectedStatuses, dateFilter]);

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] pb-16">
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
                  className="px-6 py-3 bg-purple-600 text-white rounded-lg font-semibold hover:bg-purple-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors shadow-lg hover:shadow-xl whitespace-nowrap cursor-pointer"
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
    <div className="w-full pb-16 pt-6">
      {/* Header and Filters - Aligned with navbar/footer */}
      <div className="px-4 lg:px-0 max-w-xl mx-auto mb-8">
        {/* Header */}
        <div className="mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Mis Tareas</h1>
            {workspace && (
              <p className="text-gray-600 dark:text-gray-400">
                {workspace.name}
              </p>
            )}
          </div>
        </div>

        {/* Filters - Solo mostrar si hay tareas */}
        {tasks && tasks.length > 0 && (
          <div className="flex justify-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-6 py-3 rounded-lg font-medium transition-colors cursor-pointer bg-purple-600 text-white hover:bg-purple-700 flex items-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
              </svg>
              Todos los Filtros
            </button>
          </div>
        )}

        {/* Advanced Filters */}
        {tasks && tasks.length > 0 && showFilters && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg space-y-4 w-full max-w-[300px] mx-auto">
            {/* Date Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Fecha</h3>
              <div className="flex gap-2 flex-wrap items-center">
                <input
                  type="date"
                  value={selectedDate}
                  onChange={(e) => {
                    setSelectedDate(e.target.value);
                    if (e.target.value) {
                      setDateFilter('all');
                    }
                  }}
                  placeholder="Calendario"
                  className={`px-3 py-1.5 text-sm rounded-lg border transition-colors cursor-pointer ${
                    selectedDate
                      ? 'bg-purple-600 text-white border-purple-600'
                      : 'border-gray-300 dark:border-gray-700 bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                />
                {!selectedDate && (
                  <button
                    onClick={() => setDateFilter('no-date')}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer ${
                      dateFilter === 'no-date'
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    Sin fecha
                  </button>
                )}
              </div>
            </div>

            {/* Priority Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Prioridad</h3>
              <div className="flex gap-2 flex-wrap">
                {uniquePriorities.map((priority) => (
                  <button
                    key={priority}
                    onClick={() => togglePriority(priority)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer capitalize ${
                    selectedPriorities.includes(priority)
                      ? 'bg-purple-600 text-white'
                      : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                  }`}
                >
                  {priority === 'none' ? 'Sin prioridad' : getPriorityLabel({ priority, color: '' } as any)}
                </button>
                ))}
              </div>
            </div>

            {/* Status Filter */}
            <div>
              <h3 className="text-sm font-semibold mb-2">Estado</h3>
              <div className="flex gap-2 flex-wrap">
                {uniqueStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatus(status)}
                    className={`px-3 py-1.5 text-sm rounded-lg transition-colors cursor-pointer capitalize ${
                      selectedStatuses.includes(status)
                        ? 'bg-purple-600 text-white'
                        : 'bg-white dark:bg-gray-800 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {status}
                  </button>
                ))}
              </div>
            </div>

            {/* Clear Filters */}
            {(selectedPriorities.length > 0 || selectedStatuses.length > 0 || dateFilter !== 'all' || selectedDate) && (
              <div className="flex justify-center pt-2">
                <button
                  onClick={clearAllFilters}
                  className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer font-medium"
                >
                  Limpiar todos los filtros
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Tasks Grid - Full width */}
      <div className="w-screen relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] px-16 sm:px-24 lg:px-32 pb-16">
        <div className="max-w-6xl mx-auto">
        {/* Tasks Grid */}
        {!tasks || tasks.length === 0 ? (
          <div className="grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}>
            <div className="col-span-full flex items-center justify-center min-h-[40vh]">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No hay tareas disponibles</h3>
                <p className="text-gray-600 dark:text-gray-400 mb-4">
                  Parece que no tienes tareas asignadas en este momento
                </p>
                <button
                  onClick={handleRefresh}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors inline-flex items-center gap-2 cursor-pointer"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                  </svg>
                  Actualizar
                </button>
              </div>
            </div>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="grid gap-4 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}>
            <div className="col-span-full flex items-center justify-center min-h-[40vh]">
              <div className="text-center max-w-md">
                <div className="mb-4">
                  <svg className="w-16 h-16 mx-auto text-gray-400 dark:text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold mb-2">No hay tareas en esta categoría</h3>
                <p className="text-gray-600 dark:text-gray-400">
                  Intenta con otro filtro para ver más tareas
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-4 min-w-0 justify-center" style={{ gridTemplateColumns: 'repeat(auto-fill, 300px)' }}>
            {visibleTasks.map((task) => (
              <a
                key={task.id}
                href={task.url}
                target="_blank"
                rel="noopener noreferrer"
                className="block p-5 bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 hover:border-purple-500 dark:hover:border-purple-500 transition-all hover:shadow-lg group min-w-0"
              >
                {/* Task Header */}
                <div className="flex items-start justify-between mb-3 min-w-0">
                  <h3 className="font-semibold text-lg group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors flex-1 pr-2 break-words min-w-0">
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
                    className="px-2 py-1 text-xs font-medium rounded-full capitalize"
                    style={{
                      backgroundColor: `${task.status.color}20`,
                      color: task.status.color,
                    }}
                  >
                    {task.status.status}
                  </span>
                  {task.priority && (
                    <span
                      className="px-2 py-1 text-xs font-medium rounded-full capitalize"
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
                <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500 min-w-0 gap-2">
                  <div className="flex items-center gap-1 min-w-0 flex-shrink">
                    <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                    </svg>
                    <span className="truncate">{task.due_date ? formatDate(task.due_date) : 'Por seleccionar'}</span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        )}

      {/* Load More Button */}
      {hasMore && filteredTasks.length > 0 && (
        <div className="flex justify-center mt-8">
          <button
            onClick={loadMore}
            className="px-6 py-3 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors font-medium cursor-pointer"
          >
            Cargar más tareas
          </button>
        </div>
      )}
        </div>
      </div>
    </div>
  );
}
