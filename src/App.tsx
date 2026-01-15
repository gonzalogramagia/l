import Home from './pages/Home'
import Footer from './components/footer'
import { FloatingLinks } from './components/floating-links'
import { LanguageProvider, useLanguage } from './contexts/language-context'
import { useState } from 'react'
import { Github, Wrench } from 'lucide-react'
import ConfigModal from './components/config-modal'
import { CustomSymbolsProvider } from './contexts/custom-symbols-context'
import { Routes, Route } from 'react-router-dom'
import ExportModal from './components/export-modal'
import ImportModal from './components/import-modal'

function AppContent() {
    const { language } = useLanguage()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [editingEmoji, setEditingEmoji] = useState(null)

    const handleEditEmoji = (emoji: any) => {
        setEditingEmoji(emoji)
        setIsSettingsOpen(true)
    }

    const handleCloseSettings = () => {
        setIsSettingsOpen(false)
        setEditingEmoji(null)
    }

    // Lógica para rutas de importación/exportación según idioma
    const isEnglish = language === 'en'
    const exportPath = isEnglish ? '/en/export' : '/exportar'
    const importPath = isEnglish ? '/en/import' : '/importar'

    return (
        <div className="max-w-4xl mx-4 mt-8 lg:mx-auto">
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
                <Home onEdit={handleEditEmoji} />
                <Footer />
                <FloatingLinks />
            </main>

            {/* Botón Flotante: Alterna entre Configuración (Wrench) y GitHub */}
            <div className="fixed bottom-8 right-8 flex gap-3 z-[110]">
                {isSettingsOpen ? (
                    <a
                        href="https://github.com/gonzalogramagia/emojis"
                        className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group flex items-center justify-center"
                        aria-label="GitHub Repository"
                        target="_blank"
                        rel="noreferrer"
                    >
                        <Github className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-blue-500 transition-colors" />
                    </a>
                ) : (
                    <button
                        onClick={() => setIsSettingsOpen(true)}
                        className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer flex items-center justify-center"
                        aria-label="Configuration"
                    >
                        <Wrench className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-zinc-600 dark:group-hover:text-zinc-300 transition-colors scale-x-[-1]" />
                    </button>
                )}
            </div>

            {/* Modal de Configuración */}
            {isSettingsOpen && (
                <ConfigModal
                    lang={language}
                    onClose={handleCloseSettings}
                    exportPath={exportPath}
                    importPath={importPath}
                    initialData={editingEmoji}
                />
            )}

            {/* Import/Export Modals */}
            <Routes>
                <Route path="/export" element={<ExportModal />} />
                <Route path="/en/export" element={<ExportModal />} />
                <Route path="/exportar" element={<ExportModal />} />
                <Route path="/import" element={<ImportModal />} />
                <Route path="/en/import" element={<ImportModal />} />
                <Route path="/importar" element={<ImportModal />} />
            </Routes>
        </div>
    );
}

function App() {
    return (
        <LanguageProvider>
            <CustomSymbolsProvider>
                <AppContent />
            </CustomSymbolsProvider>
        </LanguageProvider>
    )
}

export default App
