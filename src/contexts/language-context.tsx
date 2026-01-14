import { createContext, useContext, ReactNode, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";

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
        "category.Simbolos": "Símbolos",
        "category.Letras": "Letras",
        "copy.feedback": "¡Copiado!",
        "link.more_emojis": "Más emojis en",
        "ariaHome": "Ir a Home",
        "ariaEmojis": "Ir a Emojis",
        "ariaMusic": "Ir a Música",
        "ariaTraining": "Ir a Entrenar",
        "config.switch_language": "Cambiar Idioma",
        "config.title": "Configuración",
        "config.add_emoji.title": "Agregar Emoji Personalizado",
        "config.edit_emoji.title": "Editar Emoji Personalizado",
        "config.form.emoji": "Emoji",
        "config.form.emoji.placeholder": "🚀",
        "config.form.name": "Nombre",
        "config.form.name.placeholder": "Cohete",
        "config.form.tags": "Tags (separados por coma)",
        "config.form.tags.placeholder": "espacio, vehiculo",
        "config.form.add": "Agregar",
        "config.form.save": "Guardar",
        "config.form.cancel": "Cancelar",
        "config.my_emojis": "Mis Emojis",
        "config.edit": "Editar",
        "config.delete": "Eliminar",
    },
    en: {
        "search.placeholder": "Search emoji by name or categories...",
        "search.no_results": 'No results found for "{search}"',
        "category.Emojis": "Emojis",
        "category.Expresiones": "Expressions",
        "category.Simbolos": "Symbols",
        "category.Letras": "Letters",
        "copy.feedback": "Copied!",
        "link.more_emojis": "More emojis at:",
        "ariaHome": "Go to Home",
        "ariaEmojis": "Go to Emojis",
        "ariaMusic": "Go to Music",
        "ariaTraining": "Go to Training",
        "config.switch_language": "Switch Language",
        "config.title": "Configuration",
        "config.add_emoji.title": "Add Custom Emoji",
        "config.edit_emoji.title": "Edit Custom Emoji",
        "config.form.emoji": "Emoji",
        "config.form.emoji.placeholder": "🚀",
        "config.form.name": "Name",
        "config.form.name.placeholder": "Rocket",
        "config.form.tags": "Tags (comma separated)",
        "config.form.tags.placeholder": "space, vehicle",
        "config.form.add": "Add",
        "config.form.save": "Save",
        "config.form.cancel": "Cancel",
        "config.my_emojis": "My Emojis",
        "config.edit": "Edit",
        "config.delete": "Delete",
    },
};

export function LanguageProvider({ children }: { children: ReactNode }) {
    const navigate = useNavigate();
    const location = useLocation();

    // Derive language from URL
    const getLanguageFromPath = (path: string): Language => {
        if (path.startsWith("/en")) return "en";
        return "es";
    };

    const language = getLanguageFromPath(location.pathname);

    useEffect(() => {
        // Redirect /es to /
        if (location.pathname.startsWith("/es")) {
            navigate("/", { replace: true });
        }
    }, [location.pathname, navigate]);

    useEffect(() => {
        localStorage.setItem("language", language);
        document.documentElement.lang = language;
    }, [language]);

    const setLanguage = (lang: Language) => {
        if (lang !== language) {
            navigate(lang === "en" ? "/en" : "/");
        }
    };

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
