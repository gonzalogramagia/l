interface TaskFiltersProps {
  showFilters: boolean;
  setShowFilters: (show: boolean) => void;
  showSorting: boolean;
  setShowSorting: (show: boolean) => void;
  sortBy: { field: 'due_date' | 'status' | 'priority' | 'name'; order: 'asc' | 'desc' };
  setSortBy: (sort: { field: 'due_date' | 'status' | 'priority' | 'name'; order: 'asc' | 'desc' }) => void;
  statusFilter: string;
  setStatusFilter: (filter: string) => void;
  priorityFilter: string;
  setPriorityFilter: (filter: string) => void;
  selectedDate: string | null;
  setSelectedDate: (date: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  uniqueStatuses: string[];
  uniquePriorities: string[];
  getPriorityLabel: (priority: any) => string;
  clearFilters: () => void;
  setShowAddTaskModal: (show: boolean) => void;
}

export default function TaskFilters({
  showFilters,
  setShowFilters,
  showSorting,
  setShowSorting,
  sortBy,
  setSortBy,
  statusFilter,
  setStatusFilter,
  priorityFilter,
  setPriorityFilter,
  selectedDate,
  setSelectedDate,
  searchQuery,
  setSearchQuery,
  uniqueStatuses,
  uniquePriorities,
  getPriorityLabel,
  clearFilters,
  setShowAddTaskModal
}: TaskFiltersProps) {
  return (
    <div className="px-4 lg:px-0 max-w-xl mx-auto mb-6">
      {/* Filtros siempre visibles */}
      <div className="grid grid-cols-4 gap-4 mb-4">
        <div className="col-span-2 flex flex-col">
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setSearchQuery('')}
                title="Hacer clic para limpiar la búsqueda"
              >
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
        <div className="col-span-2 flex flex-col">
              <label 
                className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5 cursor-pointer hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
                onClick={() => setSelectedDate(null)}
                title="Hacer clic para limpiar el filtro de fecha"
              >
                Buscar por fecha exacta
              </label>
          <div className="flex items-center gap-1">
            <button
              onClick={() => {
                const baseDate = selectedDate ? new Date(selectedDate) : new Date();
                const previousDay = new Date(baseDate);
                previousDay.setDate(baseDate.getDate() - 1);
                setSelectedDate(previousDay.toISOString().split('T')[0]);
              }}
              className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer flex-shrink-0"
              title="Día anterior"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <input
              type="date"
              value={selectedDate || ''}
              onChange={(e) => setSelectedDate(e.target.value || null)}
              className="flex-1 min-w-0 h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              style={{ cursor: 'pointer' }}
            />
            <button
              onClick={() => {
                const baseDate = selectedDate ? new Date(selectedDate) : new Date();
                const nextDay = new Date(baseDate);
                nextDay.setDate(baseDate.getDate() + 1);
                setSelectedDate(nextDay.toISOString().split('T')[0]);
              }}
              className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600 transition-colors cursor-pointer flex-shrink-0"
              title="Día siguiente"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <button
          onClick={() => {
            setShowFilters(!showFilters);
            if (!showFilters) setShowSorting(false); // Cerrar orden si se abren filtros
          }}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm transition-colors cursor-pointer"
        >
          {showFilters ? 'Ocultar Filtros' : 'Mostrar Filtros'}
        </button>
        
        <button
          onClick={() => {
            setShowSorting(!showSorting);
            if (!showSorting) setShowFilters(false); // Cerrar filtros si se abre orden
          }}
          className="px-3 py-1 bg-gray-200 dark:bg-gray-700 hover:bg-gray-300 dark:hover:bg-gray-600 rounded-md text-sm transition-colors cursor-pointer"
        >
          {showSorting ? 'Ocultar ' : 'Mostrar '}Orden
        </button>
        
        <button
          onClick={() => setShowAddTaskModal(true)}
          className="px-3 py-1 bg-purple-500 hover:bg-purple-600 text-white rounded-md text-sm transition-colors cursor-pointer ml-auto"
        >
          + Nueva Tarea
        </button>
      </div>

      {/* Opciones de ordenamiento */}
      {showSorting && (
        <div className="w-full mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                Ordenar por
              </label>
              <select
                value={sortBy.field}
                onChange={(e) => setSortBy({...sortBy, field: e.target.value as any})}
                className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="due_date">Fecha de vencimiento</option>
                <option value="status">Estado</option>
                <option value="priority">Prioridad</option>
                <option value="name">Nombre</option>
              </select>
            </div>
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                Ordenar de manera
              </label>
              <select
                value={sortBy.order}
                onChange={(e) => setSortBy({...sortBy, order: e.target.value as 'asc' | 'desc'})}
                className="w-full h-10 p-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="asc">Ascendente (A-Z, 1-9, Antiguo-Nuevo)</option>
                <option value="desc">Descendente (Z-A, 9-1, Nuevo-Antiguo)</option>
              </select>
            </div>
          </div>
        </div>
      )}

      {/* Filtros */}
      {showFilters && (
        <div className="w-full mt-3 p-4 bg-gray-50 dark:bg-gray-800 rounded-lg space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Filtro por estado */}
            <div className="flex flex-col">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 h-5">
                Filtrar por estado
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
                Filtrar por prioridad
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
          </div>
        </div>
      )}
    </div>
  );
}
