

import { useState, useMemo, useEffect } from "react";
import { symbols, SymbolItem } from "../data/symbols";
import { useLanguage } from "../contexts/language-context";
import { Check } from "lucide-react";

function LanguageSwitch() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-800 p-1 rounded-full w-fit">
            <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${language === "es"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${language === "en"
                    ? "bg-white dark:bg-gray-700 shadow-sm text-blue-600 dark:text-blue-400"
                    : "text-gray-500 hover:text-gray-700 dark:hover:text-gray-300"
                    }`}
            >
                EN
            </button>
        </div>
    );
}

export function SymbolBrowser() {
    const [search, setSearch] = useState("");
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
    const { language, t } = useLanguage();

    const handleCopy = async (text: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedSymbol(text);
        } catch (err) {
            console.error("Failed to copy!", err);
        }
    };

    useEffect(() => {
        if (copiedSymbol) {
            const timer = setTimeout(() => setCopiedSymbol(null), 1500);
            return () => clearTimeout(timer);
        }
    }, [copiedSymbol]);

    const filteredSymbols = useMemo(() => {
        if (!search.trim()) return symbols;
        const lowerSearch = search.toLowerCase();

        const categories = ["Emojis", "Expresiones", "Letras", "Signos"];
        const matchingCategory = categories.find(
            cat => t(`category.${cat}`).toLowerCase().includes(lowerSearch) || cat.toLowerCase().includes(lowerSearch)
        );

        if (matchingCategory) {
            return symbols.filter(item => item.category === matchingCategory);
        }

        return symbols.filter(
            (item) =>
                item.symbol.toLowerCase().includes(lowerSearch) ||
                item.description[language].main.toLowerCase().includes(lowerSearch) ||
                item.description[language].secondary?.some(s => s.toLowerCase().includes(lowerSearch)) ||
                item.description[language === "es" ? "en" : "es"].main.toLowerCase().includes(lowerSearch) ||
                item.description[language === "es" ? "en" : "es"].secondary?.some(s => s.toLowerCase().includes(lowerSearch)) ||
                item.tags?.[language]?.some((tag) => tag.toLowerCase().includes(lowerSearch)) ||
                item.tags?.[language === "es" ? "en" : "es"]?.some((tag) => tag.toLowerCase().includes(lowerSearch))
        );
    }, [search, language, t]);

    const groupedSymbols = useMemo(() => {
        const groups: Record<string, SymbolItem[]> = {
            Emojis: [],
            Expresiones: [],
            Signos: [],
            Letras: [],
        };

        filteredSymbols.forEach((item) => {
            if (groups[item.category]) {
                groups[item.category].push(item);
            }
        });

        return groups;
    }, [filteredSymbols]);

    const categories = ["Emojis", "Expresiones", "Letras", "Signos"];

    return (
        <div className="space-y-8">
            <div className="sticky top-0 z-10 bg-white dark:bg-black py-4 border-b border-gray-200 dark:border-gray-800">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                        />
                    </div>
                    <LanguageSwitch />
                </div>
            </div>

            {categories.map((category) => {
                const items = groupedSymbols[category];
                if (items.length === 0) return null;

                return (
                    <section key={category}>
                        <h2 className="text-xl font-bold mb-4">{t(`category.${category}`)}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item, index) => {
                                const isCopied = copiedSymbol === item.symbol;
                                return (
                                    <button
                                        key={`${item.symbol}-${index}`}
                                        onClick={() => handleCopy(item.symbol)}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-all text-left group overflow-hidden cursor-pointer"
                                    >
                                        <div className="text-2xl min-w-[2.5rem] h-10 flex items-center justify-center bg-gray-50 dark:bg-gray-900 rounded group-hover:bg-white dark:group-hover:bg-gray-800 transition-colors">
                                            {isCopied ? (
                                                <Check className="w-6 h-6 text-green-500 animate-in zoom-in duration-200" />
                                            ) : (
                                                item.symbol
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-sm font-medium truncate transition-colors ${isCopied ? "text-green-600 dark:text-green-400" : "text-gray-900 dark:text-gray-100"}`}>
                                                {isCopied ? t("copy.feedback") : item.description[language].main}
                                            </span>
                                            {item.tags?.[language] && item.tags[language].length > 0 && !isCopied && (
                                                <div className="relative mt-0.5">
                                                    <div className="flex flex-nowrap gap-1 overflow-hidden max-w-full">
                                                        {item.tags[language].map((tag, tagIndex) => (
                                                            <span key={tagIndex} className="text-[10px] text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                        {item.tags[language].length > 1 && (
                                                            <span className="text-[10px] text-gray-400 dark:text-gray-500">...</span>
                                                        )}
                                                    </div>

                                                    {/* Tooltip */}
                                                    <div className="absolute left-0 top-full mt-1 p-2 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-100 dark:border-gray-700 z-50 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity duration-200 min-w-[120px]">
                                                        <div className="flex flex-col gap-1">
                                                            {item.tags[language].map((tag, tagIndex) => (
                                                                <span key={tagIndex} className="text-[10px] text-gray-600 dark:text-gray-300 whitespace-nowrap">
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                );
                            })}
                        </div>
                    </section>
                );
            })}

            {filteredSymbols.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    {t("search.no_results").replace("{search}", search)}
                </div>
            )}
        </div>
    );
}
