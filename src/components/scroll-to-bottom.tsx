import { useEffect, useState } from 'react'

export function ScrollToBottom() {
    const [isBottom, setIsBottom] = useState(false)

    useEffect(() => {
        const handleScroll = () => {
            // Check if we are near the bottom of the page OR if the page is short (no scroll needed)
            const isShortPage = document.body.offsetHeight <= window.innerHeight + 100;
            const nearBottom = isShortPage || (window.innerHeight + window.scrollY >= document.body.offsetHeight - 100);

            setIsBottom(nearBottom)
        }

        window.addEventListener('scroll', handleScroll)
        window.addEventListener('resize', handleScroll) // Also listen to resize

        // Use ResizeObserver for body height changes (crucial for filtered results)
        const resizeObserver = new ResizeObserver(() => {
            handleScroll();
        });
        resizeObserver.observe(document.body);

        // Call once on mount
        handleScroll()

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', handleScroll);
            resizeObserver.disconnect();
        }
    }, [])

    const scrollToBottom = () => {
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth',
        })
    }

    if (isBottom) {
        return null;
    }

    // Scroll to bottom button
    return (
        <button
            onClick={scrollToBottom}
            className="fixed bottom-8 left-8 z-50 p-3 bg-white text-neutral-900 border border-neutral-200 rounded-full shadow-lg hover:bg-neutral-100 transition-colors animate-occasional-bounce cursor-pointer"
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
