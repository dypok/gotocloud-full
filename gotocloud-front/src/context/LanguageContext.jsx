import React, { createContext, useState, useContext, useEffect } from 'react';

const LanguageContext = createContext();

export function LanguageProvider({ children }) {
    // Intentar recuperar el idioma guardado, por defecto español
    const [lang, setLang] = useState(() => {
        return localStorage.getItem('gotocloud_lang') || 'es';
    });

    useEffect(() => {
        localStorage.setItem('gotocloud_lang', lang);
    }, [lang]);

    return (
        <LanguageContext.Provider value={{ lang, setLang }}>
            {children}
        </LanguageContext.Provider>
    );
}

// Hook personalizado para usar el idioma fácilmente en cualquier componente
export function useLanguage() {
    return useContext(LanguageContext);
}