'use client';

import { useEffect, useState } from 'react';
import Header from './components/Header';
import LoginForm from './components/LoginForm';
import TaskFilters from './components/TaskFilters';
import TaskCard from './components/TaskCard';
import TaskDetailsModal from './components/TaskDetailsModal';
import TaskEditModal from './components/TaskEditModal';
import CreateTaskModal from './components/CreateTaskModal';
import { Task, UserData, WorkspaceData } from './types';

export default function ClickUpPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [user, setUser] = useState<UserData | null>(null);
  const [workspace, setWorkspace] = useState<WorkspaceData | null>(null);
  const [availableStatuses, setAvailableStatuses] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [visibleCount, setVisibleCount] = useState(12);
  const [selectedPriorities, setSelectedPriorities] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateFilter, setDateFilter] = useState<'all' | 'with-date' | 'no-date'>('all');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDate, setSelectedDate] = useState<string | null>(() => {
    const now = new Date();
    // Ajustar a GMT-3 (Argentina)
    const argentinaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - (3 * 3600000));
    return argentinaTime.toISOString().split('T')[0];
  });
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>(() => {
    const now = new Date();
    // Ajustar a GMT-3 (Argentina)
    const argentinaTime = new Date(now.getTime() - (now.getTimezoneOffset() * 60000) - (3 * 3600000));
    const monthNames = [
      'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
      'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'
    ];
    const monthName = monthNames[argentinaTime.getMonth()];
    return monthName.charAt(0).toUpperCase() + monthName.slice(1);
  });
  const [showAddTaskModal, setShowAddTaskModal] = useState(false);
  const [newTaskName, setNewTaskName] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDate, setNewTaskDate] = useState<string>('');
  const [newTaskPriority, setNewTaskPriority] = useState<number>(3);
  const [isCreatingTask, setIsCreatingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [showSorting, setShowSorting] = useState(false);
  const [sortBy, setSortBy] = useState<{ field: 'due_date' | 'status' | 'priority' | 'name'; order: 'asc' | 'desc' }>({ 
    field: 'due_date', 
    order: 'asc' 
  });
  const [editTaskName, setEditTaskName] = useState('');
  const [editTaskDescription, setEditTaskDescription] = useState('');
  const [editTaskDate, setEditTaskDate] = useState<string>('');
  const [editTaskPriority, setEditTaskPriority] = useState<number>(3);
  const [isUpdatingTask, setIsUpdatingTask] = useState(false);

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
      console.log('Frontend received availableStatuses:', data.availableStatuses);
      setTasks(data.tasks || []);
      setUser(data.user);
      setWorkspace(data.workspace);
      setAvailableStatuses(data.availableStatuses || []);
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

  const handleLogin = (password: string) => {
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
    
    // Ajustar a GMT-3 (Argentina)
    const argentinaTime = new Date(date.getTime() - (3 * 3600000));
    
    const formatted = argentinaTime.toLocaleDateString('es-ES', {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      timeZone: 'America/Argentina/Buenos_Aires'
    });
    
    // Capitalizar solo la primera letra de cada palabra, respetando acentos
    return formatted
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .replace(/\bDe\b/g, 'de');
  };

  // Función para ordenar tareas
  const sortTasks = (tasks: Task[]) => {
    return [...tasks].sort((a, b) => {
      // Manejar el caso especial para fechas (poner sin fecha al final)
      if (sortBy.field === 'due_date') {
        // Si ambos tienen fecha, comparar normalmente
        if (a.due_date && b.due_date) {
          const aDate = parseInt(a.due_date);
          const bDate = parseInt(b.due_date);
          return sortBy.order === 'asc' ? aDate - bDate : bDate - aDate;
        }
        // Si solo 'a' no tiene fecha, 'a' va al final
        if (!a.due_date) return 1;
        // Si solo 'b' no tiene fecha, 'b' va al final
        if (!b.due_date) return -1;
      }

      let aValue: any;
      let bValue: any;

      switch (sortBy.field) {
        case 'due_date':
          // Este caso ya se maneja arriba, pero lo dejamos por completitud
          aValue = parseInt(a.due_date!);
          bValue = parseInt(b.due_date!);
          break;
        case 'status':
          aValue = a.status.status;
          bValue = b.status.status;
          break;
        case 'priority':
          aValue = a.priority ? parseInt(a.priority.priority) : 5; // Sin prioridad al final
          bValue = b.priority ? parseInt(b.priority.priority) : 5;
          break;
        case 'name':
        default:
          aValue = a.name.toLowerCase();
          bValue = b.name.toLowerCase();
          break;
      }

      if (aValue < bValue) return sortBy.order === 'asc' ? -1 : 1;
      if (aValue > bValue) return sortBy.order === 'asc' ? 1 : -1;
      return 0;
    });
  };

  const filteredTasks = (tasks || []).filter((task) => {
    // Filtro: excluir tareas sin fecha definida
    if (!task.due_date) return false;
    
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

    // Filtro de búsqueda por nombre, descripción o fecha formateada
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      const nameMatch = task.name.toLowerCase().includes(query);
      const descriptionMatch = task.description?.toLowerCase().includes(query) || false;
      
      // Búsqueda por fecha formateada
      let dateMatch = false;
      if (task.due_date) {
        const formattedDate = formatDate(task.due_date);
        if (formattedDate) {
          dateMatch = formattedDate.toLowerCase().includes(query);
        }
      }
      
      if (!nameMatch && !descriptionMatch && !dateMatch) return false;
    }

    return true;
  });

  // Aplicar ordenamiento a las tareas filtradas
  const sortedFilteredTasks = sortTasks(filteredTasks);

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
  
  // Usar estados reales de ClickUp si están disponibles, sino usar estados de tareas cargadas
  let allAvailableStatuses = availableStatuses.length > 0 ? availableStatuses : uniqueStatuses;
  
  // Si solo tenemos 2 estados (To Do, In Progress), agregar estados comunes de ClickUp
  if (allAvailableStatuses.length <= 2) {
    const commonClickUpStatuses = ['Complete', 'Done', 'Closed', 'Cancelled', 'On Hold'];
    commonClickUpStatuses.forEach(status => {
      if (!allAvailableStatuses.includes(status)) {
        allAvailableStatuses.push(status);
      }
    });
  }

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

      // Recargar todas las tareas para ver los cambios reflejados
      const password = sessionStorage.getItem('clickup_password');
      if (password) {
        await fetchTasks(password);
      }
      
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

  const handleStatusChange = async (taskId: string, newStatus: string) => {
    try {
      const pwd = sessionStorage.getItem('clickup_password');
      if (!pwd) throw new Error('Sesión expirada');
      
      const response = await fetch('/api/clickup/update-task', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          taskId,
          status: newStatus
        })
      });
      
      if (!response.ok) throw new Error('Error al actualizar el estado');
      
      // Actualizar el estado local
      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, status: { ...task.status, status: newStatus } } 
          : task
      ));
      
      // Actualizar la tarea seleccionada
      if (selectedTask && selectedTask.id === taskId) {
        setSelectedTask({
          ...selectedTask,
          status: { ...selectedTask.status, status: newStatus }
        });
      }
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el estado');
    }
  };

  const handleDeleteTask = async (taskId: string) => {
    try {
      const pwd = sessionStorage.getItem('clickup_password');
      if (!pwd) throw new Error('Sesión expirada');
      
      const response = await fetch('/api/clickup/delete-task', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          password: pwd,
          taskId
        })
      });
      
      if (!response.ok) throw new Error('Error al eliminar la tarea');
      
      // Actualizar el estado local
      setTasks(prev => prev.filter(task => task.id !== taskId));
      setSelectedTask(null);
      
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar la tarea');
    }
  };


  const handleCancelCreate = () => {
    setShowAddTaskModal(false);
    setNewTaskName('');
    setNewTaskDescription('');
    setNewTaskDate('');
    setNewTaskPriority(3);
  };

  const handleCancelEdit = () => {
    setIsEditingTask(false);
    setSelectedTask(null);
    setError(null);
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
        <LoginForm 
          onLogin={handleLogin}
          isAuthenticating={isAuthenticating}
          error={error}
        />
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
          <TaskFilters
            showFilters={showFilters}
            setShowFilters={setShowFilters}
            showSorting={showSorting}
            setShowSorting={setShowSorting}
            sortBy={sortBy}
            setSortBy={setSortBy}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            priorityFilter={priorityFilter}
            setPriorityFilter={setPriorityFilter}
            selectedDate={selectedDate}
            setSelectedDate={setSelectedDate}
            searchQuery={searchQuery}
            setSearchQuery={setSearchQuery}
            uniqueStatuses={allAvailableStatuses}
            uniquePriorities={uniquePriorities}
            getPriorityLabel={getPriorityLabel}
            clearFilters={clearFilters}
            setShowAddTaskModal={setShowAddTaskModal}
          />

          {/* Lista de tareas */}
          <div className="px-4 lg:px-0 max-w-xl mx-auto space-y-3">
            {sortedFilteredTasks.slice(0, visibleCount).map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onClick={() => setSelectedTask(task)}
                getPriorityLabel={getPriorityLabel}
                formatDate={formatDate}
              />
            ))}

            {sortedFilteredTasks.length === 0 && (
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

            {sortedFilteredTasks.length > visibleCount && (
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
        <CreateTaskModal
          newTaskName={newTaskName}
          setNewTaskName={setNewTaskName}
          newTaskDescription={newTaskDescription}
          setNewTaskDescription={setNewTaskDescription}
          newTaskDate={newTaskDate}
          setNewTaskDate={setNewTaskDate}
          newTaskPriority={newTaskPriority}
          setNewTaskPriority={setNewTaskPriority}
          isCreatingTask={isCreatingTask}
          onCreateTask={handleCreateTask}
          onCancel={handleCancelCreate}
          uniquePriorities={uniquePriorities}
          getPriorityLabel={getPriorityLabel}
        />
      )}

      {/* Modal para ver detalles de tarea */}
      {selectedTask && !isEditingTask && (
        <TaskDetailsModal
          selectedTask={selectedTask}
          onClose={() => setSelectedTask(null)}
          onEdit={startEditingTask}
          onDelete={handleDeleteTask}
          onStatusChange={handleStatusChange}
            uniqueStatuses={allAvailableStatuses}
          getPriorityLabel={getPriorityLabel}
          formatDate={formatDate}
        />
      )}

      {/* Modal para editar tarea */}
      {selectedTask && isEditingTask && (
        <TaskEditModal
          selectedTask={selectedTask}
          editTaskName={editTaskName}
          setEditTaskName={setEditTaskName}
          editTaskDescription={editTaskDescription}
          setEditTaskDescription={setEditTaskDescription}
          editTaskDate={editTaskDate}
          setEditTaskDate={setEditTaskDate}
          editTaskPriority={editTaskPriority}
          setEditTaskPriority={setEditTaskPriority}
          isUpdatingTask={isUpdatingTask}
          error={error}
          onSave={handleUpdateTask}
          onCancel={handleCancelEdit}
          uniquePriorities={uniquePriorities}
          getPriorityLabel={getPriorityLabel}
        />
      )}
    </div>
  );
}