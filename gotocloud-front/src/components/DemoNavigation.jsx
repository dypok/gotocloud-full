import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { LayoutDashboard, MessageSquare, Home, Bot } from 'lucide-react';
import LanguageSelector from './LanguageSelector';

export default function DemoNavigation() {
    const location = useLocation();

    if (location.pathname === '/login') {
        return null;
    }

    return (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 w-[95%] max-w-4xl z-50 bg-zinc-900/90 backdrop-blur-md border border-zinc-700 p-1.5 rounded-full shadow-2xl flex items-center justify-between">

            {/* SECCIÓN IZQUIERDA: Logo de la marca */}
            <Link to="/" className="flex items-center gap-2 pl-4 hover:opacity-80 transition-opacity">
                <Bot className="text-orange-500" size={20} />
                <span className="font-bold text-zinc-100 tracking-tight hidden sm:block">GoToCloud</span>
            </Link>

            {/* SECCIÓN CENTRAL: Enlaces de Navegación */}
            <div className="flex items-center gap-1">
                <Link
                    to="/"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${location.pathname === '/'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                >
                    <Home size={14} />
                    <span className="hidden md:inline">Inicio</span>
                </Link>

                <Link
                    to="/chat"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${location.pathname === '/chat'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                >
                    <MessageSquare size={14} />
                    <span>Portal Cliente</span>
                </Link>

                <Link
                    to="/dashboard"
                    className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-medium transition-all ${location.pathname === '/dashboard'
                        ? 'bg-orange-500 text-white shadow-lg shadow-orange-500/20'
                        : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                        }`}
                >
                    <LayoutDashboard size={14} />
                    <span className="hidden md:inline">Intelligence Center</span>
                </Link>
            </div>

            {/* SECCIÓN DERECHA: Selector de Idiomas */}
            <div className="pr-1">
                <LanguageSelector />
            </div>

        </div>
    );
}