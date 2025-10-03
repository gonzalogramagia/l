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
    profilePicture?: string;
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
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<number>(3);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDate, setEditTaskDate] = useState<string>('');
  const [editTaskPriority, setEditTaskPriority] = useState<number>(3);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

  const Header = () => (
    <div className="px-4 lg:px-0 max-w-xl mx-auto mb-8">
      <div className="mb-8">
        <div className="flex items-center gap-4">
          <a 
            href="https://app.clickup.com/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <img 
              src="/clickup-logo.png" 
              alt="ClickUp Logo" 
              className="h-16 w-auto rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
          <div>
            <a 
              href="https://app.clickup.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
              <h1 className="text-3xl font-bold mb-2 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Mis Tareas</h1>
            </a>
            <a 
              href="https://app.clickup.com/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              app.clickup.com
            </a>
          </div>
        </div>
      </div>
    </div>
  );

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
      sessionStorage.setItem('clickup_auth', 'true');
      sessionStorage.setItem('clickup_password', pwd);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
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

  const handleLogout = () => {
    setIsAuthenticated(false);
    setTasks([]);
    setUser(null);
    setWorkspace(null);
    setPassword('');
    setError(null);
    sessionStorage.removeItem('clickup_auth');
    sessionStorage.removeItem('clickup_password');
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

    // Filtro por estado específico
    if (statusFilter !== 'all') {
      if (statusFilter !== task.status.status) {
        return false;
      }
    }

    // Filtro por prioridad específica
    if (priorityFilter !== 'all') {
      const taskPriority = task.priority?.priority || 'none';
      if (taskPriority !== priorityFilter) return false;
    }

    // Filtro de prioridad múltiple (mantener compatibilidad)
    if (selectedPriorities.length > 0) {
      const taskPriority = task.priority?.priority || 'none';
      if (!selectedPriorities.includes(taskPriority)) return false;
    }

    // Filtro de estado múltiple (mantener compatibilidad)
    if (selectedStatuses.length > 0) {
      if (!selectedStatuses.includes(task.status.status)) return false;
    }

    // Filtro de fecha específica (tiene prioridad)
    if (selectedDate) {
      if (!task.due_date) return false; // Excluir tareas sin fecha
      const taskDate = new Date(parseInt(task.due_date));
      const filterDate = new Date(selectedDate + 'T00:00:00');
      
      // Comparar solo año, mes y día
      const taskYear = taskDate.getFullYear();
      const taskMonth = taskDate.getMonth();
      const taskDay = taskDate.getDate();
      
      const filterYear = filterDate.getFullYear();
      const filterMonth = filterDate.getMonth();
      const filterDay = filterDate.getDate();
      
      if (taskYear !== filterYear || taskMonth !== filterMonth || taskDay !== filterDay) {
        return false;
      }
    } else {
      // Filtros de fecha generales (solo si no hay fecha específica)
      if (dateFilter === 'with-date' && !task.due_date) return false;
      if (dateFilter === 'no-date' && task.due_date) return false;
    }

    // Filtro de búsqueda por nombre o descripción
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = task.name.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      if (!nameMatch && !descriptionMatch) return false;
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

  const clearFilters = () => {
    setSelectedPriorities([]);
    setSelectedStatuses([]);
    setDateFilter('all');
    setSelectedDate('');
    setFilter('all');
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchQuery('');
    setVisibleCount(12);
  };

  // Obtener estados y prioridades únicos para los filtros
  const uniqueStatuses = Array.from(new Set(tasks.map(task => task.status.status)));
  const uniquePriorities = Array.from(new Set(tasks.map(task => task.priority?.priority || 'none')));

  const handleCreateTask = async () => {
    if (!newTaskName.trim()) return;

    setIsCreatingTask(true);
    try {
      const pwd = sessionStorage.getItem('clickup_password');
      if (!pwd) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        return;
      }

      const response = await fetch('/api/clickup/create-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: pwd,
          name: newTaskName,
          description: newTaskDescription,
          dueDate: newTaskDate,
          priority: newTaskPriority,
        }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Error al crear la tarea');
      }

      // Recargar tareas
      await fetchTasks(pwd);
      
      // Limpiar formulario
      setNewTaskName('');
      setNewTaskDescription('');
      setNewTaskDate('');
      setNewTaskPriority(3);
      setShowAddTaskModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear la tarea');
    } finally {
      setIsCreatingTask(false);
    }
  };

  const handleUpdateTask = async () => {
    if (!selectedTask || !editTaskName.trim()) {
      setError('El nombre de la tarea es requerido');
      return;
    }

    setIsUpdatingTask(true);
    setError(null); // Limpiar errores previos
    
    try {
      const pwd = sessionStorage.getItem('clickup_password');
      if (!pwd) {
        setError('Sesión expirada. Por favor, inicia sesión nuevamente.');
        setIsUpdatingTask(false);
        return;
      }

      console.log('Updating task:', {
        taskId: selectedTask.id,
        name: editTaskName,
        description: editTaskDescription,
        dueDate: editTaskDate,
        priority: editTaskPriority
      });

      const response = await fetch('/api/clickup/update-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          password: pwd,
          taskId: selectedTask.id,
          name: editTaskName,
          description: editTaskDescription,
          dueDate: editTaskDate,
          priority: editTaskPriority,
        }),
      });

      const data = await response.json();
      console.log('Update response:', data);

      if (!response.ok) {
        throw new Error(data.error || 'Error al actualizar la tarea');
      }

      // Actualizar la tarea localmente en el estado
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.id === selectedTask.id 
            ? {
                ...task,
                name: editTaskName,
                description: editTaskDescription,
                due_date: editTaskDate ? new Date(editTaskDate).getTime().toString() : null,
                priority: {
                  priority: editTaskPriority.toString(),
                  color: task.priority?.color || '#6B7280'
                }
              }
            : task
        )
      );
      
      // Cerrar modal de edición
      setIsEditingTask(false);
      setSelectedTask(null);
      
    } catch (err) {
      console.error('Error updating task:', err);
      setError(err instanceof Error ? err.message : 'Error al actualizar la tarea');
    } finally {
      setIsUpdatingTask(false);
    }
  };

  const startEditingTask = (task: Task) => {
    setSelectedTask(task);
    setEditTaskName(task.name);
    setEditTaskDescription(task.description || '');
    
    // Manejar la fecha de manera más segura
    let dateValue = '';
    if (task.due_date) {
      try {
        const timestamp = typeof task.due_date === 'string' ? parseInt(task.due_date) : task.due_date;
        if (!isNaN(timestamp) && timestamp > 0) {
          dateValue = new Date(timestamp).toISOString().split('T')[0];
        }
      } catch (error) {
        console.error('Error parsing date:', error);
        dateValue = '';
      }
    }
    setEditTaskDate(dateValue);
    
    // Manejar la prioridad de manera más segura
    const priorityValue = task.priority?.priority ? parseInt(task.priority.priority) : 3;
    setEditTaskPriority(isNaN(priorityValue) ? 3 : priorityValue);
    
    setIsEditingTask(true);
  };

  // Verificar autenticación al cargar
  useEffect(() => {
    const auth = sessionStorage.getItem('clickup_auth');
    const pwd = sessionStorage.getItem('clickup_password');
    if (auth === 'true' && pwd) {
      setIsAuthenticated(true);
      fetchTasks(pwd);
    }
  }, []);

  // Reset visible count when filters change
  useEffect(() => {
    setVisibleCount(12);
  }, [filter, selectedPriorities, selectedStatuses, dateFilter, statusFilter, priorityFilter, selectedDate, searchQuery]);

  // Pantalla de login
  if (!isAuthenticated) {
    return (
      <div className="w-full pb-16 pt-6">
        <Header />
        
        <div className="px-4 lg:px-0 max-w-xl mx-auto pt-20 pb-32">
          <div className="w-full max-w-md">
            <form onSubmit={handleLogin} className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Contraseña
                </label>
                <div className="flex gap-3">
                  <input
                    type="password"
                    id="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400"
                    placeholder="Ingresa tu contraseña"
                    required
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
      </div>
    );
  }

  return (
    <div className="w-full pb-16 pt-6">
      <Header />
      
      {loading ? (
        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 dark:border-white mx-auto mb-4"></div>
            <p className="text-gray-600 dark:text-gray-400">Cargando tareas...</p>
          </div>
        </div>
      ) : (
        <>

          {/* Filtros */}
          <div className="px-4 lg:px-0 max-w-xl mx-auto mb-6">
            <div className="flex gap-2">
              <button
                onClick={() => setShowFilters(!showFilters)}
                className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm transition-colors cursor-pointer"
              >
                {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
              </button>
              <button
                onClick={() => setShowAddTaskModal(true)}
                className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm transition-colors cursor-pointer"
              >
                + Nueva Tarea
              </button>
            </div>

            {/* Filtros refinados */}
            {showFilters && (
              <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
                {/* Primera fila: Por Estado, Por Prioridad, Por Fecha */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Filtro por estado */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                      Por Estado
                    </label>
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="all">Todos los estados</option>
                      {uniqueStatuses.map(status => (
                        <option key={status} value={status}>{status}</option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por prioridad */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                      Por Prioridad
                    </label>
                    <select
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
                    >
                      <option value="all">Todas las prioridades</option>
                      {uniquePriorities.map(priority => (
                        <option key={priority} value={priority}>
                          {priority === 'none' ? 'Sin prioridad' : getPriorityLabel({ priority } as any)}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Filtro por fecha concreta */}
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                      Por Fecha
                    </label>
                    <input
                      type="date"
                      value={selectedDate || ''}
                      onChange={(e) => setSelectedDate(e.target.value || null)}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  </div>
                </div>

                {/* Segunda fila: Buscador (2 columnas) + Botón Limpiar (1 columna) */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                      Buscar por nombre o descripción
                    </label>
                    <input
                      type="text"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                      placeholder="Buscar tareas..."
                    />
                  </div>
                  <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                      &nbsp;
                    </label>
                    <button
                      onClick={clearFilters}
                      className="w-full h-10 px-3 text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors cursor-pointer border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    >
                      Limpiar filtros
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Lista de tareas */}
          <div className="px-4 lg:px-0 max-w-xl mx-auto space-y-3">
            {filteredTasks.slice(0, visibleCount).map((task) => (
              <div
                key={task.id}
                className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
                onClick={() => setSelectedTask(task)}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-medium text-gray-900 dark:text-white flex-1 mr-2">
                    {task.name}
                  </h3>
                  <div className="flex items-center gap-2">
                    {task.priority && (
                      <span
                        className="px-2 py-1 text-xs rounded-full"
                        style={{ backgroundColor: task.priority.color + '20', color: task.priority.color }}
                      >
                        {getPriorityLabel(task.priority)}
                      </span>
                    )}
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: task.status.color + '20', color: task.status.color }}
                    >
                      {task.status.status}
                    </span>
                  </div>
                </div>
                
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2 line-clamp-2">
                  {task.description || 'Sin descripción'}
                </p>
                
                <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
                  <span>📅 {task.due_date ? formatDate(task.due_date) : 'Fecha por definir'}</span>
                </div>
              </div>
            ))}

            {filteredTasks.length === 0 && (
              <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                <p>No hay tareas que coincidan con los filtros seleccionados.</p>
                <button
                  onClick={clearFilters}
                  className="mt-2 text-purple-500 hover:text-purple-600 text-sm cursor-pointer"
                >
                  Limpiar filtros
                </button>
              </div>
            )}

            {filteredTasks.length > visibleCount && (
              <button
                onClick={() => setVisibleCount(visibleCount + 12)}
                className="w-full py-3 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-lg transition-colors cursor-pointer"
              >
                Cargar más tareas
              </button>
            )}
          </div>
        </>
      )}

      {/* Modal para crear tarea */}
      {showAddTaskModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl">
            <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de la tarea</label>
                <input
                  type="text"
                  value={newTaskName}
                  onChange={(e) => setNewTaskName(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre de la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción (opcional)</label>
                <textarea
                  value={newTaskDescription}
                  onChange={(e) => setNewTaskDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Descripción de la tarea"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 h-5">Fecha límite (opcional)</label>
                  <input
                    type="date"
                    value={newTaskDate}
                    onChange={(e) => setNewTaskDate(e.target.value)}
                    className="w-full h-10 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 h-5">Prioridad</label>
                  <select
                    value={newTaskPriority}
                    onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                    className="w-full h-10 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>Urgente</option>
                    <option value={2}>Alta</option>
                    <option value={3}>Normal</option>
                    <option value={4}>Baja</option>
                  </select>
                </div>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={handleCreateTask}
                disabled={isCreatingTask || !newTaskName.trim()}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isCreatingTask ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  </>
                ) : (
                  'Crear Tarea'
                )}
              </button>
              <button
                onClick={() => {
                  setShowAddTaskModal(false);
                  setNewTaskName('');
                  setNewTaskDescription('');
                  setNewTaskDate('');
                  setNewTaskPriority(3);
                }}
                disabled={isCreatingTask}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para ver detalles de tarea */}
      {selectedTask && !isEditingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" onClick={() => setSelectedTask(null)}>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-start mb-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <h2 className="text-2xl font-bold">{selectedTask.name}</h2>
                  <button
                    onClick={() => startEditingTask(selectedTask)}
                    className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                    title="Editar tarea"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                  </button>
                </div>
                <div className="flex items-center gap-2">
                  {selectedTask.priority && (
                    <span
                      className="px-2 py-1 text-xs rounded-full"
                      style={{ backgroundColor: selectedTask.priority.color + '20', color: selectedTask.priority.color }}
                    >
                      {getPriorityLabel(selectedTask.priority)}
                    </span>
                  )}
                  <span
                    className="px-2 py-1 text-xs rounded-full"
                    style={{ backgroundColor: selectedTask.status.color + '20', color: selectedTask.status.color }}
                  >
                    {selectedTask.status.status}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedTask(null)}
                className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer ml-4"
              >
                ✕
              </button>
            </div>
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Descripción</h3>
              <p className="text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
                {selectedTask.description || 'Sin descripción'}
              </p>
            </div>
            
            <div className="space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium">📅 Fecha límite:</span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  {selectedTask.due_date ? formatDate(selectedTask.due_date) : 'Fecha por definir'}
                </span>
              </div>
              
              {selectedTask.assignees.length > 0 && (
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">👤 Asignado a:</span>
                  <span className="text-sm text-gray-600 dark:text-gray-400">{selectedTask.assignees[0].username}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-3">
              <a
                href={selectedTask.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 px-4 py-2 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors text-center cursor-pointer"
              >
                Abrir en ClickUp
              </a>
              <button
                onClick={() => setSelectedTask(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal para editar tarea */}
      {selectedTask && isEditingTask && (
        <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" onClick={() => {setIsEditingTask(false); setSelectedTask(null);}}>
          <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h2 className="text-xl font-bold mb-4">Editar Tarea</h2>
            
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Nombre de la tarea</label>
                <input
                  type="text"
                  value={editTaskName}
                  onChange={(e) => setEditTaskName(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  placeholder="Nombre de la tarea"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium mb-2">Descripción</label>
                <textarea
                  value={editTaskDescription}
                  onChange={(e) => setEditTaskDescription(e.target.value)}
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  rows={3}
                  placeholder="Descripción de la tarea"
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2 h-5">Fecha límite</label>
                  <input
                    type="date"
                    value={editTaskDate}
                    onChange={(e) => setEditTaskDate(e.target.value)}
                    className="w-full h-10 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2 h-5">Prioridad</label>
                  <select
                    value={editTaskPriority}
                    onChange={(e) => setEditTaskPriority(Number(e.target.value))}
                    className="w-full h-10 p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                  >
                    <option value={1}>Urgente</option>
                    <option value={2}>Alta</option>
                    <option value={3}>Normal</option>
                    <option value={4}>Baja</option>
                  </select>
                </div>
              </div>
            </div>
            
            {error && (
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-4">
                <p className="text-sm text-red-600 dark:text-red-400">{error}</p>
              </div>
            )}

            <div className="flex gap-3 mt-6">
              <button
                onClick={handleUpdateTask}
                disabled={isUpdatingTask || !editTaskName.trim()}
                className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
              >
                {isUpdatingTask ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto"></div>
                  </>
                ) : (
                  'Guardar Cambios'
                )}
              </button>
              <button
                onClick={() => {
                  setIsEditingTask(false);
                  setSelectedTask(null);
                  setError(null);
                }}
                disabled={isUpdatingTask}
                className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Cancelar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
