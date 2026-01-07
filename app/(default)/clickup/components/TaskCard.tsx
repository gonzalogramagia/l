import { Task, ListData } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  getPriorityLabel: (priority: Task['priority']) => string;
  formatDate: (timestamp: string | null) => string | null;
  availableLists: ListData[];
}

export default function TaskCard({ task, onClick, getPriorityLabel, formatDate, availableLists }: TaskCardProps) {
  return (
    <div
      className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm hover:shadow-md transition-shadow cursor-pointer"
      onClick={onClick}
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
      
      <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-500">
        {task.due_date ? (
          <div>
            <div>📅 {formatDate(task.due_date)?.split(', ')[0]}</div>
            <div className="text-gray-400 dark:text-gray-500">{formatDate(task.due_date)?.split(', ')[1]}</div>
          </div>
        ) : (
          <span>📅 Fecha por definir</span>
        )}
        {/* Ubicación en la esquina inferior derecha */}
        {task.list_id && (
          <div className="text-gray-400 dark:text-gray-600 text-right">
            {(() => {
              const list = availableLists.find(l => l.id === task.list_id);
              return list ? (
                <div>
                  <div className="text-xs">{list.space_name}</div>
                  <div className="text-xs text-gray-500 dark:text-gray-500">→ {list.name}</div>
                </div>
              ) : '';
            })()}
          </div>
        )}
      </div>
    </div>
  );
}
