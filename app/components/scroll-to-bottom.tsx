'use client'

import { useEffect, useState } from 'react'

export function ScrollToBottom() {
    const [isVisible, setIsVisible] = useState(true)

    useEffect(() => {
        const handleScroll = () => {
            // Check if we are near the bottom of the page
            const isBottom =
                window.innerHeight + window.scrollY >= document.body.offsetHeight - 100
            setIsVisible(!isBottom)
        }

        window.addEventListener('scroll', handleScroll)
        // Call once on mount to check initial state
        handleScroll()

        return () => window.removeEventListener('scroll', handleScroll)
    }, [])

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        })
    }

    if (!isVisible) return null

    return (
        <button
            onClick={scrollToBottom}
            className="fixed bottom-8 right-8 z-50 p-3 bg-neutral-900 text-white rounded-full shadow-lg hover:bg-neutral-700 transition-colors animate-occasional-bounce dark:bg-neutral-100 dark:text-black dark:hover:bg-neutral-300 cursor-pointer"
            aria-label="Scroll to bottom"
        >
            <svg
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M12 5V19M12 19L5 12M12 19L19 12"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                />
            </svg>
        </button>
    )
}
