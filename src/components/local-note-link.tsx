import { StickyNote } from 'lucide-react'

export function LocalNoteLink() {
    return (
        <a
            href="https://local.gonzalogramagia.com"
            className="fixed bottom-8 left-8 z-50 p-3 bg-white text-neutral-900 border border-neutral-200 rounded-full shadow-lg hover:bg-neutral-100 transition-colors cursor-pointer"
            aria-label="Local Notes"
        >
            <StickyNote className="w-6 h-6" />
        </a>
    )
}
