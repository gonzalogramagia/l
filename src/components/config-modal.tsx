
import { useState, useEffect } from "react";
import { X, Trash2, Plus, Pencil, Check, Wrench } from "lucide-react";
import { useCustomSymbols } from "../contexts/custom-symbols-context";
import { LanguageSwitch } from "./symbol-browser";
import { useLanguage } from "../contexts/language-context";

interface ConfigModalProps {
    lang: string;
    onClose: () => void;
    exportPath?: string;
    importPath?: string;
}

export default function ConfigModal({ onClose }: ConfigModalProps) {
    const { customSymbols, addCustomSymbol, editCustomSymbol, removeCustomSymbol } = useCustomSymbols();
    const { t } = useLanguage();
    const [editingSymbol, setEditingSymbol] = useState<string | null>(null); // Symbol being edited
    const [deleteConfirmation, setDeleteConfirmation] = useState<string | null>(null); // Symbol pending delete

    // Helper to get draft
    const getDraft = () => {
        if (typeof window === 'undefined') return null;
        try {
            const draft = localStorage.getItem("custom_emoji_draft");
            return draft ? JSON.parse(draft) : null;
        } catch (e) {
            console.error("Failed to parse draft", e);
            return null;
        }
    };

    const [symbol, setSymbol] = useState(() => getDraft()?.symbol || "");
    const [description, setDescription] = useState(() => getDraft()?.description || "");
    const [tags, setTags] = useState(() => getDraft()?.tags || "");

    // Save draft on change (only if not editing)
    useEffect(() => {
        if (!editingSymbol) {
            const draft = { symbol, description, tags };
            localStorage.setItem("custom_emoji_draft", JSON.stringify(draft));
        }
    }, [symbol, description, tags, editingSymbol]);

    const restoreDraft = () => {
        const draft = localStorage.getItem("custom_emoji_draft");
        if (draft) {
            try {
                const parsed = JSON.parse(draft);
                setSymbol(parsed.symbol || "");
                setDescription(parsed.description || "");
                setTags(parsed.tags || "");
            } catch (e) {
                setSymbol("");
                setDescription("");
                setTags("");
            }
        } else {
            setSymbol("");
            setDescription("");
            setTags("");
        }
        setEditingSymbol(null);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (!symbol.trim() || !description.trim()) return;

        if (editingSymbol) {
            editCustomSymbol(editingSymbol, { symbol, description, tags });
            restoreDraft(); // Restore draft after editing
        } else {
            addCustomSymbol({ symbol, description, tags });
            // Clear form and draft
            setSymbol("");
            setDescription("");
            setTags("");
        }
    };

    const handleEdit = (item: any) => {
        setSymbol(item.symbol);
        setDescription(item.description.es.main);
        setTags(item.tags?.es.join(", ") || "");
        setEditingSymbol(item.symbol);
    };

    const handleDelete = (symbolToDelete: string) => {
        if (deleteConfirmation === symbolToDelete) {
            removeCustomSymbol(symbolToDelete);
            setDeleteConfirmation(null);
        } else {
            setDeleteConfirmation(symbolToDelete);
            // Auto reset confirmation after 3 seconds
            setTimeout(() => setDeleteConfirmation(prev => prev === symbolToDelete ? null : prev), 3000);
        }
    };

    return (
        <div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="w-full max-w-md lg:max-w-2xl bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden animate-in zoom-in-95 duration-200 flex flex-col max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex items-center justify-between p-4 border-b border-zinc-100 dark:border-zinc-800">
                    <div className="flex items-center gap-2">
                        <Wrench className="w-5 h-5 text-zinc-900 dark:text-white scale-x-[-1]" />
                        <h2 className="text-lg font-semibold text-zinc-900 dark:text-white">
                            {t('config.title')}
                        </h2>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 text-zinc-500 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-full transition-colors cursor-pointer"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <div className="p-6 overflow-y-auto">
                    <div className="md:hidden mb-6 pb-6 border-b border-zinc-100 dark:border-zinc-800">
                        <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-3">
                            {t('config.switch_language')}
                        </h3>
                        <LanguageSwitch />
                    </div>

                    <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-4">
                        {editingSymbol ? t('config.edit_emoji.title') : t('config.add_emoji.title')}
                    </h3>

                    <form onSubmit={handleSubmit} className="mb-8">
                        <div className="flex flex-col lg:flex-row gap-4 items-end">
                            <div className="flex flex-row gap-4 w-full lg:contents">
                                <div className="flex-1">
                                    <label htmlFor="symbol" className="block text-xs font-medium text-zinc-500 mb-1">
                                        {t('config.form.emoji')}
                                    </label>
                                    <input
                                        id="symbol"
                                        type="text"
                                        value={symbol}
                                        maxLength={5}
                                        onChange={(e) => setSymbol(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder={t('config.form.emoji.placeholder')}
                                    />
                                </div>
                                <div className="flex-[2]">
                                    <label htmlFor="description" className="block text-xs font-medium text-zinc-500 mb-1">
                                        {t('config.form.name')}
                                    </label>
                                    <input
                                        id="description"
                                        type="text"
                                        value={description}
                                        onChange={(e) => setDescription(e.target.value)}
                                        className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                        placeholder={t('config.form.name.placeholder')}
                                    />
                                </div>
                            </div>
                            <div className="flex-[2] w-full lg:w-auto">
                                <label htmlFor="tags" className="block text-xs font-medium text-zinc-500 mb-1">
                                    {t('config.form.tags')}
                                </label>
                                <input
                                    id="tags"
                                    type="text"
                                    value={tags}
                                    onChange={(e) => setTags(e.target.value)}
                                    className="w-full p-2 rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-800 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:text-white"
                                    placeholder={t('config.form.tags.placeholder')}
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={!symbol || !description}
                                className="w-full lg:w-auto h-[42px] px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap cursor-pointer"
                            >
                                {editingSymbol ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                                <span className="lg:hidden">{editingSymbol ? t('config.form.save') : t('config.form.add')}</span>
                            </button>
                            {editingSymbol && (
                                <button
                                    type="button"
                                    onClick={restoreDraft}
                                    className="w-full lg:w-auto h-[42px] px-4 bg-zinc-200 dark:bg-zinc-800 hover:bg-zinc-300 dark:hover:bg-zinc-700 text-zinc-700 dark:text-zinc-300 rounded-lg transition-colors flex items-center justify-center gap-2 cursor-pointer whitespace-nowrap"
                                >
                                    <X className="w-4 h-4" />
                                    <span className="lg:hidden">{t('config.form.cancel')}</span>
                                </button>
                            )}
                        </div>
                    </form>

                    {customSymbols.length > 0 && (
                        <>
                            <h3 className="text-sm font-medium text-zinc-900 dark:text-white mb-4 pt-4 border-t border-zinc-100 dark:border-zinc-800">
                                {t('config.my_emojis')} ({customSymbols.length})
                            </h3>
                            <div className="space-y-2">
                                {customSymbols.map((item, index) => (
                                    <div key={`${item.symbol}-${index}`} className="flex items-center justify-between p-3 rounded-lg bg-zinc-50 dark:bg-zinc-800/50 group">
                                        <div className="flex items-center gap-4 flex-1 min-w-0">
                                            <span className="text-2xl shrink-0 w-16 text-center">{item.symbol}</span>
                                            <div className="flex flex-col gap-0.5 overflow-hidden">
                                                <span className="text-base font-medium text-zinc-900 dark:text-white truncate w-full">
                                                    {item.description.es.main}
                                                </span>
                                                {item.tags?.es && item.tags.es.length > 0 && (
                                                    <div className="flex items-center gap-2 overflow-hidden flex-wrap">
                                                        {item.tags.es.map((tag: string, i: number) => (
                                                            <span key={i} className="text-xs text-zinc-500 whitespace-nowrap">
                                                                #{tag}
                                                            </span>
                                                        ))}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-2 pl-2 shrink-0">
                                            <button
                                                onClick={() => handleEdit(item)}
                                                className="p-1.5 text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                                                title={t('config.edit')}
                                            >
                                                <Pencil className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(item.symbol)}
                                                className={`p-1.5 rounded opacity-0 group-hover:opacity-100 transition-all cursor-pointer ${deleteConfirmation === item.symbol
                                                    ? "text-red-600 bg-red-100 dark:bg-red-900/30 opacity-100"
                                                    : "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                    }`}
                                                title={t('config.delete')}
                                            >
                                                {deleteConfirmation === item.symbol ? (
                                                    <Check className="w-4 h-4" />
                                                ) : (
                                                    <Trash2 className="w-4 h-4" />
                                                )}
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
