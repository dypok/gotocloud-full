import React, { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, ChevronDown, Check } from 'lucide-react';

const LANGUAGES = [
    { code: 'es', label: 'Español', flag: '🇨🇴', native: 'Español' },
    { code: 'pt', label: 'Português', flag: '🇧🇷', native: 'Português' },
    { code: 'en', label: 'English', flag: '🇺🇸', native: 'English' }
];

export default function LanguageSelector() {
    const { lang, setLang } = useLanguage();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    const currentLanguage = LANGUAGES.find(l => l.code === lang) || LANGUAGES[0];

    // Cerrar el popup si el usuario hace clic fuera de él
    useEffect(() => {
        function handleClickOutside(event) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    return (
        <div className="relative inline-block text-left" ref={dropdownRef}>
            {/* Botón Principal del Header */}
            <button
                type="button"
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-1.5 bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800 rounded-xl text-zinc-200 transition-all duration-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-orange-500/50"
            >
                <Globe size={14} className="text-zinc-400" />
                <span className="mr-0.5">{currentLanguage.flag}</span>
                <span className="font-mono uppercase tracking-wide">{currentLanguage.code}</span>
                <ChevronDown size={12} className={`text-zinc-500 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} />
            </button>

            {/* Popup Desplegable Flotante */}
            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 bg-zinc-900 border border-zinc-800 rounded-xl shadow-2xl z-[100] p-1 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-150">
                    <div className="px-2.5 py-1.5 border-b border-zinc-800/60 mb-1">
                        <span className="text-[10px] font-bold tracking-wider text-zinc-500 uppercase">
                            {lang === 'es' ? 'Idioma' : lang === 'pt' ? 'Idioma' : 'Language'}
                        </span>
                    </div>

                    <div className="space-y-0.5">
                        {LANGUAGES.map((item) => (
                            <button
                                key={item.code}
                                type="button"
                                onClick={() => {
                                    setLang(item.code);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${lang === item.code
                                    ? 'bg-orange-500/10 text-orange-400 font-medium'
                                    : 'text-zinc-300 hover:bg-zinc-800/80'
                                    }`}
                            >
                                <div className="flex items-center gap-2.5">
                                    <span className="text-base flex-shrink-0">{item.flag}</span>
                                    <span className="truncate">{item.native}</span>
                                </div>
                                {lang === item.code && <Check size={14} className="text-orange-500 flex-shrink-0" />}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
}