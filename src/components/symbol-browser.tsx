

import { useState, useMemo, useEffect } from "react";
import { symbols } from "../data/symbols";
import { useLanguage } from "../contexts/language-context";
import { Check, SearchX, X, Hash } from "lucide-react";
import { useCustomSymbols } from "../contexts/custom-symbols-context";

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
    const { t } = useLanguage();
    const { customSymbols } = useCustomSymbols();

    // Combined symbols
    const allSymbols = useMemo(() => [...customSymbols, ...symbols], [customSymbols]);

    // State for Search
    const [search, setSearch] = useState("");
    const [activeTag, setActiveTag] = useState<string | null>(null);
    const [expandedTags, setExpandedTags] = useState(false);
    const [copiedSymbol, setCopiedSymbol] = useState<string | null>(null);
    const { language } = useLanguage();

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

    useEffect(() => {
        setExpandedTags(false);
    }, [search]);

    const allTags = useMemo(() => {
        const tags = new Set<string>();
        symbols.forEach(item => {
            item.tags?.[language]?.forEach(tag => tags.add(tag));
        });
        return Array.from(tags).sort();
    }, [language]);

    const matchingTags = useMemo(() => {
        if (!search.trim() || activeTag) return [];
        const lowerSearch = search.toLowerCase();
        return allTags.filter(tag => tag.toLowerCase().includes(lowerSearch));
    }, [search, allTags, activeTag]);

    const filteredSymbols = useMemo(() => {
        let currentSymbols = symbols;

        if (language === 'en') {
            currentSymbols = currentSymbols.filter(item =>
                item.category !== "Letras" &&
                item.symbol !== "¡" &&
                item.symbol !== "¿"
            );
        }

        if (activeTag) {
            return currentSymbols.filter(item =>
                item.tags?.[language]?.includes(activeTag)
            );
        }

        if (!search.trim()) return currentSymbols;
        if (!search.trim() && !activeTag) return allSymbols;

        const searchLower = search.toLowerCase();

        return allSymbols.filter((item) => {
            // Filter by Active Tag
            if (activeTag) {
                const itemTags = item.tags?.[language] || [];
                if (!itemTags.includes(activeTag)) return false;
            }

            if (!search.trim()) return true;

            // Search by Symbol
            if (item.symbol.includes(search)) return true;

            // Search by Description
            const description = item.description[language];
            if (
                description.main.toLowerCase().includes(searchLower) ||
                description.secondary?.some((s) => s.toLowerCase().includes(searchLower))
            ) {
                return true;
            }

            // Search by Tags
            const tags = item.tags?.[language] || [];
            if (tags.some((tag) => tag.toLowerCase().includes(searchLower))) return true;

            return false;
        });
    }, [search, language, activeTag, t, allSymbols]);

    const contextualTags = useMemo(() => {
        if (!search.trim() && !activeTag) return ["Expresiones", "Simbolos"]; // Default tags

        const tagCounts = new Map<string, number>();
        filteredSymbols.forEach(item => {
            item.tags?.[language]?.forEach(tag => {
                if (tag !== activeTag && !matchingTags.includes(tag)) {
                    tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
                }
            });
        });

        return Array.from(tagCounts.entries())
            .sort((a, b) => b[1] - a[1])
            .map(([tag]) => tag)
            .slice(0, 7);
    }, [filteredSymbols, language, activeTag, matchingTags, search]);

    const handleTagClick = (tag: string) => {
        setActiveTag(tag);
        setSearch("");
        setExpandedTags(false);
    };

    const handleUnpinTag = () => {
        setActiveTag(null);
        setSearch("");
        setExpandedTags(false);
    };





    return (
        <div className="space-y-8">
            <div className="sticky top-0 z-10 bg-white py-4 border-b border-neutral-200 space-y-3">
                <div className="flex items-center gap-4">
                    <div className="relative flex-1">
                        <input
                            type="text"
                            placeholder={t("search.placeholder")}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                            onFocus={() => {
                                if (activeTag) {
                                    handleUnpinTag();
                                }
                            }}
                            className="w-full px-4 py-2 rounded-lg border border-neutral-300 bg-neutral-50 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-neutral-900"
                        />
                    </div>
                    <LanguageSwitch />
                </div>

                {activeTag && (
                    <div className="flex items-center cursor-pointer" onClick={handleUnpinTag}>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm font-medium hover:bg-blue-200 transition-colors">
                            <Hash className="w-3.5 h-3.5" />
                            {activeTag}
                            <button
                                onClick={(e) => {
                                    e.stopPropagation();
                                    handleUnpinTag();
                                }}
                                className="ml-1 p-0.5 rounded-full transition-colors cursor-pointer"
                            >
                                <X className="w-3.5 h-3.5" />
                            </button>
                        </span>
                    </div>
                )}

                {/* Tag Suggestions */}
                {(matchingTags.length > 0 || contextualTags.length > 0) && (
                    <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2 duration-200">
                        {/* Direct Matches */}
                        {matchingTags.slice(0, expandedTags ? undefined : 7).map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-100 hover:bg-neutral-200 text-neutral-600 rounded text-xs transition-colors cursor-pointer"
                            >
                                <Hash className="w-3 h-3" />
                                {tag}
                            </button>
                        ))}

                        {/* Separator if needed */}
                        {matchingTags.length > 0 && contextualTags.length > 0 && (
                            (expandedTags) ||
                            (!expandedTags && matchingTags.length < 7)
                        ) && (
                                <div className="w-px h-6 bg-neutral-200 mx-1" />
                            )}

                        {/* Contextual/Related Tags */}
                        {contextualTags.slice(0, expandedTags ? undefined : Math.max(0, 7 - matchingTags.length)).map(tag => (
                            <button
                                key={tag}
                                onClick={() => handleTagClick(tag)}
                                className="inline-flex items-center gap-1 px-2 py-1 bg-neutral-50 hover:bg-neutral-100 text-neutral-500 hover:text-neutral-700 rounded text-xs transition-colors cursor-pointer opacity-80 hover:opacity-100"
                            >
                                <Hash className="w-3 h-3 opacity-50" />
                                {tag}
                            </button>
                        ))}

                        {/* Show More */}
                        {(matchingTags.length + contextualTags.length) > 7 && !expandedTags && (
                            <button
                                onClick={() => setExpandedTags(true)}
                                className="text-xs text-neutral-400 py-1 hover:text-neutral-600 cursor-pointer transition-colors"
                            >
                                {`+${(matchingTags.length + contextualTags.length) - 7} more`}
                            </button>
                        )}
                    </div>
                )}
            </div>

            <section>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    {filteredSymbols.map((item, index) => {
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

            {
                filteredSymbols.length === 0 && (
                    <div className="flex flex-col items-center justify-center py-12 text-neutral-500 space-y-4">
                        <div className="bg-neutral-100 p-4 rounded-full">
                            <SearchX className="w-8 h-8 text-neutral-400" />
                        </div>
                        <div className="text-center text-neutral-500">
                            <p className="font-bold text-lg mb-1">
                                {activeTag ? t("search.no_results").replace('"{search}"', '').trim() : t("search.no_results").replace('"{search}"', '').trim()}
                            </p>
                            <p className="text-lg">"{activeTag ? `#${activeTag}` : search}"</p>
                        </div>
                        <div className="pt-4">
                            <a
                                href="https://piliapp.com/twitter-symbols"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:underline text-center block"
                            >
                                {t("link.more_emojis")} https://piliapp.com/twitter-symbols
                            </a>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
