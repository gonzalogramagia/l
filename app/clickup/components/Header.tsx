export default function Header() {
  return (
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
}
