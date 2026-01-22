import Home from './pages/Home'
import Footer from './components/footer'
import { FloatingLinks } from './components/floating-links'
import { LanguageProvider, useLanguage } from './contexts/language-context'
import { useState } from 'react'
import { Github, Wrench, Pencil, Check } from 'lucide-react'
import ConfigModal from './components/config-modal'
import { CustomSymbolsProvider } from './contexts/custom-symbols-context'
import { Routes, Route } from 'react-router-dom'
import ExportModal from './components/export-modal'
import ImportModal from './components/import-modal'

function AppContent() {
    const { language, t } = useLanguage()
    const [isSettingsOpen, setIsSettingsOpen] = useState(false)
    const [editingEmoji, setEditingEmoji] = useState(null)
    const [emojiHistory, setEmojiHistory] = useState<string>("")
    const [historyCopied, setHistoryCopied] = useState(false)
    const [isEditingHistory, setIsEditingHistory] = useState(false)

    const handleEditEmoji = (emoji: any) => {
        setEditingEmoji(emoji)
        setIsSettingsOpen(true)
    }

    const handleEmojiCopy = (emoji: string) => {
        setEmojiHistory(prev => prev ? `${prev} ${emoji}` : emoji)
    }

    const handleCopyAll = async () => {
        if (isEditingHistory) return;
        try {
            await navigator.clipboard.writeText(emojiHistory);
            setHistoryCopied(true);
            setTimeout(() => setHistoryCopied(false), 1500);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
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
            {/* Cajita de emojis copiados (Centered on Large Screens) */}
            {emojiHistory && (
                <div className="fixed top-4 left-12 right-12 md:top-6 md:left-1/2 md:-translate-x-1/2 md:right-auto z-[100] animate-in fade-in slide-in-from-top-4 duration-300">
                    <div className="bg-white/95 backdrop-blur-md border border-neutral-200 rounded-xl p-2 shadow-xl flex items-center gap-2 group w-full md:min-w-[16rem] md:max-w-[400px] lg:max-w-[500px]">
                        {isEditingHistory ? (
                            <input
                                type="text"
                                autoFocus
                                value={emojiHistory}
                                onChange={(e) => {
                                    setEmojiHistory(e.target.value);
                                    if (e.target.value === "") setIsEditingHistory(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === 'Enter') setIsEditingHistory(false);
                                    if (e.key === 'Escape') setIsEditingHistory(false);
                                }}
                                className="bg-neutral-100/50 px-3 py-2 rounded-lg text-lg w-full focus:outline-none focus:ring-2 focus:ring-[#6866D6]/50 transition-all"
                            />
                        ) : (
                            <div
                                className={`bg-neutral-50 px-3 py-2 rounded-lg text-lg overflow-x-auto whitespace-nowrap scrollbar-hide select-all cursor-pointer min-w-[3rem] transition-colors flex-1 ${historyCopied ? 'text-green-600 font-medium' : 'text-neutral-900'}`}
                                onClick={handleCopyAll}
                                title={t('history.copy_all')}
                            >
                                {historyCopied ? t("copy.feedback") : emojiHistory}
                            </div>
                        )}

                        <div className="flex items-center gap-1 shrink-0">
                            {isEditingHistory ? (
                                <button
                                    onClick={() => setIsEditingHistory(false)}
                                    className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#6866D6] transition-colors cursor-pointer"
                                    title={t('config.form.save')}
                                >
                                    <Check className="w-4 h-4" />
                                </button>
                            ) : (
                                <button
                                    onClick={() => setIsEditingHistory(true)}
                                    className="p-1.5 hover:bg-neutral-100 rounded-full text-neutral-400 hover:text-[#6866D6] transition-colors cursor-pointer"
                                    title={t('history.edit')}
                                >
                                    <Pencil className="w-4 h-4" />
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            <div
                className="fixed inset-0 z-[-1] bg-cover bg-center bg-fixed bg-no-repeat opacity-5"
                style={{ backgroundImage: "url('/wallpaper.png')" }}
            />
            <main className="flex-auto min-w-0 mt-6 flex flex-col px-8 lg:px-0">
                <Home onEdit={handleEditEmoji} onCopy={handleEmojiCopy} />
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
                        <Github className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-[#6866D6] transition-colors" />
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
