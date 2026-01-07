export default function Header() {
  return (
    <div className="px-4 lg:px-0 max-w-xl mx-auto mb-16 pt-4">
      <div className="mb-16">
        <div className="flex items-center gap-4">
          <a 
            href="https://devconnect.org/" 
            target="_blank" 
            rel="noopener noreferrer"
            className="cursor-pointer"
          >
            <img 
              src="/devconnect-logo.jpg" 
              alt="Devconnect Logo" 
              className="h-16 w-auto rounded-lg hover:opacity-80 transition-opacity"
            />
          </a>
          <div>
            <a 
              href="https://devconnect.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="cursor-pointer"
            >
                <h1 className="text-3xl font-bold mb-1 hover:text-purple-600 dark:hover:text-purple-400 transition-colors">Devconnect</h1>
            </a>
            <a 
              href="https://devconnect.org/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400 transition-colors"
            >
              devconnect.org
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}