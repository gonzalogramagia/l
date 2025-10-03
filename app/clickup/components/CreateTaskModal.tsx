interface CreateTaskModalProps {
  newTaskName: string;
  setNewTaskName: (name: string) => void;
  newTaskDescription: string;
  setNewTaskDescription: (description: string) => void;
  newTaskDate: string;
  setNewTaskDate: (date: string) => void;
  newTaskPriority: number;
  setNewTaskPriority: (priority: number) => void;
  isCreatingTask: boolean;
  onCreateTask: () => void;
  onCancel: () => void;
}

export default function CreateTaskModal({
  newTaskName,
  setNewTaskName,
  newTaskDescription,
  setNewTaskDescription,
  newTaskDate,
  setNewTaskDate,
  newTaskPriority,
  setNewTaskPriority,
  isCreatingTask,
  onCreateTask,
  onCancel
}: CreateTaskModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-md w-full shadow-2xl">
        <h2 className="text-xl font-bold mb-4">Nueva Tarea</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Nombre de la tarea *</label>
            <input
              type="text"
              value={newTaskName}
              onChange={(e) => setNewTaskName(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              placeholder="Nombre de la tarea"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">Descripción de la tarea</label>
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
              <label className="block text-sm font-medium mb-2 h-5">Fecha límite *</label>
              <input
                type="date"
                value={newTaskDate}
                onChange={(e) => setNewTaskDate(e.target.value)}
                className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2 h-5">Prioridad</label>
              <select
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(Number(e.target.value))}
                className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
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
            onClick={onCreateTask}
            disabled={isCreatingTask || !newTaskName.trim() || !newTaskDate}
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
            onClick={onCancel}
            disabled={isCreatingTask}
            className="px-6 py-3 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors font-medium cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancelar
          </button>
        </div>
      </div>
    </div>
  );
}
