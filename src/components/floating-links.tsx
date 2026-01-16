import { Home, Smile, Music, BicepsFlexed } from 'lucide-react'
import { useLanguage } from '../contexts/language-context'

export function FloatingLinks() {
    const { language, t } = useLanguage()
    const isEnglish = language === 'en'

    // Logic for URLs
    const getUrl = (baseUrl: string) => isEnglish ? `${baseUrl}/en` : baseUrl

    const homeUrl = getUrl("https://home.gonzalogramagia.com")
    // const emojisUrl = getUrl("https://emojis.gonzalogramagia.com") // Unused because button is disabled
    const musicUrl = getUrl("https://music.gonzalogramagia.com")

    const trainingUrl = getUrl("https://entrenar.app")

    return (
        <div className="fixed bottom-8 left-8 flex gap-3 z-50">
            {/* Home Button */}
            <a
                href={homeUrl}
                className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
                aria-label={t('ariaHome')}
                title={t('ariaHome')}
            >
                <Home className="w-6 h-6 text-zinc-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
            </a>

            {/* Emojis Button (Disabled) */}
            <button
                disabled
                className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg transition-all opacity-50 cursor-not-allowed group"
                aria-label={t('ariaEmojis')}
                title={t('ariaEmojis')}
            >
                <Smile className="w-6 h-6 text-zinc-900 dark:text-white transition-colors" />
            </button>

            {/* Music Button */}
            <a
                href={musicUrl}
                className="p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
                aria-label={t('ariaMusic')}
                title={t('ariaMusic')}
            >
                <Music className="w-6 h-6 text-zinc-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
            </a>

            {/* Training Button */}
            <a
                href={trainingUrl}
                className="hidden md:flex p-3 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-full shadow-lg hover:shadow-xl transition-all hover:scale-110 group cursor-pointer"
                aria-label={t('ariaTraining')}
                title={t('ariaTraining')}
            >
                <BicepsFlexed className="w-6 h-6 text-gray-900 dark:text-white group-hover:text-yellow-500 transition-colors" />
            </a>
        </div>
    )
}
