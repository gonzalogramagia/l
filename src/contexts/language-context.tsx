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
        "search.placeholder": "Buscar emoji por su nombre o sus tags...",
        "search.no_results": 'No se encontraron resultados para "{search}"',
        "category.Emojis": "Emojis",
        "category.Expresiones": "Expresiones",
        "category.Simbolos": "Símbolos",
        "category.Letras": "Letras",
        "copy.feedback": "¡Copiado!",
        "link.more_emojis": "Más emojis en",
        "ariaHome": "Ir a Today",
        "ariaEmojis": "Ya estás acá!",
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
        "config.form.tags.placeholder": "Espacio, Vehículo",
        "config.form.add": "Agregar",
        "config.form.save": "Guardar",
        "config.form.cancel": "Cancelar",
        "config.my_emojis": "Mis Emojis",
        "config.edit": "Editar",
        "config.delete": "Eliminar",
        "config.import_backup": "Importar Backup",
        "config.export_backup": "Exportar Backup",
    },
    en: {
        "search.placeholder": "Search emoji by name or tags...",
        "search.no_results": 'No results found for "{search}"',
        "category.Emojis": "Emojis",
        "category.Expresiones": "Expressions",
        "category.Simbolos": "Symbols",
        "category.Letras": "Letters",
        "copy.feedback": "Copied!",
        "link.more_emojis": "More emojis at:",
        "ariaHome": "Go to Today",
        "ariaEmojis": "You are here!",
        "ariaMusic": "Go to Music",
        "ariaTraining": "Go Work out!",
        "config.switch_language": "Switch Language",
        "config.title": "Configuration",
        "config.add_emoji.title": "Add Custom Emoji",
        "config.edit_emoji.title": "Edit Custom Emoji",
        "config.form.emoji": "Emoji",
        "config.form.emoji.placeholder": "🚀",
        "config.form.name": "Name",
        "config.form.name.placeholder": "Rocket",
        "config.form.tags": "Tags (comma separated)",
        "config.form.tags.placeholder": "Space, Vehicle",
        "config.form.add": "Add",
        "config.form.save": "Save",
        "config.form.cancel": "Cancel",
        "config.my_emojis": "My Emojis",
        "config.edit": "Edit",
        "config.delete": "Delete",
        "config.import_backup": "Import Backup",
        "config.export_backup": "Export Backup",
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

    // Handle initial redirect based on stored preference
    useEffect(() => {
        const storedLang = localStorage.getItem("language") as Language;
        if (!storedLang) return;

        // Verify if we are at root paths
        const isRoot = location.pathname === "/" || location.pathname === "/en";

        if (isRoot) {
            if (storedLang === "en" && location.pathname === "/") {
                navigate("/en", { replace: true });
            } else if (storedLang === "es" && location.pathname === "/en") {
                navigate("/", { replace: true });
            }
        }
    }, []); // Run only on mount to avoid conflicting with active navigation

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
