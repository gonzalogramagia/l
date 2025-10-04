interface TaskEditModalProps {
  selectedTask: {
    id: string;
    name: string;
    description: string;
    due_date: string | null;
    priority: {
      priority: string;
      color: string;
    } | null;
  };
  editTaskName: string;
  setEditTaskName: (name: string) => void;
  editTaskDescription: string;
  setEditTaskDescription: (description: string) => void;
  editTaskDate: string;
  setEditTaskDate: (date: string) => void;
  editTaskPriority: number;
  setEditTaskPriority: (priority: number) => void;
  isUpdatingTask: boolean;
  error: string | null;
  onSave: () => void;
  onCancel: () => void;
  uniquePriorities: string[];
  getPriorityLabel: (priority: any) => string;
}

export default function TaskEditModal({
  selectedTask,
  editTaskName,
  setEditTaskName,
  editTaskDescription,
  setEditTaskDescription,
  editTaskDate,
  setEditTaskDate,
  editTaskPriority,
  setEditTaskPriority,
  isUpdatingTask,
  error,
  onSave,
  onCancel,
  uniquePriorities,
  getPriorityLabel
}: TaskEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" onClick={onCancel}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-3xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
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
            <label className="block text-sm font-medium mb-2">Descripción *</label>
            <textarea
              value={editTaskDescription}
              onChange={(e) => setEditTaskDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Descripción de la tarea"
            />
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 h-5">Fecha límite</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (editTaskDate) {
                      const currentDate = new Date(editTaskDate);
                      const previousDay = new Date(currentDate);
                      previousDay.setDate(currentDate.getDate() - 1);
                      setEditTaskDate(previousDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex-shrink-0"
                  title="Día anterior"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <input
                  type="date"
                  value={editTaskDate}
                  onChange={(e) => setEditTaskDate(e.target.value)}
                  className="flex-1 min-w-0 h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                />
                <button
                  onClick={() => {
                    if (editTaskDate) {
                      const currentDate = new Date(editTaskDate);
                      const nextDay = new Date(currentDate);
                      nextDay.setDate(currentDate.getDate() + 1);
                      setEditTaskDate(nextDay.toISOString().split('T')[0]);
                    }
                  }}
                  className="h-10 w-10 flex items-center justify-center border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors cursor-pointer flex-shrink-0"
                  title="Día siguiente"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 h-5">Prioridad *</label>
              <select
                value={editTaskPriority}
                onChange={(e) => setEditTaskPriority(Number(e.target.value))}
                className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                {uniquePriorities.filter(priority => priority !== 'none').map(priority => (
                  <option key={priority} value={Number(priority)}>
                    {getPriorityLabel({ priority } as any)}
                  </option>
                ))}
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
            onClick={onSave}
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
            onClick={onCancel}
            disabled={isUpdatingTask}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
