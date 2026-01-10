

import { useState, useMemo, useEffect } from "react";
import { symbols, SymbolItem } from "../data/symbols";
import { useLanguage } from "../contexts/language-context";
import { Check } from "lucide-react";

function LanguageSwitch() {
    const { language, setLanguage } = useLanguage();

    return (
        <div className="flex items-center gap-2 bg-neutral-100 p-1 rounded-full w-fit">
            <button
                onClick={() => setLanguage("es")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${language === "es"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700"
                    }`}
            >
                ES
            </button>
            <button
                onClick={() => setLanguage("en")}
                className={`px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${language === "en"
                    ? "bg-white shadow-sm text-blue-600"
                    : "text-neutral-500 hover:text-neutral-700"
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
        let currentSymbols = symbols;

        if (language === 'en') {
            currentSymbols = currentSymbols.filter(item =>
                item.category !== "Letras" &&
                item.symbol !== "¡" &&
                item.symbol !== "¿"
            );
        }

        if (!search.trim()) return currentSymbols;
        const lowerSearch = search.toLowerCase();

        const categories = ["Emojis", "Expresiones", "Letras", "Signos"];
        const matchingCategory = categories.find(
            cat => t(`category.${cat}`).toLowerCase().includes(lowerSearch) || cat.toLowerCase().includes(lowerSearch)
        );

        if (matchingCategory) {
            return currentSymbols.filter(item => item.category === matchingCategory);
        }

        return currentSymbols.filter(
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
            "Nuevos": [],
        };

        // Ensure "Nuevos" category exists in symbols data, or handle it here if it's dynamic
        // Based on previous file reads, categories are: Emojis, Expresiones, Signos, Letras

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
            <div className="sticky top-0 z-10 bg-white py-4 border-b border-neutral-200">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-neutral-900"
                        />
                    </div>
                    <LanguageSwitch />
                </div>
            </div>

            {categories.map((category) => {
                const items = groupedSymbols[category];
                if (!items || items.length === 0) return null;

                return (
                    <section key={category}>
                        <h2 className="text-xl font-bold mb-4 text-neutral-900">{t(`category.${category}`)}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item, index) => {
                                const isCopied = copiedSymbol === item.symbol;
                                return (
                                    <button
                                        key={`${item.symbol}-${index}`}
                                        onClick={() => handleCopy(item.symbol)}
                                        className="flex items-center gap-3 p-2 rounded hover:bg-neutral-50 transition-all text-left group overflow-hidden cursor-pointer"
                                    >
                                        <div className="text-2xl min-w-[2.5rem] h-10 flex items-center justify-center bg-neutral-50 rounded group-hover:bg-white transition-colors text-neutral-900">
                                            {isCopied ? (
                                                <Check className="w-6 h-6 text-green-500 animate-in zoom-in duration-200" />
                                            ) : (
                                                item.symbol
                                            )}
                                        </div>
                                        <div className="flex flex-col min-w-0">
                                            <span className={`text-sm font-medium truncate transition-colors ${isCopied ? "text-green-600" : "text-neutral-900"}`}>
                                                {isCopied ? t("copy.feedback") : item.description[language].main}
                                            </span>
                                            {item.tags?.[language] && item.tags[language].length > 0 && !isCopied && (
                                                <div className="flex flex-nowrap gap-1 overflow-hidden max-w-full">
                                                    {item.tags[language].map((tag, tagIndex) => (
                                                        <span key={tagIndex} className="text-[10px] text-neutral-400 whitespace-nowrap">
                                                            #{tag}
                                                        </span>
                                                    ))}
                                                    {item.tags[language].length > 1 && (
                                                        <span className="text-[10px] text-neutral-400">...</span>
                                                    )}
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
                <div className="text-center py-8 text-neutral-500">
                    {t("search.no_results").replace("{search}", search)}
                </div>
            )}
        </div>
    );
}
