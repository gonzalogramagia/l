import { Task } from '../types';

interface TaskCardProps {
  task: Task;
  onClick: () => void;
  getPriorityLabel: (priority: Task['priority']) => string;
  formatDate: (timestamp: string | null) => string | null;
}

export default function TaskCard({ task, onClick, getPriorityLabel, formatDate }: TaskCardProps) {
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
      
      <div className="flex items-center gap-4 text-xs text-gray-500 dark:text-gray-500">
        <span>📅 {task.due_date ? formatDate(task.due_date) : 'Fecha por definir'}</span>
      </div>
    </div>
  );
}
