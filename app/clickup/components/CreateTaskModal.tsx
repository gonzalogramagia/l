import React from 'react';

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
  uniquePriorities: string[];
  getPriorityLabel: (priority: any) => string;
  newTaskListId: string;
  setNewTaskListId: (listId: string) => void;
  newTaskFolderId: string;
  setNewTaskFolderId: (folderId: string) => void;
  availableLists: any[];
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
  onCancel,
  uniquePriorities,
  getPriorityLabel,
  newTaskListId,
  setNewTaskListId,
  newTaskFolderId,
  setNewTaskFolderId,
  availableLists
}: CreateTaskModalProps) {
  
  // Auto-seleccionar "Personal" y "Organización" por defecto solo una vez
  React.useEffect(() => {
    if (availableLists.length > 0 && !newTaskFolderId && !newTaskListId) {
      // Buscar el espacio "Personal"
      const personalSpace = availableLists.find(list => list.space_name === 'Personal');
      if (personalSpace) {
        setNewTaskFolderId(personalSpace.space_id);
      }
      
      // Buscar la lista "Organización" dentro del espacio Personal
      const organizacionList = availableLists.find(list => 
        list.space_name === 'Personal' && list.name === 'Organización'
      );
      if (organizacionList) {
        setNewTaskListId(organizacionList.id);
      }
    }
  }, [availableLists]); // Solo depende de availableLists, no de los valores actuales
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-10 flex items-center justify-center z-50 p-4">
      <div className="bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm rounded-xl p-6 max-w-3xl w-full shadow-2xl">
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
            <label className="block text-sm font-medium mb-2">Descripción de la tarea *</label>
            <textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
              rows={3}
              placeholder="Descripción de la tarea"
            />
          </div>
          
          <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
            <div>
              <label className="block text-sm font-medium mb-2 h-5">Fecha límite *</label>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => {
                    if (newTaskDate) {
                      const currentDate = new Date(newTaskDate);
                      const previousDay = new Date(currentDate);
                      previousDay.setDate(currentDate.getDate() - 1);
                      setNewTaskDate(previousDay.toISOString().split('T')[0]);
                    } else {
                      // Si no hay fecha seleccionada, usar el día actual
                      const today = new Date();
                      const previousDay = new Date(today);
                      previousDay.setDate(today.getDate() - 1);
                      setNewTaskDate(previousDay.toISOString().split('T')[0]);
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
                  value={newTaskDate}
                  onChange={(e) => setNewTaskDate(e.target.value)}
                  className="flex-1 min-w-0 h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-left"
                />
                <button
                  onClick={() => {
                    if (newTaskDate) {
                      const currentDate = new Date(newTaskDate);
                      const nextDay = new Date(currentDate);
                      nextDay.setDate(currentDate.getDate() + 1);
                      setNewTaskDate(nextDay.toISOString().split('T')[0]);
                    } else {
                      // Si no hay fecha seleccionada, usar el día actual
                      const today = new Date();
                      const nextDay = new Date(today);
                      nextDay.setDate(today.getDate() + 1);
                      setNewTaskDate(nextDay.toISOString().split('T')[0]);
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
                value={newTaskPriority}
                onChange={(e) => setNewTaskPriority(Number(e.target.value))}
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
        
        {/* Selectores de Espacio y Lista */}
        <div className="space-y-4 sm:space-y-0 sm:grid sm:grid-cols-2 sm:gap-4">
          {/* Selector de Espacio */}
          <div>
            <label className="block text-sm font-medium mb-2 mt-3">Espacio *</label>
            <select
              value={newTaskFolderId}
              onChange={(e) => {
                setNewTaskFolderId(e.target.value);
                setNewTaskListId(''); // Limpiar lista cuando cambie espacio
              }}
              className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
            >
              <option value="">Seleccionar espacio...</option>
              {Array.from(new Set(availableLists.filter(list => list.space_id && list.space_name).map(list => list.space_name))).map(spaceName => {
                const space = availableLists.find(list => list.space_name === spaceName);
                return (
                  <option key={space?.space_id} value={space?.space_id}>
                    {spaceName}
                  </option>
                );
              })}
            </select>
          </div>
          
          {/* Selector de Lista */}
          <div>
            <label className="block text-sm font-medium mb-2 sm:mt-3">Lista *</label>
            <select
              value={newTaskListId}
              onChange={(e) => setNewTaskListId(e.target.value)}
              disabled={!newTaskFolderId}
              className="w-full h-10 px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md bg-white dark:bg-gray-800 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 disabled:bg-gray-100 dark:disabled:bg-gray-700 disabled:cursor-not-allowed"
            >
              <option value="">Seleccionar lista...</option>
              {availableLists.filter(list => list.space_id === newTaskFolderId).map(list => (
                <option key={list.id} value={list.id}>
                  {list.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        
        <div className="flex gap-3 mt-6">
          <button
            onClick={onCreateTask}
            disabled={isCreatingTask || !newTaskName.trim() || !newTaskDate || !newTaskFolderId || !newTaskListId}
            className="flex-1 px-4 py-3 bg-purple-500 text-white rounded-md hover:bg-purple-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed cursor-pointer"
          >
            {isCreatingTask ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mx-auto mb-2"></div>
                <span className="text-xs">Creando... (puede tardar varios segundos)</span>
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
