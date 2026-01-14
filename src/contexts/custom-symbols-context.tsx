
import { createContext, useContext, useEffect, useState, ReactNode } from "react";
import { SymbolItem } from "../data/symbols";

interface CustomSymbolsContextType {
    customSymbols: SymbolItem[];
    addCustomSymbol: (symbol: CustomSymbolInput) => void;
    editCustomSymbol: (oldSymbol: string, symbol: CustomSymbolInput) => void;
    removeCustomSymbol: (symbol: string) => void;
}

export interface CustomSymbolInput {
    symbol: string;
    description: string;
    tags?: string; // Comma separated tags
}

const CustomSymbolsContext = createContext<CustomSymbolsContextType | undefined>(undefined);

export function CustomSymbolsProvider({ children }: { children: ReactNode }) {
    const [customSymbols, setCustomSymbols] = useState<SymbolItem[]>(() => {
        const stored = localStorage.getItem("custom_emojis");
        return stored ? JSON.parse(stored) : [];
    });

    useEffect(() => {
        localStorage.setItem("custom_emojis", JSON.stringify(customSymbols));
    }, [customSymbols]);

    const addCustomSymbol = (input: CustomSymbolInput) => {
        const newSymbol: SymbolItem = {
            symbol: input.symbol,
            description: {
                es: { main: input.description },
                en: { main: input.description },
            },
            category: "Emojis", // Default category or could be "Custom" if supported
            tags: {
                es: input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                en: input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
            },
        };
        setCustomSymbols(prev => [...prev, newSymbol]);
    };

    const editCustomSymbol = (oldSymbol: string, input: CustomSymbolInput) => {
        setCustomSymbols(prev => prev.map(item => {
            if (item.symbol === oldSymbol) {
                return {
                    ...item,
                    symbol: input.symbol,
                    description: {
                        es: { main: input.description },
                        en: { main: input.description },
                    },
                    tags: {
                        es: input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                        en: input.tags ? input.tags.split(",").map(t => t.trim()).filter(Boolean) : [],
                    }
                };
            }
            return item;
        }));
    };

    const removeCustomSymbol = (symbol: string) => {
        setCustomSymbols(prev => prev.filter(s => s.symbol !== symbol));
    };

    return (
        <CustomSymbolsContext.Provider value={{ customSymbols, addCustomSymbol, editCustomSymbol, removeCustomSymbol }}>
            {children}
        </CustomSymbolsContext.Provider>
    );
}

export function useCustomSymbols() {
    const context = useContext(CustomSymbolsContext);
    if (context === undefined) {
        throw new Error("useCustomSymbols must be used within a CustomSymbolsProvider");
    }
    return context;
}
