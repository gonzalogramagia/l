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
  onCancel
}: TaskEditModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" onClick={onCancel}>
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
