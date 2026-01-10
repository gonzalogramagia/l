import Home from './pages/Home'
import Footer from './components/footer'
import { ScrollToBottom } from './components/scroll-to-bottom'
import { LanguageProvider } from './contexts/language-context'
import { Github } from 'lucide-react'

function AppContent() {
    return (
        <div className="max-w-4xl mx-4 mt-8 lg:mx-auto">
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
                <Home />
                <Footer />
                <ScrollToBottom />
            </main>

            <a
                href="https://github.com/gonzalogramagia/emojis"
                target="_blank"
                rel="noopener noreferrer"
                className="fixed bottom-8 right-8 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group z-50 flex items-center justify-center"
                aria-label="GitHub Repository"
            >
                <Github className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors" />
            </a>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <AppContent />
        </LanguageProvider>
    )
}

export default App
