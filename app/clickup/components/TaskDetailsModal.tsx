import { Task, ListData } from '../types';

interface TaskDetailsModalProps {
  selectedTask: Task;
  onClose: () => void;
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onStatusChange: (taskId: string, newStatus: string) => void;
  uniqueStatuses: string[];
  getPriorityLabel: (priority: Task['priority']) => string;
  formatDate: (timestamp: string | null) => string | null;
  availableLists: ListData[];
}

export default function TaskDetailsModal({
  selectedTask,
  onClose,
  onEdit,
  onDelete,
  onStatusChange,
  uniqueStatuses,
  getPriorityLabel,
  formatDate,
  availableLists
}: TaskDetailsModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4" onClick={onClose}>
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-2xl w-full shadow-2xl" onClick={e => e.stopPropagation()}>
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h2 className="text-2xl font-bold">{selectedTask.name}</h2>
              <button
                onClick={() => onEdit(selectedTask)}
                className="text-gray-500 hover:text-blue-600 dark:text-gray-400 dark:hover:text-blue-400 cursor-pointer p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                title="Editar tarea"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mb-4">
              {selectedTask.priority && (
                <span
                  className="px-2 py-1 text-xs rounded-full"
                  style={{ backgroundColor: selectedTask.priority.color + '20', color: selectedTask.priority.color }}
                >
                  {getPriorityLabel(selectedTask.priority)}
                </span>
              )}
              <div className="flex items-center gap-2">
                <select
                  value={selectedTask.status.status}
                  onChange={(e) => onStatusChange(selectedTask.id, e.target.value)}
                  className="px-2 py-1 text-xs rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 cursor-pointer"
                  style={{ color: selectedTask.status.color }}
                >
                  {uniqueStatuses.map(status => (
                    <option key={status} value={status}>
                      {status}
                    </option>
                  ))}
                </select>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (confirm('¿Estás seguro de que deseas eliminar esta tarea?')) {
                      onDelete(selectedTask.id);
                    }
                  }}
                  className="p-1.5 rounded-full transition-colors duration-200 hover:bg-gray-100 dark:hover:bg-gray-700 cursor-pointer group"
                  title="Eliminar tarea"
                >
                  <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="h-5 w-5 text-gray-500 group-hover:text-gray-700 dark:text-gray-400 dark:group-hover:text-gray-200 transition-colors duration-200" 
                    fill="none" 
                    viewBox="0 0 24 24" 
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            className="hidden sm:block text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 cursor-pointer ml-4"
          >
            ✕
          </button>
        </div>
        
        <div className="mb-6 -mt-4">
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
          {selectedTask.list_id && (
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium">📍 Ubicación:</span>
              <span className="text-sm text-gray-600 dark:text-gray-400">
                {(() => {
                  const list = availableLists.find(l => l.id === selectedTask.list_id);
                  return list ? `${list.space_name} → ${list.name}` : 'Ubicación desconocida';
                })()}
              </span>
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
            onClick={onClose}
            className="px-4 py-2 bg-gray-200 dark:bg-gray-800 hover:bg-gray-300 dark:hover:bg-gray-700 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
