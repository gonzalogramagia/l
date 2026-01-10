import { StickyNote } from 'lucide-react'
import { useLanguage } from '../contexts/language-context'

export function LocalNoteLink() {
    const { language } = useLanguage()
    const baseUrl = "https://local.gonzalogramagia.com"
    const href = language === 'en' ? `${baseUrl}/en` : baseUrl

    return (
        <a
            href={href}
            className="fixed bottom-8 left-8 p-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group z-50"
            aria-label="Local Notes"
        >
            <StickyNote className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
        </a>
    )
}
