import { createContext, useContext, useState, ReactNode, useEffect } from "react";

export type Language = "es" | "en";

interface LanguageContextType {
    language: Language;
    setLanguage: (lang: Language) => void;
    t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

const translations = {
    es: {
        "search.placeholder": "Buscar emoji por su nombre o sus categorías...",
        "search.no_results": 'No se encontraron resultados para "{search}"',
        "category.Emojis": "Emojis",
        "category.Expresiones": "Expresiones",
        "category.Signos": "Signos",
        "category.Letras": "Letras",
        "copy.feedback": "¡Copiado!",
        "link.more_emojis": "Más emojis en:",
    },
    en: {
        "search.placeholder": "Search emoji by name or categories...",
        "search.no_results": 'No results found for "{search}"',
        "category.Emojis": "Emojis",
        "category.Expresiones": "Expressions",
        "category.Signos": "Signs",
        "category.Letras": "Letters",
        "copy.feedback": "Copied!",
        "link.more_emojis": "More emojis at:",
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const [language, setLanguage] = useState<Language>(() => {
        const saved = localStorage.getItem("language");
        if (saved === "es" || saved === "en") return saved;
        return navigator.language.startsWith("es") ? "es" : "en";
    });

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.lang = language;
    }, [language]);

    const t = (key: string) => {
        return translations[language][key as key_of<typeof translations.es>] || key;
    };

    return (
        <LanguageContext.Provider value={{ language, setLanguage, t }}>
            {children}
        </LanguageContext.Provider>
    );
}

export function useLanguage() {
    const context = useContext(LanguageContext);
    if (context === undefined) {
        throw new Error("useLanguage must be used within a LanguageProvider");
    }
    return context;
}

type key_of<T> = keyof T;
