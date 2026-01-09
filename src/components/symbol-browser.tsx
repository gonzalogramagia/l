

import { useState, useMemo } from "react";
import { symbols, SymbolItem } from "../data/symbols";
import { CopyableItem } from "./copyable-item";

export function SymbolBrowser() {
    const [search, setSearch] = useState("");

    const filteredSymbols = useMemo(() => {
        if (!search.trim()) return symbols;
        const lowerSearch = search.toLowerCase();

        // Check if search matches a category name
        const matchingCategory = ["Emojis", "Expresiones", "Letras", "Signos"].find(
            cat => cat.toLowerCase().includes(lowerSearch)
        );

        // If searching for a category, return all items in that category
        if (matchingCategory) {
            return symbols.filter(item => item.category === matchingCategory);
        }

        // Otherwise, search in symbol and description
        return symbols.filter(
            (item) =>
                item.symbol.toLowerCase().includes(lowerSearch) ||
                item.description.toLowerCase().includes(lowerSearch) ||
                item.tags?.some((tag) => tag.toLowerCase().includes(lowerSearch))
        );
    }, [search]);

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
                <input
                    type="text"
                    placeholder="Buscar símbolo o emoji..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="w-full px-4 py-2 rounded-lg border border-gray-300 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
            </div>

            {categories.map((category) => {
                const items = groupedSymbols[category];
                if (items.length === 0) return null;

                return (
                    <section key={category}>
                        <h2 className="text-xl font-bold mb-4">{category}</h2>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {items.map((item, index) => (
                                <div
                                    key={`${item.symbol}-${index}`}
                                    className="flex items-center gap-3 p-2 rounded hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                                >
                                    <CopyableItem
                                        copyText={item.symbol}
                                        className="text-2xl min-w-[2rem] text-center"
                                    >
                                        {item.symbol}
                                    </CopyableItem>
                                    <CopyableItem copyText={item.symbol} className="text-sm text-gray-600 dark:text-gray-400 truncate">
                                        {item.description}
                                    </CopyableItem>
                                </div>
                            ))}
                        </div>
                    </section>
                );
            })}

            {filteredSymbols.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                    No se encontraron resultados para "{search}"
                </div>
            )}
        </div>
    );
}
